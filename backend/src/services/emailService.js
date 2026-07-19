const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the "payment successful" ticket email with the QR embedded inline
 * (via Content-ID, not a hotlinked image — so it still renders if the
 * student is offline/on a flaky campus network) plus a plain-text fallback.
 */
async function sendTicketEmail({ to, studentName, eventTitle, eventDate, venue, ticketId, qrDataUrl }) {
  const qrBase64 = qrDataUrl.split(',')[1]; // strip "data:image/png;base64,"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="margin-bottom: 4px;">Payment Successful</h2>
      <p style="color: #555; margin-top: 0;">Your spot for <strong>${escapeHtml(eventTitle)}</strong> is confirmed.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #555;">Name</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(studentName)}</td></tr>
        <tr><td style="padding: 4px 0; color: #555;">Event</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(eventTitle)}</td></tr>
        <tr><td style="padding: 4px 0; color: #555;">Date</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(eventDate)}</td></tr>
        <tr><td style="padding: 4px 0; color: #555;">Venue</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(venue)}</td></tr>
        <tr><td style="padding: 4px 0; color: #555;">Ticket ID</td><td style="padding: 4px 0; text-align: right; font-family: monospace;">${escapeHtml(ticketId)}</td></tr>
      </table>

      <p style="color: #555; font-size: 13px;">Show this QR code at the entrance. It's single-use.</p>
      <img src="cid:qr-ticket" alt="Entry QR code" width="220" height="220" style="display:block; margin: 12px 0;" />

      <p style="color: #999; font-size: 12px; margin-top: 24px;">CampusSync — this ticket is tied to your registered email and cannot be transferred.</p>
    </div>
  `.trim();

  const text = [
    'Payment Successful',
    `Your spot for ${eventTitle} is confirmed.`,
    '',
    `Name: ${studentName}`,
    `Event: ${eventTitle}`,
    `Date: ${eventDate}`,
    `Venue: ${venue}`,
    `Ticket ID: ${ticketId}`,
    '',
    'Your QR code is attached as an image — please view this email in an HTML-capable client to see it.',
    'CampusSync — this ticket is tied to your registered email and cannot be transferred.',
  ].join('\n');

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `Payment confirmed — ${eventTitle}`,
    html,
    text,
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrBase64,
        content_id: 'qr-ticket',
      },
    ],
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendTicketEmail };
