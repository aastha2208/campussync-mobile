import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// Replace with your backend URL (use your machine's LAN IP when testing on device)
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Used as fallback when backend is not reachable (demo mode)
const MOCK_EVENTS = [
  {
    _id: '1',
    title: 'HackBMSCE 2025',
    description: 'A 24-hour hackathon where students build innovative solutions to real-world problems. Open to all branches. Cash prizes worth ₹50,000!',
    category: 'Tech',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    time: '09:00 AM',
    location: 'CSE Block, BMSCE',
    organizer: { name: 'IEEE BMSCE', email: 'ieee@bmsce.ac.in' },
    maxCapacity: 200,
    registeredCount: 143,
    tags: ['hackathon', 'coding', 'prizes'],
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
    isFeatured: true,
    registrationDeadline: new Date(Date.now() + 1 * 86400000).toISOString(),
  },
  {
    _id: '2',
    title: 'Rhythm & Beats Cultural Fest',
    description: 'Annual cultural extravaganza featuring dance, music, drama, and art competitions. Show your talent and win exciting prizes!',
    category: 'Cultural',
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    time: '05:00 PM',
    location: 'Main Auditorium, BMSCE',
    organizer: { name: 'Cultural Club', email: 'culture@bmsce.ac.in' },
    maxCapacity: 500,
    registeredCount: 289,
    tags: ['dance', 'music', 'drama'],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    isFeatured: false,
    registrationDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    _id: '3',
    title: 'Inter-College Cricket Tournament',
    description: 'Represent BMSCE in the inter-college cricket league. Selections open for all years. Bring your A-game!',
    category: 'Sports',
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    time: '07:00 AM',
    location: 'BMSCE Cricket Ground',
    organizer: { name: 'Sports Committee', email: 'sports@bmsce.ac.in' },
    maxCapacity: 60,
    registeredCount: 44,
    tags: ['cricket', 'sports', 'inter-college'],
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19212a4b423b?w=600',
    isFeatured: false,
    registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    _id: '4',
    title: 'Machine Learning Workshop',
    description: 'Hands-on ML workshop covering supervised learning, neural networks, and real-world datasets. Laptops mandatory.',
    category: 'Workshop',
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    time: '10:00 AM',
    location: 'Computer Lab 4, CSE Dept.',
    organizer: { name: 'AI/ML Club BMSCE', email: 'aiml@bmsce.ac.in' },
    maxCapacity: 40,
    registeredCount: 38,
    tags: ['ML', 'AI', 'python'],
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600',
    isFeatured: false,
    registrationDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    _id: '5',
    title: 'Resume & LinkedIn Bootcamp',
    description: 'Industry experts guide you through crafting the perfect resume and LinkedIn profile to land your dream job.',
    category: 'Academic',
    date: new Date(Date.now() + 1 * 86400000).toISOString(),
    time: '02:00 PM',
    location: 'Seminar Hall, ISE Block',
    organizer: { name: 'Placement Cell BMSCE', email: 'placements@bmsce.ac.in' },
    maxCapacity: 150,
    registeredCount: 102,
    tags: ['career', 'placement', 'resume'],
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
    isFeatured: false,
    registrationDeadline: new Date(Date.now() + 12 * 3600000).toISOString(),
  },
  {
    _id: '6',
    title: 'Photography Walk – Bangalore Heritage',
    description: 'Join us for a guided photography walk through the heritage areas of Bangalore. All skill levels welcome.',
    category: 'Social',
    date: new Date(Date.now() + 9 * 86400000).toISOString(),
    time: '06:30 AM',
    location: 'Cubbon Park Main Gate',
    organizer: { name: 'Photography Club', email: 'photo@bmsce.ac.in' },
    maxCapacity: 30,
    registeredCount: 18,
    tags: ['photography', 'heritage', 'outdoor'],
    imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=600',
    isFeatured: false,
    registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
];

const MOCK_NOTIFICATIONS = [
  { _id: 'n1', title: 'Registration Confirmed!', body: 'You have successfully registered for HackBMSCE 2025.', type: 'success', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n2', title: 'Event Reminder', body: 'Resume & LinkedIn Bootcamp is tomorrow at 2:00 PM.', type: 'reminder', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'n3', title: 'Event Full', body: 'ML Workshop is now at full capacity. You are on the waitlist.', type: 'warning', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'n4', title: 'New Event Posted', body: 'Photography Walk – Bangalore Heritage has been posted.', type: 'info', read: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// ─── AUTH API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      return res.data;
    } catch {
      // Mock login for demo
      if (email && password.length >= 6) {
        return {
          token: 'mock_jwt_token_' + Date.now(),
          user: {
            _id: 'u1',
            name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email,
            role: 'student',
            college: 'BMSCE',
            branch: 'CSE',
            semester: '4',
            registeredEvents: ['1', '5'],
            hostedEvents: [],
            avatar: null,
          },
        };
      }
      throw new Error('Invalid credentials');
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      return res.data;
    } catch {
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          _id: 'u_' + Date.now(),
          ...userData,
          registeredEvents: [],
          hostedEvents: [],
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
      if (params.category && params.category !== 'All') {
        events = events.filter(e => e.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        events = events.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return { events, total: events.length };
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/api/events/${id}`);
      return res.data;
    } catch {
      return MOCK_EVENTS.find(e => e._id === id) || null;
    }
  },

  create: async (eventData) => {
    try {
      const res = await api.post('/api/events', eventData);
      return res.data;
    } catch {
      const newEvent = {
        _id: 'e_' + Date.now(),
        ...eventData,
        registeredCount: 0,
        createdAt: new Date().toISOString(),
      };
      MOCK_EVENTS.unshift(newEvent);
      return newEvent;
    }
  },

  register: async (eventId) => {
    try {
      const res = await api.post(`/api/events/${eventId}/register`);
      return res.data;
    } catch {
      const event = MOCK_EVENTS.find(e => e._id === eventId);
      if (event) event.registeredCount += 1;
      return { message: 'Registered successfully', event };
    }
  },

  unregister: async (eventId) => {
    try {
      const res = await api.delete(`/api/events/${eventId}/register`);
      return res.data;
    } catch {
      const event = MOCK_EVENTS.find(e => e._id === eventId);
      if (event) event.registeredCount -= 1;
      return { message: 'Unregistered successfully' };
    }
  },

  getMyRegistered: async () => {
    try {
      const res = await api.get('/api/events/my/registered');
      return res.data;
    } catch {
      return { events: MOCK_EVENTS.slice(0, 2) };
    }
  },

  getMyHosted: async () => {
    try {
      const res = await api.get('/api/events/my/hosted');
      return res.data;
    } catch {
      return { events: [] };
    }
  },

  archive: async (eventId) => {
    try {
      const res = await api.patch(`/api/events/${eventId}/archive`);
      return res.data;
    } catch {
      return { message: 'Archived' };
    }
  },
};

// ─── USER API ────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: async () => {
    try {
      const res = await api.get('/api/users/profile');
      return res.data;
    } catch {
      return null;
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/api/users/profile', data);
      return res.data;
    } catch {
      return data;
    }
  },
};

// ─── NOTIFICATIONS API ───────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/api/notifications');
      return res.data;
    } catch {
      return { notifications: MOCK_NOTIFICATIONS };
    }
  },

  markRead: async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {
      const n = MOCK_NOTIFICATIONS.find(n => n._id === id);
      if (n) n.read = true;
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/api/notifications/read-all');
    } catch {
      MOCK_NOTIFICATIONS.forEach(n => (n.read = true));
    }
  },
};

export default api;