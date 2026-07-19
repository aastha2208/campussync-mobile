process.env.QR_SIGNING_SECRET = 'test_secret_do_not_use_in_prod';
const qrToken = require('./qrToken');

describe('qrToken sign/verify', () => {
  const payload = { ticketId: 't1', eventId: 'e1', email: 'a@b.com' };

  test('verifies a token it just signed', () => {
    const token = qrToken.sign(payload);
    const result = qrToken.verify(token);
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual(payload);
  });

  test('rejects a tampered signature', () => {
    const token = qrToken.sign(payload);
    const tampered = token.slice(0, -3) + 'xyz';
    const result = qrToken.verify(tampered);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('bad_signature');
  });

  test('rejects a tampered payload (e.g. swapped ticketId)', () => {
    const token = qrToken.sign(payload);
    const [payloadB64, signature] = token.split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ ...payload, ticketId: 'stolen' })).toString('base64url');
    const forgedToken = `${forgedPayload}.${signature}`;
    const result = qrToken.verify(forgedToken);
    expect(result.valid).toBe(false);
  });

  test('rejects a malformed token', () => {
    const result = qrToken.verify('not-a-real-token');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('malformed_token');
  });

  test('rejects a token signed with a different secret', () => {
    const token = qrToken.sign(payload);
    process.env.QR_SIGNING_SECRET = 'a_completely_different_secret';
    const result = qrToken.verify(token);
    expect(result.valid).toBe(false);
    process.env.QR_SIGNING_SECRET = 'test_secret_do_not_use_in_prod';
  });
});
