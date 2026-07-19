const Registration = require('../models/Registration');
const qrToken = require('../utils/qrToken');
const { generateQRDataUrl } = require('../utils/generateQR');
const { sendTicketEmail } = require('../services/emailService');

/**
 * Step 1: create a pending registration before the student pays.
 * Nothing QR/email related happens here — that only happens after
 * payment is confirmed server-side, in confirmPayment below.
 */
async function createRegistration(req, res) {
  try {
    const { eventId, eventTitle, studentEmail, studentName, amount } = req.body;
    if (!eventId || !eventTitle || !studentEmail || !studentName) {
      return res.status(400).json({ error: 'eventId, eventTitle, studentEmail, studentName are required' });
    }

    const existing = await Registration.findOne({ eventId, studentEmail: studentEmail.toLowerCase() });
    if (existing) {
      return res.status(200).json({ registration: toPublicRegistration(existing) });
    }

    const registration = await Registration.create({
      eventId,
      eventTitle,
      studentEmail: studentEmail.toLowerCase(),
      studentName,
      amount: amount || 0,
    });

    return res.status(201).json({ registration: toPublicRegistration(registration) });
  } catch (err) {
    console.error('[createRegistration]', err);
    return res.status(500).json({ error: 'Failed to create registration' });
  }
}

/**
 * Step 2: confirm payment.
 *
 * Today this is a MOCK confirmation (simulates a payment gateway telling us
 * "it succeeded"). When you wire up a real gateway (Razorpay/Stripe), this
 * same function is what your webhook handler should call after verifying
 * the webhook signature — the logic below (atomic status flip, QR gen,
 * idempotent email) doesn't change either way.
 *
 * Idempotency: payment gateways retry webhooks, and users double-tap
 * buttons. findOneAndUpdate with paymentStatus:'pending' in the filter
 * means only the FIRST request that reaches this line actually flips the
 * status — any concurrent/duplicate request sees a null match and falls
 * through to "already processed", returning the existing ticket instead
 * of generating a second QR or sending a second email.
 */
async function confirmPayment(req, res) {
  try {
    const { registrationId, paymentRef } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'registrationId is required' });
    }

    const justConfirmed = await Registration.findOneAndUpdate(
      { _id: registrationId, paymentStatus: 'pending' },
      { paymentStatus: 'paid', paymentRef: paymentRef || `mock_${Date.now()}` },
      { new: true }
    );

    let registration = justConfirmed;
    let alreadyProcessed = false;

    if (!registration) {
      // Either it doesn't exist, or it was already confirmed by a
      // previous/concurrent request — tell those apart.
      registration = await Registration.findById(registrationId);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      if (registration.paymentStatus !== 'paid') {
        return res.status(409).json({ error: `Registration is in '${registration.paymentStatus}' state, cannot confirm` });
      }
      alreadyProcessed = true;
    }

    // Generate the QR + send email only once, even under retries.
    if (!registration.qrToken) {
      const token = qrToken.sign({
        ticketId: registration.ticketId,
        eventId: registration.eventId,
        email: registration.studentEmail,
      });
      const qrDataUrl = await generateQRDataUrl(token);
      registration.qrToken = token;
      registration.qrDataUrl = qrDataUrl;
      await registration.save();
    }

    if (!registration.emailSentAt) {
      try {
        await sendTicketEmail({
          to: registration.studentEmail,
          studentName: registration.studentName,
          eventTitle: registration.eventTitle,
          eventDate: req.body.eventDate || 'See event page',
          venue: req.body.venue || 'See event page',
          ticketId: registration.ticketId,
          qrDataUrl: registration.qrDataUrl,
        });
        registration.emailSentAt = new Date();
        await registration.save();
      } catch (emailErr) {
        // Payment already succeeded — don't fail the request over email
        // delivery. Log it so it's visible for a retry/resend job.
        console.error('[confirmPayment] email send failed:', emailErr.message);
      }
    }

    return res.status(200).json({
      alreadyProcessed,
      registration: toPublicRegistration(registration),
    });
  } catch (err) {
    console.error('[confirmPayment]', err);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
}

/**
 * Door-scan verification: checks the HMAC signature first (catches forged/
 * tampered QRs without a DB hit), then checks the DB for existence + marks
 * the ticket used so the same QR can't be scanned twice.
 */
async function verifyTicket(req, res) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false, reason: 'missing_token' });

    const result = qrToken.verify(token);
    if (!result.valid) {
      return res.status(400).json({ valid: false, reason: result.reason });
    }

    const registration = await Registration.findOne({ ticketId: result.payload.ticketId });
    if (!registration || registration.qrToken !== token) {
      return res.status(404).json({ valid: false, reason: 'ticket_not_found' });
    }
    if (registration.paymentStatus !== 'paid') {
      return res.status(403).json({ valid: false, reason: 'not_paid' });
    }
    if (registration.checkedIn) {
      return res.status(409).json({ valid: false, reason: 'already_used', checkedInAt: registration.checkedInAt });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    return res.status(200).json({ valid: true, registration: toPublicRegistration(registration) });
  } catch (err) {
    console.error('[verifyTicket]', err);
    return res.status(500).json({ valid: false, reason: 'server_error' });
  }
}

function toPublicRegistration(reg) {
  return {
    id: reg._id,
    ticketId: reg.ticketId,
    eventId: reg.eventId,
    eventTitle: reg.eventTitle,
    studentEmail: reg.studentEmail,
    studentName: reg.studentName,
    paymentStatus: reg.paymentStatus,
    qrDataUrl: reg.qrDataUrl,
    checkedIn: reg.checkedIn,
  };
}

module.exports = { createRegistration, confirmPayment, verifyTicket };
