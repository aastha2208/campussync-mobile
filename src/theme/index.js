// ─── THEME-INDEPENDENT TOKENS ────────────────────────────────────────────────
// Font weights, spacing, radii, and category icons don't change between
// light/dark themes — only colors and shadows do (see darkTheme/lightTheme
// below). Screens get colors from useTheme() (src/context/ThemeContext.js),
// not from a static import, so the toggle actually re-renders them.
export const FONTS = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const CATEGORY_ICONS = {
  Tech: 'laptop-outline',
  Cultural: 'color-palette-outline',
  Sports: 'football-outline',
  Academic: 'school-outline',
  Workshop: 'construct-outline',
  Social: 'people-outline',
  Other: 'grid-outline',
  All: 'apps-outline',
};

// Given a theme's COLORS, builds the category → color lookup used by
// EventCard, CalendarView, CreateEventScreen, etc. Call this with whatever
// COLORS the active theme provides, rather than importing a static object.
export function getCategoryColors(COLORS) {
  return {
    Tech: COLORS.tech,
    Cultural: COLORS.cultural,
    Sports: COLORS.sports,
    Academic: COLORS.academic,
    Workshop: COLORS.workshop,
    Social: COLORS.social,
    Other: COLORS.other,
  };
}

// ─── DARK THEME: original Purple + Blue (unchanged since app inception) ─────
export const darkTheme = {
  name: 'dark',
  COLORS: {
    bg: '#080818',
    bgCard: 'rgba(255,255,255,0.05)',
    bgCardBorder: 'rgba(255,255,255,0.10)',
    bgInput: 'rgba(255,255,255,0.07)',
    surface: '#111130',
    surfaceBorder: 'rgba(255,255,255,0.12)',

    primary: '#8B5CF6',
    primaryDark: '#6D28D9',
    secondary: '#3B82F6',
    accent: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',

    gradientPrimary: ['#8B5CF6', '#3B82F6'],
    gradientCard: ['rgba(139,92,246,0.15)', 'rgba(59,130,246,0.08)'],
    gradientBg: ['#0d0d2b', '#080818'],
    gradientHero: ['rgba(139,92,246,0.9)', 'rgba(59,130,246,0.7)'],

    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textMuted: '#475569',

    tech: '#8B5CF6',
    cultural: '#EC4899',
    sports: '#F59E0B',
    academic: '#10B981',
    workshop: '#3B82F6',
    social: '#06B6D4',
    other: '#64748B',
  },
  SHADOWS: {
    primary: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
    secondary: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  },
};

// ─── LIGHT THEME: Sky Blue + White ───────────────────────────────────────────
export const lightTheme = {
  name: 'light',
  COLORS: {
    bg: '#F5FAFF',
    bgCard: '#FFFFFF',
    bgCardBorder: '#D6EAFB',
    bgInput: '#EAF4FD',
    surface: '#FFFFFF',
    surfaceBorder: '#D6EAFB',

    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    secondary: '#38BDF8',
    accent: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',

    gradientPrimary: ['#0EA5E9', '#38BDF8'],
    gradientCard: ['rgba(14,165,233,0.10)', 'rgba(56,189,248,0.05)'],
    gradientBg: ['#FFFFFF', '#F0F9FF'],
    gradientHero: ['rgba(14,165,233,0.9)', 'rgba(56,189,248,0.7)'],

    textPrimary: '#0C2340',
    textSecondary: '#4A6483',
    textTertiary: '#7C93AC',
    textMuted: '#B8CCE0',

    tech: '#0EA5E9',
    cultural: '#EC4899',
    sports: '#F59E0B',
    academic: '#10B981',
    workshop: '#0284C7',
    social: '#38BDF8',
    other: '#7C93AC',
  },
  SHADOWS: {
    primary: { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 12, elevation: 6 },
    secondary: { shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
    card: { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 3 },
  },
};

// ─── LEGACY STATIC EXPORTS (fallback during incremental migration) ──────────
// Screens not yet converted to useTheme() still import COLORS/SHADOWS/
// CATEGORY_COLORS statically from here — this keeps them rendering (in the
// dark palette) instead of crashing while the rest of the app is migrated
// screen-by-screen. Once every screen uses useTheme(), these can be removed.
export const COLORS = darkTheme.COLORS;
export const SHADOWS = darkTheme.SHADOWS;
export const CATEGORY_COLORS = getCategoryColors(darkTheme.COLORS);
