# CampusSync 📱

A campus event management mobile app for **BMS College of Engineering**.
Students discover and register for events across 6 clubs. Club admins create
and manage their own events with real-time venue conflict detection.

Built for **23CS4AEMAD · Mobile Application Development · 4th Semester CSE**

---

## 👥 Team — BMSCE CSE Sem 4
- **Tanishk Kar**
- **Tatavarthi Chiranjeevi Sriram**
- **Aastha Sharma K M**
- **Aditi Kamath A**

---

## ✨ Highlights

- 🔐 **Real authentication** with password persistence across app restarts
- 🏫 **6 clubs** (IEEE, AI/ML, Cultural, Sports, Photography, Literary) × **2 admins each = 12 admin accounts**, each with unique secure passwords
- 📅 **18 sample events** spread across all clubs with dates, time ranges, venues, and pricing
- ⚠️ **Real-time room conflict detection** with mandatory 1-hour buffer between events at the same venue
- 💳 **UPI QR-code payment flow** for paid events with 5-minute timer and digital receipt
- 🔎 **Live search with autocomplete**, recent searches, and quick filters
- 🗓️ **Toggleable calendar view** with colour-coded event dots per category
- 🎓 **Role-based permissions** — students browse & register, admins create & manage only their own club's events
- 📊 **Admin Statistics dashboard** with per-event registered-student list and CSV export
- 🌗 **Custom dark-mode design system** with consistent tokens, gradients, and animations

---

## ⚡ Quick Setup (5 minutes)

### Prerequisites

- Node.js 18+ (check: `node --version`)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Install Dependencies

```bash
cd campussync-mobile
npm install
```

### 2. Start the App

```bash
npx expo start
```

- Scan the QR code with **Expo Go** (Android) or **Camera app** (iOS)
- Or press `w` for web, `a` for Android emulator, `i` for iOS simulator

### 3. Connect to Your Backend (Optional)

Open `src/services/api.js` and update:

```js
const BASE_URL = 'http://YOUR_MACHINE_IP:3000';
```

> **Note:** The app ships with full mock data and an in-memory database with AsyncStorage persistence, so it works completely offline without a backend server.

---

## 🔑 Demo Credentials

### Pre-Registered Admin Accounts (12 total)

| Club | Email | Password |
|------|-------|----------|
| IEEE | `ieee.admin1@bmsce.ac.in` | `ieee1.bms@1946` |
| IEEE | `ieee.admin2@bmsce.ac.in` | `ieee2.bms@1946` |
| AI/ML | `aiml.admin1@bmsce.ac.in` | `aiml1.bms@1946` |
| AI/ML | `aiml.admin2@bmsce.ac.in` | `aiml2.bms@1946` |
| Cultural | `cult.admin1@bmsce.ac.in` | `cult1.bms@1946` |
| Cultural | `cult.admin2@bmsce.ac.in` | `cult2.bms@1946` |
| Sports | `spo.admin1@bmsce.ac.in` | `spo1.bms@1946` |
| Sports | `spo.admin2@bmsce.ac.in` | `spo2.bms@1946` |
| Photography | `photo.admin1@bmsce.ac.in` | `photo1.bms@1946` |
| Photography | `photo.admin2@bmsce.ac.in` | `photo2.bms@1946` |
| Literary | `lit.admin1@bmsce.ac.in` | `lit1.bms@1946` |
| Literary | `lit.admin2@bmsce.ac.in` | `lit2.bms@1946` |

### Student Account

Students self-register from the Welcome screen. Any valid `@bmsce.ac.in` email works.

---

## 🗂 Project Structure

```
campussync-mobile/
├── App.js                                  # Root entry, NavigationContainer + providers
├── src/
│   ├── theme/
│   │   └── index.js                        # Colors, spacing, typography, gradients
│   ├── context/
│   │   └── AuthContext.js                  # Global auth state with AsyncStorage
│   ├── services/
│   │   └── api.js                          # All APIs + mock data + persistence layer
│   ├── navigation/
│   │   └── RootNavigator.js                # Auth stack + bottom tab navigator
│   ├── components/
│   │   ├── EventCard.js                    # Featured / default / compact variants
│   │   ├── CalendarView.js                 # Monthly grid with event dots
│   │   └── EmptyState.js                   # Reusable empty-state component
│   └── screens/
│       ├── auth/
│       │   ├── WelcomeScreen.js            # First-launch welcome with Sign Up / Login
│       │   ├── LoginScreen.js              # Role selector, club picker, validation
│       │   └── RegisterScreen.js           # Strong-password meter, branch/semester dropdowns
│       ├── home/
│       │   └── HomeScreen.js               # Discover events, filters, calendar, autocomplete search
│       ├── events/
│       │   ├── EventDetailScreen.js        # Full event info + register / pay CTA
│       │   ├── CreateEventScreen.js        # Admin-only, date/time/venue pickers, conflict checker
│       │   └── PaymentScreen.js            # UPI QR + 5-min timer + receipt
│       ├── admin/
│       │   ├── AdminStatsScreen.js         # Club statistics dashboard
│       │   └── EventStudentsScreen.js      # Per-event registered student list + CSV export
│       ├── myevents/
│       │   └── MyEventsScreen.js           # Registered / Hosting / Archived tabs
│       ├── notifications/
│       │   └── NotificationsScreen.js      # Notification center with unread badges
│       └── profile/
│           └── ProfileScreen.js            # User profile, menus, sign out
```

