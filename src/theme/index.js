export const COLORS = {
  // Backgrounds
  bg: '#080818',
  bgCard: 'rgba(255,255,255,0.05)',
  bgCardBorder: 'rgba(255,255,255,0.10)',
  bgInput: 'rgba(255,255,255,0.07)',

  // Brand
  primary: '#8B5CF6',
  primaryDark: '#6D28D9',
  secondary: '#3B82F6',
  accent: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',

  // Gradients
  gradientPrimary: ['#8B5CF6', '#3B82F6'],
  gradientCard: ['rgba(139,92,246,0.15)', 'rgba(59,130,246,0.08)'],
  gradientBg: ['#0d0d2b', '#080818'],
  gradientHero: ['rgba(139,92,246,0.9)', 'rgba(59,130,246,0.7)'],

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textMuted: '#475569',

  // Categories
  tech: '#8B5CF6',
  cultural: '#EC4899',
  sports: '#F59E0B',
  academic: '#10B981',
  workshop: '#3B82F6',
  social: '#06B6D4',
  other: '#64748B',
};

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

export const SHADOWS = {
  purple: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  blue: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const CATEGORY_COLORS = {
  Tech: COLORS.tech,
  Cultural: COLORS.cultural,
  Sports: COLORS.sports,
  Academic: COLORS.academic,
  Workshop: COLORS.workshop,
  Social: COLORS.social,
  Other: COLORS.other,
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
