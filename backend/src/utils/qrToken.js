const crypto = require('crypto');

/**
 * Signed ticket tokens.
 *
 * Why not just encode a random string in the QR? Anyone could screenshot
 * or hand-forge an arbitrary string and claim it's a valid ticket. Instead
 * we encode a payload (ticketId + eventId + email) plus an HMAC signature
 * over that payload using a server-only secret. The door-scanning screen
 * can then verify the signature before trusting anything the QR claims —
 * without needing a DB round trip just to catch obviously-forged tokens.
 * (We still check the DB too, to catch replay/re-use — see verifyController.)
 */

function sign(payload) {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) throw new Error('QR_SIGNING_SECRET is not set');

  const json = JSON.stringify(payload);
  const payloadB64 = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

function verify(token) {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) throw new Error('QR_SIGNING_SECRET is not set');

  const parts = String(token).split('.');
  if (parts.length !== 2) return { valid: false, reason: 'malformed_token' };

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  // Constant-time comparison to avoid timing side-channels.
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: 'bad_signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'bad_payload' };
  }
}

module.exports = { sign, verify };