---

## 📱 Screens & Features

| Screen | Features |
|--------|----------|
| **Welcome** | First-launch screen with "Sign Up" / "Login" routing |
| **Login** | Role selector (Student / Admin), club picker for admins, validation, shake animation |
| **Register** | Strong-password meter, branch dropdown (14 BMSCE branches), semester dropdown |
| **Home** | Personalized stats, autocomplete search, category filters, toggleable calendar view, event reminders |
| **Event Detail** | Hero image, capacity bar, time-range display, register/unregister, share, admin-only delete |
| **Create Event** | Admin-only, locked to admin's club, calendar/time/venue pickers, live conflict checker |
| **Payment** | UPI QR code (deterministic 25×25 pseudo-QR with corner finders), 5-min timer, receipt |
| **My Events** | Registered / Hosting / Archived tabs with personalized stats |
| **Admin Stats** | Club statistics with summary cards + per-event drill-down |
| **Event Students** | Searchable & sortable list of registered students with CSV export |
| **Notifications** | Auto-generated when new events are posted to your subscribed clubs |
| **Profile** | Avatar, role/branch badges, scrollable menu, info modals (About / Help / Privacy / Terms) |

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

If a conflict is detected:
- 🔴 Red banner appears below the venue field showing the conflicting event, club, and time range
- ❌ Submit button is disabled until the conflict is resolved
- ⚠️ Alert popup explains the 1-hour buffer rule

### Example

IEEE has an event at `PJ Auditorium 1` from **10:00 AM – 1:00 PM** on May 24.
An AI/ML admin trying to book the same venue:

| Start Time | Result |
|------------|--------|
| 10:00 AM | ❌ overlaps |
| 11:00 AM | ❌ overlaps |
| 12:00 PM | ❌ overlaps |
| 1:00 PM | ❌ no buffer |
| 1:30 PM | ❌ no buffer |
| **2:00 PM** | ✅ accepted (exactly 1 hour after) |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#080818` (deep dark blue) |
| Card BG | `rgba(255,255,255,0.05)` |
| Card Border | `rgba(255,255,255,0.10)` |
| Primary | `#8B5CF6` (purple) |
| Secondary | `#3B82F6` (blue) |
| Accent | `#10B981` (green) |
| Warning | `#F59E0B` (orange) |
| Danger | `#EF4444` (red) |

All design tokens live in `src/theme/index.js`.

---

## 🔌 Backend API Endpoints

The app connects to a Node.js/Express backend, with full mock fallback if offline:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/events                ?category=&club=&search=
GET    /api/events/:id
POST   /api/events                (admin only — create)
DELETE /api/events/:id            (admin only — delete own club's events)
POST   /api/events/:id/register
DELETE /api/events/:id/register
GET    /api/events/my/registered
GET    /api/events/my/hosted
GET    /api/events/:id/students   (admin only)
POST   /api/events/check-conflict (live conflict checker)
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/users/profile
PUT    /api/users/profile
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~54` | Managed workflow, build tools |
| `@react-navigation/native-stack` | Screen navigation |
| `@react-navigation/bottom-tabs` | Tab bar |
| `expo-linear-gradient` | Gradients on buttons and headers |
| `@react-native-async-storage/async-storage` | Persist auth + registered users |
| `axios` | HTTP client for backend API |
| `react-native-reanimated` | Smooth animations |
| `@expo/vector-icons` (Ionicons) | Icon library |
| `react-native-safe-area-context` | Safe area handling |

---

## 🎓 Course Outcomes Addressed

| CO | How |
|----|-----|
| **CO1** – UI/UX Design | Dark-mode design system, consistent tokens, custom components, animations, empty states |
| **CO2** – Mobile App Development | React Native (Expo SDK 54), 15+ screens, navigation, state management, REST API integration, AsyncStorage persistence |
| **CO3** – Presentation & Report | This README + live demo with student and admin flows |

---

## 🚀 Tech Stack

- **Framework:** React Native (Expo Managed Workflow, SDK 54)
- **Language:** JavaScript (ES2022+)
- **Navigation:** React Navigation (native-stack + bottom-tabs)
- **State:** React Context API + AsyncStorage for persistence
- **Backend:** Node.js + Express + MongoDB (separate repo, with mock fallback)
- **Platform support:** iOS, Android, Web

---

## 📄 License

Educational project for BMS College of Engineering, Semester 4 — 2026.
