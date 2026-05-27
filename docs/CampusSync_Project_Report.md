# CampusSync Project Report

**Project:** CampusSync - Campus Event Management Mobile App  
**Institution:** BMS College of Engineering  
**Course:** 23CS4AEMAD - Mobile Application Development, 4th Semester CSE  
**Team:** Tanishk Kar, Tatavarthi Chiranjeevi Sriram, Aastha Sharma K M, Aditi Kamath A

---

## 1. Executive Summary

CampusSync is a React Native mobile application built to simplify event discovery, registration, and administration for students and club coordinators at BMS College of Engineering. The app supports student self-registration, pre-registered club administrator accounts, event browsing, paid event registration, calendar-based discovery, notifications, and administrator dashboards.

The application is designed around six campus clubs: IEEE BMSCE, AI/ML Club, Cultural Club, Sports Committee, Photography Club, and Literary Club. Each club has two administrator accounts and sample events, allowing the app to demonstrate both student and admin workflows without requiring an external backend. A mock API and AsyncStorage persistence layer allow the app to function offline while preserving the same interface expected from a Node.js/Express backend.

The flagship technical feature is real-time venue conflict detection. When an administrator creates an event, CampusSync checks same-day bookings at the same venue and enforces a mandatory one-hour buffer between events. This prevents overlapping schedules and improves coordination across clubs.

---

## 2. Problem Statement

Campus event coordination commonly suffers from fragmented communication, duplicated registrations, manual room booking checks, and limited visibility into participation. Students may miss events because information is spread across messaging groups or posters, while administrators lack a unified tool to publish events, review registrations, and avoid venue clashes.

CampusSync addresses these issues by providing a single mobile-first platform for:

- Students to discover, search, filter, and register for campus events.
- Administrators to create and manage events for their assigned clubs.
- Club teams to avoid venue conflicts using automated time-range validation.
- Users to receive event reminders and registration notifications.
- Organizers to inspect participation and export registered-student lists.

---

## 3. Objectives

The project objectives are:

1. Build a usable mobile application with a polished student and administrator experience.
2. Provide secure role-based access for students and pre-registered club admins.
3. Support event discovery through search, filters, featured cards, and calendar view.
4. Enable event registration, cancellation, and activity-point visibility.
5. Support paid events through a UPI-style QR payment flow and digital receipt.
6. Allow administrators to create events while enforcing venue availability constraints.
7. Provide admin statistics, per-event student lists, and CSV export support.
8. Implement offline-ready mock data and persistence for demonstrations without a backend.

---

## 4. Scope of the Application

### Student Scope

Students can:

- Create an account using a valid BMSCE email address.
- Log in after registration.
- Browse upcoming events across all supported clubs.
- Search using autocomplete and recent searches.
- Filter events by category and club.
- View event details, registration deadlines, capacity, venue, price, and activity points.
- Register or unregister for events.
- Complete a payment flow for paid events.
- View registered events and archived events.
- Receive notifications for confirmations and reminders.
- Maintain a profile with role and academic metadata.

### Administrator Scope

Administrators can:

- Log in using pre-registered club admin credentials.
- Create events only for their assigned club.
- Select event date, time, end time, venue, price, category, and capacity.
- Receive live warnings for venue conflicts before submission.
- Delete only events owned by their club.
- View hosted events and club-level statistics.
- Drill down into registered-student lists.
- Export event registration data as CSV.

### Out of Scope

The current mobile repository focuses on the React Native client. The app defines REST API endpoints and attempts backend calls, but it also includes a full mock fallback, so a live backend is optional for demonstration.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Mobile framework | React Native with Expo SDK 54 | Cross-platform mobile app development |
| Language | JavaScript ES2022+ | Application logic and UI |
| Navigation | React Navigation native stack and bottom tabs | Authentication stack and main tab navigation |
| State management | React Context API | Global authentication state |
| Persistence | AsyncStorage | Token, registered users, and local state persistence |
| HTTP client | Axios | Backend API integration with mock fallback |
| UI styling | React Native StyleSheet, custom theme tokens | Dark-mode design system |
| Visuals | Expo Linear Gradient, Ionicons | Gradients, buttons, navigation icons |
| Animation | React Native Reanimated | Smooth UI motion and feedback |

---

## 6. System Architecture

CampusSync is structured as a client-side mobile application with a backend-ready API layer.

### Main Components

1. **App Entry Point**
   - `App.js` wraps the app in `SafeAreaProvider`, `AuthProvider`, and `NavigationContainer`.
   - A dark navigation theme is applied globally.

