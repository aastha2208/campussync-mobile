const QRCode = require('qrcode');

/**
 * Renders a signed ticket token as a QR code PNG, returned as a base64
 * data URL so it can be embedded inline in the email (see emailService)
 * and cached on the Registration document without needing file storage.
 */
async function generateQRDataUrl(token) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
  });
}

module.exports = { generateQRDataUrl };
