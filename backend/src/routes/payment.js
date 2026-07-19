const express = require('express');
const router = express.Router();
const { createRegistration, confirmPayment, verifyTicket } = require('../controllers/paymentController');

router.post('/registrations', createRegistration);   // Step 1: create pending registration
router.post('/payment/confirm', confirmPayment);      // Step 2: confirm payment -> QR + email
router.post('/ticket/verify', verifyTicket);           // Door scan: validate + mark used

module.exports = router;