2. **Authentication Context**
   - `src/context/AuthContext.js` manages user session state and authentication lifecycle.
   - AsyncStorage persists auth state across app restarts.

3. **Navigation**
   - `src/navigation/RootNavigator.js` separates unauthenticated screens from the main app.
   - Authenticated users access a bottom-tab interface: Home, My Events, Create, Notifications, and Profile.

4. **API Layer**
   - `src/services/api.js` centralizes clubs, admin accounts, mock events, authentication, event operations, notifications, and user profile calls.
   - Axios is configured for backend requests, while catch blocks provide mock fallback behavior.

5. **Screens**
   - Screens are grouped by functional area: authentication, home, events, admin, my events, notifications, and profile.

6. **Reusable Components**
   - `EventCard`, `CalendarView`, and `EmptyState` provide reusable interface building blocks.

### High-Level Flow

```text
User opens app
  -> AuthProvider loads saved session
  -> RootNavigator chooses auth stack or main tabs
  -> User browses, registers, creates, or manages events
  -> API layer attempts backend call
  -> Mock fallback keeps app functional offline
  -> AsyncStorage preserves local state where needed
```

---

## 7. Key Features

### 7.1 Authentication and Role Management

CampusSync supports two user roles:

- **Students:** Self-register using BMSCE email details and log in afterward.
- **Admins:** Use pre-registered accounts mapped to a specific club.

Role validation prevents students from logging in as admins and prevents admin emails from being used for student registration. Admin users receive club metadata that is used to enforce authorization during event creation and deletion.

### 7.2 Event Discovery

The Home screen provides:

- Featured and regular event cards.
- Category filters.
- Club filters.
- Search by title, description, tags, or club.
- Autocomplete search behavior.
- Calendar view with color-coded event dots.
- Personalized statistics and reminders.

### 7.3 Event Details and Registration

Each event detail page presents:

- Title, club, description, date, time, venue, and organizer.
- Registration deadline.
- Activity points.
- Capacity and registered-count progress.
- Price information.
- Register, unregister, share, and payment actions.

### 7.4 Paid Event Payment Flow

Paid events use a UPI QR-style payment screen with:

- Deterministic QR-like visual.
- Five-minute payment timer.
- Completion confirmation.
- Digital receipt behavior.

This provides a complete demonstration of a paid registration workflow without requiring payment gateway integration.

### 7.5 Admin Event Creation

Club admins can create events through an admin-only form. The form is locked to the admin's assigned club, preventing cross-club event creation. Administrators can configure event metadata including title, category, description, date, time, end time, location, price, capacity, and activity points.

### 7.6 Real-Time Venue Conflict Detection

CampusSync checks conflicts while admins create events. The validation logic:

1. Compares venue names case-insensitively.
2. Restricts conflict checks to the same calendar date.
3. Converts start and end times into minutes from midnight.
4. Expands existing event time ranges by a required one-hour buffer.
5. Runs interval overlap detection against the requested time range.
6. Blocks submission and displays a warning if a conflict is found.

This ensures that two clubs cannot accidentally book the same venue at overlapping or insufficiently separated times.

### 7.7 Admin Statistics and Student Lists

Administrators can view:

- Hosted events for their club.
- Summary statistics.
- Registration counts.
- Per-event student lists.
- Searchable and sortable participant data.
- CSV export of registrations.

### 7.8 Notifications

The app includes a notification center for:

- Registration confirmations.
- Event reminders.
- New event announcements generated when admins create events.
- Read and mark-all-read interactions.

---

## 8. Data Model Overview

### Club

Each club includes:

- `id`
- `name`
- `icon`
- `color`

### Admin

Each admin includes:

- `email`
- `clubId`
- `name`
- `password`

### Event

Each event includes:

- `_id`
- `title`
- `description`
- `category`
- `club`
- `clubId`
- `activityPoints`
- `date`
- `time`
- `endTime`
- `location`
- `price`
- `organizer`
- `maxCapacity`
- `registeredCount`
- `registeredStudents`
- `tags`
- `imageUrl`
- `registrationDeadline`
- `createdBy`

### Notification

Notifications include:

- `_id`
- `title`
- `body`
- `type`
- `read`
- `createdAt`
- `eventId`

---

## 9. API Design

