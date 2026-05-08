import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';

// ─── 6 CLUBS at BMSCE ────────────────────────────────────────────────────────
export const CLUBS = [
  { id: 'ieee', name: 'IEEE BMSCE', icon: 'flash', color: '#3B82F6' },
  { id: 'aiml', name: 'AI/ML Club', icon: 'hardware-chip', color: '#8B5CF6' },
  { id: 'cultural', name: 'Cultural Club', icon: 'color-palette', color: '#EC4899' },
  { id: 'sports', name: 'Sports Committee', icon: 'football', color: '#F59E0B' },
  { id: 'photography', name: 'Photography Club', icon: 'camera', color: '#10B981' },
  { id: 'literary', name: 'Literary Club', icon: 'book', color: '#06B6D4' },
];

// ─── 12 ADMIN EMAILS — 2 per club ────────────────────────────────────────────
export const ADMINS = [
  { email: 'ieee.admin1@bmsce.ac.in', clubId: 'ieee', name: 'IEEE Admin 1' },
  { email: 'ieee.admin2@bmsce.ac.in', clubId: 'ieee', name: 'IEEE Admin 2' },
  { email: 'aiml.admin1@bmsce.ac.in', clubId: 'aiml', name: 'AI/ML Admin 1' },
  { email: 'aiml.admin2@bmsce.ac.in', clubId: 'aiml', name: 'AI/ML Admin 2' },
  { email: 'cultural.admin1@bmsce.ac.in', clubId: 'cultural', name: 'Cultural Admin 1' },
  { email: 'cultural.admin2@bmsce.ac.in', clubId: 'cultural', name: 'Cultural Admin 2' },
  { email: 'sports.admin1@bmsce.ac.in', clubId: 'sports', name: 'Sports Admin 1' },
  { email: 'sports.admin2@bmsce.ac.in', clubId: 'sports', name: 'Sports Admin 2' },
  { email: 'photography.admin1@bmsce.ac.in', clubId: 'photography', name: 'Photography Admin 1' },
  { email: 'photography.admin2@bmsce.ac.in', clubId: 'photography', name: 'Photography Admin 2' },
  { email: 'literary.admin1@bmsce.ac.in', clubId: 'literary', name: 'Literary Admin 1' },
  { email: 'literary.admin2@bmsce.ac.in', clubId: 'literary', name: 'Literary Admin 2' },
];

export const ADMIN_EMAILS = ADMINS.map(a => a.email);
export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes((email || '').toLowerCase().trim());
export const getAdminClubId = (email) => {
  const admin = ADMINS.find(a => a.email === (email || '').toLowerCase().trim());
  return admin?.clubId || null;
};
export const getClubById = (id) => CLUBS.find(c => c.id === id);
export const getClubByName = (name) => CLUBS.find(c => c.name === name);

