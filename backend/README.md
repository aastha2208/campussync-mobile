# CampusSync Backend

Express + MongoDB API for event registration, payment confirmation, and
signed QR ticket generation with email delivery via Resend.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, QR_SIGNING_SECRET, RESEND_API_KEY
npm run dev
```

You'll need:
- A free MongoDB Atlas cluster (atlas.mongodb.com) — paste the connection string into `MONGODB_URI`.
- A free Resend account (resend.com) — 3,000 emails/month free. Copy the API key into `RESEND_API_KEY`. Their sandbox `from` address (`onboarding@resend.dev`) works out of the box for testing; you'd verify your own domain for production sends.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/registrations` | Create a pending registration (before payment) |
| POST | `/api/payment/confirm` | Confirm payment → generates QR, emails ticket |
| POST | `/api/ticket/verify` | Door-scan: validate a QR token, mark it used |

### Example flow

```bash
# 1. Student starts registering
curl -X POST localhost:5000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{"eventId":"e1","eventTitle":"HackBMSCE 2025","studentEmail":"student@college.edu","studentName":"Aastha","amount":100}'
# -> { "registration": { "id": "...", "paymentStatus": "pending", ... } }

# 2. After payment succeeds (mock today, real gateway webhook later)
curl -X POST localhost:5000/api/payment/confirm \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"<id from step 1>","paymentRef":"mock_ref_123","eventDate":"Aug 20, 2026","venue":"Main Auditorium"}'
# -> generates QR, emails it to student@college.edu, returns registration with qrDataUrl

# 3. At the event entrance, scan the QR and POST its decoded token here
curl -X POST localhost:5000/api/ticket/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"<decoded QR content>"}'
# -> { "valid": true, ... }  the first time, { "valid": false, "reason": "already_used" } after
```

## Why it's built this way

- **Payment status only ever changes server-side.** The mobile app never tells the backend "mark this paid" directly — `confirmPayment` is the single choke point, designed so a real payment-gateway webhook can call it instead with zero logic changes.
- **QR tokens are signed (HMAC-SHA256), not random strings.** A forged or screenshotted QR with a tampered payload fails signature verification — see `src/utils/qrToken.test.js`.
- **Idempotent by design.** Payment gateways retry webhooks; this handles that by atomically flipping `pending → paid` (`findOneAndUpdate` with the old status in the filter) and only generating a QR / sending an email the first time either happens, no matter how many times `confirmPayment` is called for the same registration.
- **Email failure doesn't roll back payment.** If Resend is down, the student's payment still counts — the failure is logged for a manual resend rather than silently losing a paid registration.

## Next steps (not yet built)

- Swap the mock confirm step for a real Razorpay/Stripe webhook (verify the gateway's signature before calling the same `confirmPayment` logic).
- Rate-limit `/api/ticket/verify` and require an organizer auth token on it (right now anyone with the URL could hit it).
- A resend-email endpoint for the case where Resend fails and a student says they never got their ticket.