The mobile app expects the following backend endpoints while preserving offline mock fallback:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate student or admin |
| POST | `/api/auth/register` | Register a student |
| GET | `/api/events` | Fetch events with category, club, or search filters |
| GET | `/api/events/:id` | Fetch one event |
| POST | `/api/events` | Create event as admin |
| DELETE | `/api/events/:id` | Delete admin-owned event |
| POST | `/api/events/:id/register` | Register for an event |
| DELETE | `/api/events/:id/register` | Unregister from an event |
| GET | `/api/events/my/registered` | Fetch current user's registered events |
| GET | `/api/events/my/hosted` | Fetch admin-hosted events |
| GET | `/api/events/:id/students` | Fetch registered students for an event |
| POST | `/api/events/check-conflict` | Check venue conflict |
| GET | `/api/notifications` | Fetch notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| GET | `/api/users/profile` | Fetch profile |
| PUT | `/api/users/profile` | Update profile |

---

## 10. User Interface and Design System

CampusSync uses a dark-mode visual system with consistent colors, spacing, gradients, rounded cards, and iconography. The design is optimized for event-heavy content and quick mobile interactions.

| Token | Value | Use |
|---|---|---|
| Background | `#080818` | App background |
| Card background | `rgba(255,255,255,0.05)` | Event cards and panels |
| Card border | `rgba(255,255,255,0.10)` | Subtle separation |
| Primary | `#8B5CF6` | Main actions and active tabs |
| Secondary | `#3B82F6` | Supporting accent |
| Accent | `#10B981` | Success and positive state |
| Warning | `#F59E0B` | Warnings and timers |
| Danger | `#EF4444` | Errors and destructive actions |

The bottom tab bar provides persistent access to the most important workflows, while stacked navigation handles detail and drill-down screens.

---

## 11. Security and Validation

CampusSync includes several validation and safety measures:

- Admin accounts are pre-registered and tied to exact club ownership.
- Admin emails cannot be used for student registration.
- Students cannot log in using the admin role.
- Admins cannot create or delete events outside their assigned club.
- Password strength checks require common security criteria.
- API calls include bearer-token header support when a token exists.
- Venue conflict detection prevents schedule collisions.

For production use, sensitive authentication logic and password validation should move fully to a secure backend with password hashing, database persistence, token expiry, and server-side authorization.

---

## 12. Testing and Demonstration Strategy

The project can be demonstrated using Expo Go or an emulator.

Suggested demo sequence:

1. Launch the app and show the Welcome screen.
2. Register a student account using a BMSCE email.
3. Log in as the student and browse the Home screen.
4. Search and filter events.
5. Open an event detail page and register.
6. Complete the payment flow for a paid event.
7. View My Events and Notifications.
8. Sign out and log in as a club admin.
9. Create an event with a free venue and valid time.
10. Try creating a conflicting venue booking to show live conflict prevention.
11. Open admin statistics and registered-student lists.

---

## 13. Course Outcomes Addressed

| Course Outcome | Evidence in CampusSync |
|---|---|
| CO1 - UI/UX Design | Dark-mode theme, reusable components, animations, card layouts, empty states, mobile-first navigation |
| CO2 - Mobile App Development | React Native app, Expo workflow, 15+ screens, navigation stacks, Context API, AsyncStorage, API integration |
| CO3 - Presentation and Report | Project documentation, demonstration-ready flows, generated report and presentation deck |

---

## 14. Limitations

Current limitations include:

- The backend is optional and not included in this repository.
- Mock data is reset when the app process restarts except for stored user credentials.
- Payment flow is a demonstration and does not integrate with a real payment gateway.
- Admin passwords are defined in the client for demo purposes only.
- Production-grade security, audit logging, and database-backed reporting would require backend implementation.

---

## 15. Future Enhancements

Potential enhancements include:

1. Full Node.js/Express backend integration with MongoDB.
2. Secure password hashing and JWT refresh-token handling.
3. Real payment gateway or UPI deep-link integration.
4. Push notifications using Expo Notifications or Firebase Cloud Messaging.
5. Event approval workflow for faculty coordinators.
6. QR-based attendance tracking at event venues.
7. Student activity-point certificate generation.
8. Analytics dashboards for college-level administrators.
9. Waitlists for full events.
10. Offline synchronization with conflict resolution.

---

## 16. Conclusion

CampusSync demonstrates a complete mobile event-management workflow for a college environment. It combines practical student-facing features with administrator tools, offline-ready mock data, API-ready architecture, and a meaningful venue-conflict detection algorithm. The project satisfies mobile app development goals while addressing a real coordination problem faced by campus clubs and students.