// ─── PASSWORD STRENGTH CHECK ────────────────────────────────────────────────
export const checkPasswordStrength = (pwd) => {
  const checks = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return {
    checks,
    score: passed,
    isStrong: passed >= 4,
    label: passed <= 2 ? 'Weak' : passed === 3 ? 'Fair' : passed === 4 ? 'Good' : 'Strong',
    color: passed <= 2 ? '#EF4444' : passed === 3 ? '#F59E0B' : passed === 4 ? '#10B981' : '#10B981',
  };
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── STUDENT NAME POOL ──────────────────────────────────────────────────────
const STUDENT_NAMES = [
  'aastha', 'rahul', 'priya', 'kavya', 'arjun', 'sneha', 'vikram', 'rohan',
  'meera', 'neha', 'aditya', 'ananya', 'karthik', 'divya', 'siddharth', 'pooja',
  'ravi', 'anjali', 'manish', 'tanvi', 'aryan', 'shreya', 'harish', 'isha',
  'nikhil', 'pavithra', 'sandeep', 'lakshmi', 'varun', 'radha', 'nikita',
  'rakesh', 'swati', 'gaurav', 'preethi', 'amit', 'shruti', 'kiran',
  'aditi', 'akash', 'bhavya', 'chirag', 'deepak', 'esha', 'farhan',
  'gayatri', 'hitesh', 'jaya', 'lokesh',
];

// Generate registered student emails — caps at 50 to keep list manageable.
// If actual registeredCount > 50, suffix numbers are added (rahul2, priya3, etc)
function generateStudents(count) {
  const list = [];
  const limit = Math.min(count, 50);
  const shuffled = [...STUDENT_NAMES].sort(() => 0.5 - Math.random());
  for (let i = 0; i < limit; i++) {
    const baseName = shuffled[i % shuffled.length];
    const suffix = i >= shuffled.length ? Math.floor(i / shuffled.length) + 1 : '';
    list.push(`${baseName}${suffix}@bmsce.ac.in`);
  }
  return list;
}

// ─── 18 MOCK EVENTS — 3 per club ─────────────────────────────────────────────
let MOCK_EVENTS = [
  // IEEE BMSCE (3)
  {
    _id: 'e1', title: 'HackBMSCE 2025', description: '24-hour hackathon. Build innovative solutions to real-world problems. Cash prizes worth ₹50,000!',
    category: 'Tech', club: 'IEEE BMSCE', clubId: 'ieee', activityPoints: 5,
    date: new Date(Date.now() + 2 * 86400000).toISOString(), time: '09:00 AM',
    location: 'CSE Block, BMSCE', price: 100,
    organizer: { name: 'IEEE Admin 1', email: 'ieee.admin1@bmsce.ac.in' },
    maxCapacity: 60, registeredCount: 43, registeredStudents: generateStudents(43),
    tags: ['hackathon', 'coding', 'prizes'], imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
    isFeatured: true, registrationDeadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    createdBy: 'ieee.admin1@bmsce.ac.in',
  },
  {
    _id: 'e2', title: 'Tech Talk: Quantum Computing', description: 'Industry expert from IBM Research delves into the world of quantum computing.',
    category: 'Tech', club: 'IEEE BMSCE', clubId: 'ieee', activityPoints: 3,
    date: new Date(Date.now() + 6 * 86400000).toISOString(), time: '04:00 PM',
    location: 'Seminar Hall 1', price: 0,
    organizer: { name: 'IEEE Admin 2', email: 'ieee.admin2@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 27, registeredStudents: generateStudents(27),
    tags: ['talk', 'quantum'], imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdBy: 'ieee.admin2@bmsce.ac.in',
  },
  {
    _id: 'e3', title: 'Robotics Workshop', description: 'Hands-on workshop on Arduino, sensors, and building autonomous robots.',
    category: 'Workshop', club: 'IEEE BMSCE', clubId: 'ieee', activityPoints: 4,
    date: new Date(Date.now() + 10 * 86400000).toISOString(), time: '10:00 AM',
    location: 'Robotics Lab', price: 150,
    organizer: { name: 'IEEE Admin 1', email: 'ieee.admin1@bmsce.ac.in' },
    maxCapacity: 30, registeredCount: 22, registeredStudents: generateStudents(22),
    tags: ['robotics', 'arduino'], imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 8 * 86400000).toISOString(),
    createdBy: 'ieee.admin1@bmsce.ac.in',
  },

  // AI/ML Club (3)
  {
    _id: 'e4', title: 'Machine Learning Workshop', description: 'Hands-on ML workshop covering supervised learning, neural networks. Laptops mandatory.',
    category: 'Workshop', club: 'AI/ML Club', clubId: 'aiml', activityPoints: 5,
    date: new Date(Date.now() + 3 * 86400000).toISOString(), time: '10:00 AM',
    location: 'Computer Lab 4', price: 100,
    organizer: { name: 'AI/ML Admin 1', email: 'aiml.admin1@bmsce.ac.in' },
    maxCapacity: 40, registeredCount: 38, registeredStudents: generateStudents(38),
    tags: ['ML', 'AI', 'python'], imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdBy: 'aiml.admin1@bmsce.ac.in',
  },
  {
    _id: 'e5', title: 'GenAI Hackathon', description: 'Build the next big thing with GPT, Claude, and Gemini APIs. 12-hour event.',
    category: 'Tech', club: 'AI/ML Club', clubId: 'aiml', activityPoints: 5,
    date: new Date(Date.now() + 8 * 86400000).toISOString(), time: '09:00 AM',
    location: 'Main Auditorium', price: 150,
    organizer: { name: 'AI/ML Admin 2', email: 'aiml.admin2@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 24, registeredStudents: generateStudents(24),
    tags: ['genai', 'hackathon'], imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600',
    isFeatured: true, registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdBy: 'aiml.admin2@bmsce.ac.in',
  },
  {
    _id: 'e6', title: 'Kaggle Competition Bootcamp', description: 'Learn to compete on Kaggle. Real datasets, real prizes.',
    category: 'Workshop', club: 'AI/ML Club', clubId: 'aiml', activityPoints: 4,
    date: new Date(Date.now() + 12 * 86400000).toISOString(), time: '02:00 PM',
    location: 'CS Lab', price: 50,
    organizer: { name: 'AI/ML Admin 1', email: 'aiml.admin1@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 31, registeredStudents: generateStudents(31),
    tags: ['kaggle', 'data-science'], imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    createdBy: 'aiml.admin1@bmsce.ac.in',
  },

  // Cultural Club (3)
  {
    _id: 'e7', title: 'Rhythm & Beats Cultural Fest', description: 'Annual cultural extravaganza featuring dance, music, drama, and art competitions.',
    category: 'Cultural', club: 'Cultural Club', clubId: 'cultural', activityPoints: 4,
    date: new Date(Date.now() + 5 * 86400000).toISOString(), time: '05:00 PM',
    location: 'Main Auditorium', price: 100,
    organizer: { name: 'Cultural Admin 1', email: 'cultural.admin1@bmsce.ac.in' },
    maxCapacity: 60, registeredCount: 49, registeredStudents: generateStudents(49),
    tags: ['dance', 'music', 'drama'], imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdBy: 'cultural.admin1@bmsce.ac.in',
  },
  {
    _id: 'e8', title: 'Open Mic Night', description: 'Stand-up, poetry, music — bring your talent and rock the stage.',
    category: 'Cultural', club: 'Cultural Club', clubId: 'cultural', activityPoints: 2,
    date: new Date(Date.now() + 4 * 86400000).toISOString(), time: '07:00 PM',
    location: 'Open Air Theatre', price: 0,
    organizer: { name: 'Cultural Admin 2', email: 'cultural.admin2@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 28, registeredStudents: generateStudents(28),
    tags: ['openmic', 'standup'], imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdBy: 'cultural.admin2@bmsce.ac.in',
  },
  {
    _id: 'e9', title: 'Battle of Bands', description: 'Inter-college music competition. Form your band and win exciting prizes!',
    category: 'Cultural', club: 'Cultural Club', clubId: 'cultural', activityPoints: 3,
    date: new Date(Date.now() + 11 * 86400000).toISOString(), time: '06:00 PM',
    location: 'Main Stage', price: 150,
    organizer: { name: 'Cultural Admin 1', email: 'cultural.admin1@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 32, registeredStudents: generateStudents(32),
    tags: ['music', 'bands'], imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    createdBy: 'cultural.admin1@bmsce.ac.in',
  },

  // Sports Committee (3)
  {
    _id: 'e10', title: 'Inter-College Cricket Tournament', description: 'Represent BMSCE in the inter-college cricket league. Selections open for all years.',
    category: 'Sports', club: 'Sports Committee', clubId: 'sports', activityPoints: 3,
    date: new Date(Date.now() + 7 * 86400000).toISOString(), time: '07:00 AM',
    location: 'BMSCE Cricket Ground', price: 50,
    organizer: { name: 'Sports Admin 1', email: 'sports.admin1@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 24, registeredStudents: generateStudents(24),
    tags: ['cricket', 'sports'], imageUrl: 'https://images.unsplash.com/photo-1540747913346-19212a4b423b?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdBy: 'sports.admin1@bmsce.ac.in',
  },
  {
    _id: 'e11', title: 'Annual Sports Day', description: 'Track, field, swimming and team events. All branches welcome!',
    category: 'Sports', club: 'Sports Committee', clubId: 'sports', activityPoints: 4,
    date: new Date(Date.now() + 14 * 86400000).toISOString(), time: '06:00 AM',
    location: 'BMSCE Sports Complex', price: 0,
    organizer: { name: 'Sports Admin 2', email: 'sports.admin2@bmsce.ac.in' },
    maxCapacity: 60, registeredCount: 45, registeredStudents: generateStudents(45),
    tags: ['athletics', 'sports-day'], imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    createdBy: 'sports.admin2@bmsce.ac.in',
  },
  {
    _id: 'e12', title: 'Basketball Championship', description: '5-a-side basketball tournament. Form a team and dunk your way to victory!',
    category: 'Sports', club: 'Sports Committee', clubId: 'sports', activityPoints: 3,
    date: new Date(Date.now() + 9 * 86400000).toISOString(), time: '04:00 PM',
    location: 'Indoor Sports Hall', price: 100,
    organizer: { name: 'Sports Admin 1', email: 'sports.admin1@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 22, registeredStudents: generateStudents(22),
    tags: ['basketball', 'tournament'], imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdBy: 'sports.admin1@bmsce.ac.in',
  },

  // Photography Club (3)
  {
    _id: 'e13', title: 'Bangalore Heritage Photo Walk', description: 'Guided photo walk through the heritage areas of Bangalore. All skill levels welcome.',
    category: 'Social', club: 'Photography Club', clubId: 'photography', activityPoints: 2,
    date: new Date(Date.now() + 9 * 86400000).toISOString(), time: '06:30 AM',
    location: 'Cubbon Park Main Gate', price: 50,
    organizer: { name: 'Photography Admin 1', email: 'photography.admin1@bmsce.ac.in' },
    maxCapacity: 30, registeredCount: 18, registeredStudents: generateStudents(18),
    tags: ['photography', 'heritage'], imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdBy: 'photography.admin1@bmsce.ac.in',
  },
  {
    _id: 'e14', title: 'Astrophotography Night', description: 'Night sky photography session. Telescopes provided.',
    category: 'Workshop', club: 'Photography Club', clubId: 'photography', activityPoints: 3,
    date: new Date(Date.now() + 13 * 86400000).toISOString(), time: '08:00 PM',
    location: 'BMSCE Rooftop', price: 150,
    organizer: { name: 'Photography Admin 2', email: 'photography.admin2@bmsce.ac.in' },
    maxCapacity: 25, registeredCount: 14, registeredStudents: generateStudents(14),
    tags: ['astrophotography', 'night'], imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 11 * 86400000).toISOString(),
    createdBy: 'photography.admin2@bmsce.ac.in',
  },
  {
    _id: 'e15', title: 'Photo Exhibition: Campus Stories', description: 'Submit your best campus shots. Top 50 will be exhibited at the foyer.',
    category: 'Cultural', club: 'Photography Club', clubId: 'photography', activityPoints: 2,
    date: new Date(Date.now() + 15 * 86400000).toISOString(), time: '11:00 AM',
    location: 'Main Foyer', price: 0,
    organizer: { name: 'Photography Admin 1', email: 'photography.admin1@bmsce.ac.in' },
    maxCapacity: 100, registeredCount: 47, registeredStudents: generateStudents(47),
    tags: ['exhibition', 'campus'], imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 13 * 86400000).toISOString(),
    createdBy: 'photography.admin1@bmsce.ac.in',
  },

  // Literary Club (3)
  {
    _id: 'e16', title: 'Debate Championship', description: 'Inter-branch debate competition. Topics revealed 30 mins before each round.',
    category: 'Academic', club: 'Literary Club', clubId: 'literary', activityPoints: 4,
    date: new Date(Date.now() + 6 * 86400000).toISOString(), time: '02:00 PM',
    location: 'Seminar Hall 2', price: 50,
    organizer: { name: 'Literary Admin 1', email: 'literary.admin1@bmsce.ac.in' },
    maxCapacity: 50, registeredCount: 28, registeredStudents: generateStudents(28),
    tags: ['debate', 'speaking'], imageUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222f9?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdBy: 'literary.admin1@bmsce.ac.in',
  },
  {
    _id: 'e17', title: 'Poetry Slam Night', description: 'An evening of original poetry. Perform or just listen — both are welcome.',
    category: 'Cultural', club: 'Literary Club', clubId: 'literary', activityPoints: 2,
    date: new Date(Date.now() + 10 * 86400000).toISOString(), time: '06:30 PM',
    location: 'Library Reading Room', price: 0,
    organizer: { name: 'Literary Admin 2', email: 'literary.admin2@bmsce.ac.in' },
    maxCapacity: 60, registeredCount: 22, registeredStudents: generateStudents(22),
    tags: ['poetry', 'spoken-word'], imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 8 * 86400000).toISOString(),
    createdBy: 'literary.admin2@bmsce.ac.in',
  },
  {
    _id: 'e18', title: 'Book Club: Sapiens Discussion', description: 'Group discussion on Yuval Noah Harari\'s Sapiens. Chapters 1-5.',
    category: 'Academic', club: 'Literary Club', clubId: 'literary', activityPoints: 2,
    date: new Date(Date.now() + 4 * 86400000).toISOString(), time: '05:00 PM',
    location: 'Library Group Study Room', price: 0,
    organizer: { name: 'Literary Admin 1', email: 'literary.admin1@bmsce.ac.in' },
    maxCapacity: 25, registeredCount: 11, registeredStudents: generateStudents(11),
    tags: ['books', 'discussion'], imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
    isFeatured: false, registrationDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdBy: 'literary.admin1@bmsce.ac.in',
  },
];

let MOCK_NOTIFICATIONS = [
  { _id: 'n1', title: 'Registration Confirmed!', body: 'You have successfully registered for HackBMSCE 2025.', type: 'success', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n2', title: 'Event Reminder', body: 'Book Club: Sapiens Discussion is in 4 days.', type: 'reminder', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

// ─── PASSWORD STORE (in-memory + AsyncStorage persistence) ───────────────────
// Pre-provisioned admin passwords (their default password is "admin123")
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// In-memory user store
let REGISTERED_USERS = {}; // { email: { password, name, branch, semester, gender, registeredAt } }

// Load registered users from AsyncStorage on startup
const loadUsersFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem('cs_registered_users');
    if (stored) REGISTERED_USERS = JSON.parse(stored);
  } catch (e) {
    console.log('Could not load users:', e);
  }
};
loadUsersFromStorage();

const saveUsersToStorage = async () => {
  try {
    await AsyncStorage.setItem('cs_registered_users', JSON.stringify(REGISTERED_USERS));
  } catch (e) {
    console.log('Could not save users:', e);
  }
};

// ─── AUTH API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password, role) => {
    try {
      const res = await api.post('/api/auth/login', { email, password, role });
      return res.data;
    } catch {
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail || !password) {
        throw new Error('Email and password are required.');
      }

      const isAdmin = isAdminEmail(cleanEmail);

      // Validate role matches email
      if (role === 'admin' && !isAdmin) {
        throw new Error('Only authorized BMSCE club admins can log in as admin.');
      }
      if (role !== 'admin' && isAdmin) {
        throw new Error('This is an admin email. Please select Admin role.');
      }

      // ADMIN AUTHENTICATION
      if (isAdmin) {
        // Admins use the default password unless they've changed it
        const adminCustomPwd = REGISTERED_USERS[cleanEmail]?.password;
        const expectedPwd = adminCustomPwd || DEFAULT_ADMIN_PASSWORD;

        if (password !== expectedPwd) {
          throw new Error('Incorrect password. Default admin password is "admin123".');
        }

        const adminInfo = ADMINS.find(a => a.email === cleanEmail);
        const club = getClubById(adminInfo.clubId);

        return {
          token: 'mock_jwt_token_' + Date.now(),
          user: {
            _id: 'u_' + cleanEmail,
            name: adminInfo.name,
            email: cleanEmail,
            role: 'admin',
            isAdmin: true,
            clubId: adminInfo.clubId,
            clubName: club?.name || null,
            college: 'BMSCE',
            branch: 'Admin',
            semester: '-',
            registeredEvents: [],
            hostedEvents: MOCK_EVENTS.filter(e => e.clubId === adminInfo.clubId).map(e => e._id),
            activityPoints: 0,
            avatar: null,
          },
        };
      }

      // STUDENT AUTHENTICATION
      const userRecord = REGISTERED_USERS[cleanEmail];
      if (!userRecord) {
        throw new Error('No account found for this email. Please register first.');
      }

      if (userRecord.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      // Login successful
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          _id: 'u_' + cleanEmail,
          name: userRecord.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'student',
          isAdmin: false,
          clubId: null,
          clubName: null,
          college: 'BMSCE',
          branch: userRecord.branch || 'CSE',
          semester: userRecord.semester || '4',
          gender: userRecord.gender || 'other',
          username: userRecord.username || null,
          registeredEvents: ['e1', 'e7'], // mock pre-registrations for demo
          hostedEvents: [],
          activityPoints: 0,
          avatar: null,
        },
      };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      return res.data;
    } catch {
      const cleanEmail = (userData.email || '').toLowerCase().trim();

      // Block admin email signup
      if (isAdminEmail(cleanEmail)) {
        throw new Error('This admin account is pre-registered. Please go to Login.');
      }

      // Block re-registration
      if (REGISTERED_USERS[cleanEmail]) {
        throw new Error('An account with this email already exists. Please go to Login.');
      }

      // Save credentials
      REGISTERED_USERS[cleanEmail] = {
        password: userData.password,
        name: userData.name,
        username: userData.username,
        branch: userData.branch,
        semester: userData.semester,
        gender: userData.gender,
        registeredAt: new Date().toISOString(),
      };
      await saveUsersToStorage();

      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          _id: 'u_' + cleanEmail,
          name: userData.name,
          username: userData.username,
          email: cleanEmail,
          role: 'student',
          isAdmin: false,
          clubId: null,
          clubName: null,
          branch: userData.branch,
          semester: userData.semester,
          gender: userData.gender,
          college: 'BMSCE',
          registeredEvents: [],
          hostedEvents: [],
          activityPoints: 0,
          avatar: null,
        },
      };
    }
  },
};

