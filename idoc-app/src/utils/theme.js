import { Platform } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'SF Pro Text',
  android: 'sans-serif',
  default: 'system-ui',
});

// ─── White Sky Color Palette ───
export const COLORS = {
  // Primary
  primary: '#2F80ED',
  primaryDark: '#1565D8',
  primaryLight: '#E4F0FF',

  // Accent
  accent: '#00A7C4',
  accentLight: '#E6F8FB',

  // Status
  success: '#1F9D66',
  warning: '#C47A10',
  danger: '#DF4B5F',
  info: '#2F80ED',

  // Role Colors
  admin: '#5B62D6',
  doctor: '#2F80ED',
  pharmacy: '#00A7C4',
  general: '#4AA3F0',

  // Neutrals (White Sky)
  bg: '#F4F8FB',
  bgCard: '#FFFFFF',
  bgElevated: '#EDF5FB',
  bgInput: '#F8FBFE',
  border: '#D5E2ED',
  borderLight: '#BED2E466',

  // Text
  text: '#142033',
  textSecondary: '#52667A',
  textMuted: '#7B8FA2',
  textInverse: '#FFFFFF',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: '#07111FB3',
  transparent: 'transparent',
};

// ─── Typography ───
export const FONTS = {
  h1: { fontFamily: FONT_FAMILY, fontSize: 31, fontWeight: '800', letterSpacing: 0, lineHeight: 38 },
  h2: { fontFamily: FONT_FAMILY, fontSize: 25, fontWeight: '800', letterSpacing: 0, lineHeight: 31 },
  h3: { fontFamily: FONT_FAMILY, fontSize: 21, fontWeight: '700', letterSpacing: 0, lineHeight: 27 },
  h4: { fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: '700', letterSpacing: 0, lineHeight: 23 },
  body: { fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  caption: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  captionBold: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  small: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', lineHeight: 15 },
  button: { fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: '800', letterSpacing: 0 },
};

// ─── Spacing ───
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  xxxl: 30,
  xxxxl: 44,
};

// ─── Border Radius ───
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  full: 999,
};

// ─── Shadows ───
export const SHADOWS = {
  sm: {
    shadowColor: '#1C4469',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C4469',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1C4469',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  focus: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  }),
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// ─── Role Config ───
export const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    color: COLORS.admin,
    icon: 'shield-checkmark',
    description: 'System Administrator',
  },
  doctor: {
    label: 'Doctor',
    color: COLORS.doctor,
    icon: 'medical',
    description: 'Medical Professional',
  },
  pharmacy: {
    label: 'Pharmacy',
    color: COLORS.pharmacy,
    icon: 'medkit',
    description: 'Pharmacy Partner',
  },
  general: {
    label: 'Patient',
    color: COLORS.general,
    icon: 'person',
    description: 'General User',
  },
};
