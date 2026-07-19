const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
    },
    eventId: { type: String, required: true, index: true },
    eventTitle: { type: String, required: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    studentName: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },

    // Payment lifecycle. 'pending' is created before the student pays;
    // 'paid' is only ever set by the server after verifying the payment
    // (mock confirm endpoint today, real gateway webhook later) — never
    // set directly from a client-supplied flag.
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentRef: { type: String }, // gateway payment ID / mock reference

    // QR ticket — generated server-side only after payment is confirmed.
    qrToken: { type: String }, // signed token encoded in the QR
    qrDataUrl: { type: String }, // base64 PNG, cached so we don't regenerate

    // Set to true the first time the QR is scanned at entry, to prevent reuse.
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },

    emailSentAt: { type: Date }, // idempotency guard so we never double-send
  },
  { timestamps: true }
);

// One registration per student per event — also blocks double-charging.
registrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
