# CampusSync 📱

A full-stack campus event management platform for **BMS College of Engineering** —
a React Native (Expo) mobile app backed by a real Node.js/Express/MongoDB
server. Students discover and register for events across 6 clubs with
UPI-style payment and signed QR tickets emailed automatically; club admins
create and manage their own events with real-time venue conflict detection.

---

## 👤 About this project

This project **originated as a 4-person team submission** for
**23CS4AEMAD · Mobile Application Development · 4th Semester CSE** at BMSCE
(team: Tanishk Kar, Tatavarthi Chiranjeevi Sriram, Aastha Sharma K M, Aditi
Kamath A) — that submission covered the mobile app's UI, navigation, and
mock data layer.

**Aastha Sharma K M independently extended the project afterward** with a
production backend and supporting engineering work not part of the original
coursework:

- A real Node.js/Express/MongoDB backend, **deployed live**
- Payment confirmation → signed (HMAC) QR ticket generation → automated
  email delivery, with idempotent request handling
- Server-side authentication for admin accounts (bcrypt-hashed passwords +
  JWT), replacing the original client-side mock credentials
- A real, club-filterable notification system (new events, deadline
  reminders, payment confirmations)
- A full light/dark theming system across all 20+ screens
- Automated tests (backend + mobile) with GitHub Actions CI
- Assorted bug fixes (Android keyboard handling, registration persistence
  across logout, a crash in the notifications screen)

---

## ✨ Highlights

- 💳 **Real payment → QR ticket → email pipeline** — signed HMAC tokens (not random strings), idempotent against retries, delivered via Resend
- 🔐 **Server-side admin authentication** — bcrypt-hashed passwords in MongoDB, JWT issuance, no credentials shipped in the client bundle
- 🔔 **Real notification system** — new event broadcasts, dynamically computed deadline reminders, payment confirmations, filterable by club
- ⚠️ **Real-time room conflict detection** with a mandatory 1-hour buffer between events at the same venue — unit tested (see Testing below)
- 🌗 **Light/dark theme toggle** across the entire app, persisted across sessions
- 🏫 **6 clubs** (IEEE, AI/ML, Cultural, Sports, Photography, Literary) with role-based student/admin access
- 📅 **18 sample events** spread across all clubs with dates, time ranges, venues, and pricing
- 🔎 **Live search with autocomplete**, recent searches, and quick filters
- 🗓️ **Toggleable calendar view** with colour-coded event dots per category
- 📊 **Admin Statistics dashboard** with per-event registered-student list and CSV export
- ✅ **Automated tests + CI** — Jest on both the backend and the mobile app, running on every push via GitHub Actions

---

## 🌐 Live Backend

The backend is deployed on Render:
**https://campussync-backend-pzqp.onrender.com**

> This is a free-tier instance — it spins down after ~15 minutes of
> inactivity, so the first request after idle time can take 30–60 seconds
> to respond while it wakes up. Subsequent requests are fast.

---

## ⚡ Quick Setup — Mobile App (5 minutes)

### Prerequisites

- Node.js 18+ (check: `node --version`)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Install Dependencies

```bash
cd campussync-mobile
npm install --legacy-peer-deps
```

### 2. Start the App

```bash
npx expo start
```

- Scan the QR code with **Expo Go** (Android) or **Camera app** (iOS)
- Or press `w` for web, `a` for Android emulator, `i` for iOS simulator

### 3. Backend connection

`src/services/api.js` already points at the live backend above. Non-auth,
non-payment features (browsing events, registering, notifications, etc.)
also work fully offline via an in-memory mock + AsyncStorage persistence,
so the app is usable even without any backend connection.

---

## ⚙️ Quick Setup — Backend (run locally)

See [`backend/README.md`](backend/README.md) for full details. Short version:

```bash
cd backend
npm install
cp .env.example .env   # fill in your own MongoDB URI, JWT secret, Resend key, etc.
npm run seed:admins    # loads admin accounts with bcrypt-hashed passwords
npm run dev
```

---

## 🔑 Demo Credentials

### Admin accounts (12 total — 2 per club)

Admin passwords are **bcrypt-hashed server-side in MongoDB**, not shipped
anywhere in this repo (that used to be the case — see the security notes
above). To get working demo admin logins:

1. Copy `backend/seed-data/admins.example.json` to `backend/seed-data/admins.json`
2. Fill in your own passwords for each of the 12 listed accounts (emails/clubs already provided)
3. Run `npm run seed:admins`

`backend/seed-data/admins.json` is gitignored — it never gets committed, by design.

### Student account

Students self-register from the Welcome screen. Any valid `@bmsce.ac.in` email works.

---

## 🗂 Project Structure

```
campussync-mobile/
├── App.js                                  # Root entry, providers (Auth, Theme), NavigationContainer
├── src/
│   ├── theme/
│   │   └── index.js                        # Light + dark palettes, spacing, typography
│   ├── context/
│   │   ├── AuthContext.js                  # Global auth state with AsyncStorage
│   │   └── ThemeContext.js                 # Light/dark theme state + persistence
│   ├── services/
│   │   └── api.js                          # Auth, events, payments, notifications — real + mock fallback
│   │   └── api.test.js                     # Jest tests: password strength, room-conflict algorithm
│   ├── navigation/
│   │   └── RootNavigator.js                # Auth stack + bottom tab navigator
│   ├── components/
│   │   ├── EventCard.js
│   │   ├── CalendarView.js
│   │   └── EmptyState.js
│   └── screens/                            # 20+ screens across auth, home, events, admin, profile, notifications
├── backend/
│   ├── src/
│   │   ├── server.js                       # Express entrypoint
│   │   ├── models/                         # Admin, Registration (Mongoose)
│   │   ├── controllers/                    # authController, paymentController (+ tests)
│   │   ├── routes/                         # /api/auth, /api/registrations, /api/payment, /api/ticket
│   │   ├── services/                       # emailService (Resend)
│   │   └── utils/                          # qrToken (HMAC sign/verify, + tests), generateQR
│   └── seed-data/                          # Admin seed data (gitignored — see Demo Credentials)
└── .github/workflows/                      # CI: backend-tests.yml, mobile-tests.yml
```