// ─── EVENTS API ──────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/api/events', { params });
      return res.data;
    } catch {
      let events = [...MOCK_EVENTS];
      if (params.category && params.category !== 'All') events = events.filter(e => e.category === params.category);
      if (params.club && params.club !== 'All') events = events.filter(e => e.club === params.club);
      if (params.search) {
        const q = params.search.toLowerCase();
        events = events.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q)) ||
          e.club.toLowerCase().includes(q)
        );
      }

      if (params.sortBy === 'date') events.sort((a, b) => new Date(a.date) - new Date(b.date));
      else if (params.sortBy === 'club') events.sort((a, b) => a.club.localeCompare(b.club));
      else if (params.sortBy === 'points') events.sort((a, b) => b.activityPoints - a.activityPoints);
      else if (params.sortBy === 'newest') events.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      return { events, total: events.length };
    }
  },

  getById: async (id) => {
    try { const res = await api.get(`/api/events/${id}`); return res.data; }
    catch { return MOCK_EVENTS.find(e => e._id === id) || null; }
  },

  // Check room/venue conflicts before creating event
  // Now supports time ranges (start time + end time) for accurate overlap detection
  checkRoomConflict: async ({ location, date, time, endTime, excludeEventId = null }) => {
    if (!location || !date || !time) return { hasConflict: false, conflicts: [] };

    const eventDate = new Date(date);
    const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;

    // Parse time string like "10:00 AM" to minutes from midnight
    const parseTime = (t) => {
      if (!t) return 0;
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let hour = parseInt(match[1]);
      const min = parseInt(match[2]);
      const ampm = (match[3] || '').toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      return hour * 60 + min;
    };

    const requestedStart = parseTime(time);
    let requestedEnd = endTime ? parseTime(endTime) : requestedStart + 180; // fallback: 3 hours
    if (requestedEnd <= requestedStart) requestedEnd = requestedStart + 180; // sanity check

    const conflicts = MOCK_EVENTS.filter(e => {
      if (excludeEventId && e._id === excludeEventId) return false;

      // Match venue (case-insensitive, trimmed)
      const sameVenue = e.location && location &&
        e.location.toLowerCase().trim() === location.toLowerCase().trim();
      if (!sameVenue) return false;

      // Match same day
      const ed = new Date(e.date);
      const otherKey = `${ed.getFullYear()}-${ed.getMonth()}-${ed.getDate()}`;
      if (otherKey !== dateKey) return false;

      // Compute time ranges
      const otherStart = parseTime(e.time);
      let otherEnd = e.endTime ? parseTime(e.endTime) : otherStart + 180;
      if (otherEnd <= otherStart) otherEnd = otherStart + 180;

      // Two ranges overlap if: start1 < end2 AND start2 < end1
      return requestedStart < otherEnd && otherStart < requestedEnd;
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(e => ({
        _id: e._id,
        title: e.title,
        club: e.club,
        time: e.time,
        endTime: e.endTime,
        date: e.date,
        location: e.location,
      })),
    };
  },

  // ADMIN ONLY — must be from same club as event
  create: async (eventData, currentUser) => {
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can create events.');
    }
    // Force the event's club to admin's club
    if (eventData.clubId && eventData.clubId !== currentUser.clubId) {
      throw new Error(`You can only create events for ${currentUser.clubName}.`);
    }
    try {
      const res = await api.post('/api/events', eventData);
      return res.data;
    } catch {
      const newEvent = {
        _id: 'e_' + Date.now(),
        ...eventData,
        clubId: currentUser.clubId,
        club: currentUser.clubName,
        registeredCount: 0, registeredStudents: generateStudents(0),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.email,
      };
      MOCK_EVENTS.unshift(newEvent);

      // Auto-notify all students
      MOCK_NOTIFICATIONS.unshift({
        _id: 'n_' + Date.now(),
        title: '🎉 New Event Posted!',
        body: `"${newEvent.title}" on ${new Date(newEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, hosted by ${newEvent.club}. Earn ${newEvent.activityPoints} activity points!`,
        type: 'info', read: false,
        createdAt: new Date().toISOString(),
        eventId: newEvent._id,
      });

      return newEvent;
    }
  },

  // ADMIN ONLY — only delete events from their club
  delete: async (eventId, currentUser) => {
    if (!currentUser?.isAdmin) throw new Error('Only admins can delete events.');
    const event = MOCK_EVENTS.find(e => e._id === eventId);
    if (event && event.clubId !== currentUser.clubId) {
      throw new Error(`You can only delete events from ${currentUser.clubName}.`);
    }
    try { const res = await api.delete(`/api/events/${eventId}`); return res.data; }
    catch {
      MOCK_EVENTS = MOCK_EVENTS.filter(e => e._id !== eventId);
      return { message: 'Deleted successfully' };
    }
  },

  register: async (eventId, userEmail) => {
    try { const res = await api.post(`/api/events/${eventId}/register`); return res.data; }
    catch {
      const event = MOCK_EVENTS.find(e => e._id === eventId);
      if (event) {
        event.registeredCount += 1;
        if (userEmail && !event.registeredStudents.includes(userEmail)) {
          event.registeredStudents.push(userEmail);
        }
      }
      return { message: 'Registered', event };
    }
  },

  unregister: async (eventId, userEmail) => {
    try { const res = await api.delete(`/api/events/${eventId}/register`); return res.data; }
    catch {
      const event = MOCK_EVENTS.find(e => e._id === eventId);
      if (event) {
        event.registeredCount = Math.max(0, event.registeredCount - 1);
        if (userEmail) {
          event.registeredStudents = event.registeredStudents.filter(e => e !== userEmail);
        }
      }
      return { message: 'Unregistered' };
    }
  },

  // For admin stats — get all events for a club with registration data
  getClubEvents: async (clubId) => {
    try { const res = await api.get(`/api/events/club/${clubId}`); return res.data; }
    catch {
      const events = MOCK_EVENTS.filter(e => e.clubId === clubId);
      return { events };
    }
  },

  getMyRegistered: async () => {
    try { const res = await api.get('/api/events/my/registered'); return res.data; }
    catch { return { events: MOCK_EVENTS.slice(0, 2) }; }
  },

  getMyHosted: async (currentUser) => {
    try { const res = await api.get('/api/events/my/hosted'); return res.data; }
    catch {
      if (currentUser?.isAdmin && currentUser?.clubId) {
        return { events: MOCK_EVENTS.filter(e => e.clubId === currentUser.clubId) };
      }
      return { events: [] };
    }
  },
};

// ─── NOTIFICATIONS API ───────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: async () => {
    try { const res = await api.get('/api/notifications'); return res.data; }
    catch { return { notifications: MOCK_NOTIFICATIONS }; }
  },
  markRead: async (id) => {
    try { await api.patch(`/api/notifications/${id}/read`); }
    catch { const n = MOCK_NOTIFICATIONS.find(n => n._id === id); if (n) n.read = true; }
  },
  markAllRead: async () => {
    try { await api.patch('/api/notifications/read-all'); }
    catch { MOCK_NOTIFICATIONS.forEach(n => n.read = true); }
  },
};

// ─── USER API ────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: async () => { try { const r = await api.get('/api/users/profile'); return r.data; } catch { return null; } },
  updateProfile: async (data) => { try { const r = await api.put('/api/users/profile', data); return r.data; } catch { return data; } },
};

export default api;