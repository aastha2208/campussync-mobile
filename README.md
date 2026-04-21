# CampusSync Mobile 📱

React Native mobile app for the CampusSync campus event management platform.  
Built for **BMSCE · 23CS4AEMAD · Mobile Application Development · Semester 4**

---

## ⚡ Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+ (check: `node --version`)
- Expo CLI: `npm install -g expo-cli`
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
- Press `a` for Android emulator, `i` for iOS simulator

### 3. Connect to Your Backend (Optional)
Open `src/services/api.js` and update:
```js
const BASE_URL = 'http://YOUR_MACHINE_IP:3000';
// e.g. 'http://192.168.1.5:3000'
```
> **Note:** The app includes full mock data and works offline without the backend.  
> To find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 🗂 Project Structure

```
campussync-mobile/
├── App.js                          # Root entry, NavigationContainer + Providers
├── src/
│   ├── theme/
│   │   └── index.js                # Colors, spacing, typography, shadows
│   ├── context/
│   │   └── AuthContext.js          # Global auth state with AsyncStorage
│   ├── services/
│   │   └── api.js                  # All API calls + mock fallback data
│   ├── navigation/
│   │   └── RootNavigator.js        # Auth stack + Bottom tab navigator
│   ├── screens/
│   │   ├── SplashScreen.js         # Animated app launch screen
│   │   ├── auth/
│   │   │   ├── LoginScreen.js      # Email/password login with validation
│   │   │   └── RegisterScreen.js   # Full registration with role selector
│   │   ├── home/
│   │   │   └── HomeScreen.js       # Discover events, categories, featured
│   │   ├── events/
│   │   │   ├── EventDetailScreen.js # Full event info + register CTA
│   │   │   ├── CreateEventScreen.js # Event creation form
│   │   │   └── SearchScreen.js     # Search + filter events
│   │   ├── myevents/
│   │   │   └── MyEventsScreen.js   # Registered/Hosted/Archived tabs
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.js # Notification center
│   │   └── profile/
│   │       └── ProfileScreen.js    # User profile, settings, logout
│   └── components/
│       └── EventCard.js            # Reusable card (featured/default/compact)
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#080818` (deep dark blue) |
| Primary | `#8B5CF6` (purple) |
| Secondary | `#3B82F6` (blue) |
| Accent | `#10B981` (green) |
| Danger | `#EF4444` (red) |
| Card BG | `rgba(255,255,255,0.05)` |
| Card Border | `rgba(255,255,255,0.10)` |

All design tokens are in `src/theme/index.js`.

---

## 📱 Screens & Features

| Screen | Features |
|--------|----------|
| **Splash** | Animated logo reveal, fade-in |
| **Login** | Validation, shake animation, JWT auth |
| **Register** | Role selector (Student/Organizer), branch/semester |
| **Home** | Greeting, stats, featured carousel, category filter, event list |
| **Event Detail** | Hero image, capacity bar, register/unregister, share |
| **Search** | Real-time search, category filter |
| **Create Event** | Full form, category picker, validation |
| **My Events** | Registered / Hosting / Archived tabs |
| **Notifications** | Unread badges, mark as read, types |
| **Profile** | Edit profile, notification toggles, logout |

---

## 🔌 Backend API Endpoints

The app connects to the existing CampusSync Node.js/Express backend:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/events               ?category=&search=
GET    /api/events/:id
POST   /api/events               (create)
POST   /api/events/:id/register
DELETE /api/events/:id/register
GET    /api/events/my/registered
GET    /api/events/my/hosted
PATCH  /api/events/:id/archive
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
GET    /api/users/profile
PUT    /api/users/profile
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~51` | Managed workflow, build tools |
| `@react-navigation/native-stack` | Screen navigation |
| `@react-navigation/bottom-tabs` | Tab bar |
| `expo-linear-gradient` | Beautiful gradients |
| `expo-blur` | Frosted glass tab bar |
| `@react-native-async-storage` | Persist JWT token |
| `axios` | HTTP client for API |
| `react-native-reanimated` | Smooth animations |

---

## 🎓 Course Outcomes Addressed

| CO | How |
|----|-----|
| **CO1** – UI/UX Design | Dark glassmorphic theme, consistent design system, Figma-ready screens |
| **CO2** – Mobile App Development | React Native, navigation, state management, REST API integration |
| **CO3** – Presentation & Report | This README + working demo app |

---

## 👥 Team — BMSCE CSE Sem 4
- Built with React Native (Expo Managed Workflow)
- Connected to CampusSync backend (Node.js + Express + MongoDB)
- Course: 23CS4AEMAD · Mobile Application Development