---

## 🎯 Flagship Feature: Room Conflict Detection

When an admin creates an event, the venue dropdown is checked in real-time
against all existing events:

1. **Same venue** filter (case-insensitive match)
2. **Same date** filter
3. **Time range overlap** test using interval-overlap math:
   `start1 < end2 + buffer AND start2 - buffer < end1`
4. **Mandatory 1-hour buffer** on both sides of every existing event
5. **Cross-club enforcement** — works across all clubs, not just the admin's own

Covered by unit tests in `src/services/api.test.js`, including the buffer
edge case specifically (a booking starting inside the 1-hour buffer window
is correctly rejected; one starting just outside it is correctly allowed).

If a conflict is detected:
- 🔴 Red banner appears below the venue field showing the conflicting event, club, and time range
- ❌ Submit button is disabled until the conflict is resolved
- ⚠️ Alert popup explains the 1-hour buffer rule

---

## 💳 Payment → QR Ticket → Email Flow

1. Student registers for a paid event — creates a `pending` registration
2. On payment confirmation, the backend atomically flips `pending → paid`
   (idempotent — safe against duplicate/retry requests)
3. A ticket token is signed server-side with HMAC-SHA256 and encoded into a
   QR code — not a random string, so it can't be forged or screenshotted-and-reused
4. A confirmation email with the QR embedded inline is sent via Resend
5. At the door, `/api/ticket/verify` checks the signature and marks the
   ticket used, preventing re-entry with the same QR

See `backend/README.md` for the full endpoint walkthrough.

---

## 🎨 Design System

Two full themes, toggleable from the Profile screen, persisted across sessions:

| Token | Dark (Purple + Blue) | Light (Sky Blue + White) |
|-------|----------------------|---------------------------|
| Background | `#080818` | `#F5FAFF` |
| Primary | `#8B5CF6` | `#0EA5E9` |
| Secondary | `#3B82F6` | `#38BDF8` |
| Accent | `#10B981` | `#10B981` |

All design tokens live in `src/theme/index.js`; theme state is managed via `src/context/ThemeContext.js`.

---

## 🔌 API Endpoints

**Real, backend-verified endpoints** (`backend/src/routes/`):

```
POST   /api/auth/login            Admin login — bcrypt password check, JWT issuance
POST   /api/registrations         Create a pending event registration
POST   /api/payment/confirm       Confirm payment → generate signed QR → send email
POST   /api/ticket/verify         Door-scan: validate a QR token, mark it used
```

**Client-side mock fallback** (`src/services/api.js`) covers everything
else — browsing/creating/deleting events, student self-registration,
notifications, and profile — with an in-memory store + AsyncStorage
persistence, so the app remains fully usable without a backend connection.

---

## ✅ Testing & CI

```bash
# Mobile app tests
npm test

# Backend tests
cd backend && npm test
```

- **Backend (9 tests):** HMAC QR token signing/verification (including
  forged-signature and wrong-secret rejection), admin login controller
  (missing credentials, unknown admin, wrong password, success path)
- **Mobile app (9 tests):** password strength scoring, room-conflict
  detection (no conflict, direct overlap, buffer-window edge case, cross-venue isolation)
- **CI:** `.github/workflows/backend-tests.yml` and `mobile-tests.yml` run
  the respective suites on every push to `main`

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~54` | Managed workflow, build tools |
| `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` | Navigation |
| `expo-linear-gradient` | Gradients on buttons and headers |
| `@react-native-async-storage/async-storage` | Local persistence |
| `axios` | HTTP client |
| `react-native-reanimated` | Animations |
| `express`, `mongoose` | Backend API + MongoDB ODM |
| `bcryptjs`, `jsonwebtoken` | Admin password hashing + auth tokens |
| `qrcode` | Server-side QR image generation |
| `resend` | Transactional email delivery |
| `jest`, `jest-expo`, `supertest` | Testing |

---

## 🎓 Course Outcomes Addressed (original coursework scope)

| CO | How |
|----|-----|
| **CO1** – UI/UX Design | Light/dark design system, consistent tokens, custom components, animations, empty states |
| **CO2** – Mobile App Development | React Native (Expo SDK 54), 20+ screens, navigation, state management, REST API integration, AsyncStorage persistence |
| **CO3** – Presentation & Report | This README + live demo with student and admin flows |

---

## 🚀 Tech Stack

- **Frontend:** React Native (Expo Managed Workflow, SDK 54), JavaScript (ES2022+)
- **Navigation:** React Navigation (native-stack + bottom-tabs)
- **State:** React Context API + AsyncStorage
- **Backend:** Node.js, Express, MongoDB (Atlas), deployed on Render
- **Auth & Security:** bcrypt password hashing, JWT
- **Payments/Ticketing:** HMAC-signed QR tokens, `qrcode` generation
- **Email:** Resend
- **Testing:** Jest (backend + mobile), GitHub Actions CI
- **Platform support:** iOS, Android, Web

---

## 📄 License

Originated as coursework for BMS College of Engineering, Semester 4 — 2026.
Independently extended for personal/portfolio use — see "About this project" above.
