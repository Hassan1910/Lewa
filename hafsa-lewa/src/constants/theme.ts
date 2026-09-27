import '@/global.css';

import { Platform } from 'react-native';

/**
 * Lewa Wildlife Conservancy design tokens.
 * Values follow the PRD "stitch_frontend_design_guide" section.
 * Prefer tokens over hard-coded colors, radii, or spacing inside components.
 */
export const Colors = {
  light: {
    primary: '#2F5D3A',
    primaryDark: '#23482D',
    primaryLight: '#E8F0EA',
    accent: '#C89B3C',

    background: '#F7F6F1',
    backgroundElement: '#F0F1EC',
    backgroundSelected: '#E1E5DD',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F1EC',
    overlay: 'rgba(23, 32, 25, 0.45)',

    text: '#172019',
    textSecondary: '#667068',
    textOnPrimary: '#FFFFFF',

    border: '#DDE2DC',
    borderStrong: '#C2CAC1',

    success: '#2E7D5B',
    warning: '#B7791F',
    error: '#B54747',
    info: '#3B6E8C',
  },
  dark: {
    primary: '#3E7A4C',
    primaryDark: '#2F5D3A',
    primaryLight: '#1B2F21',
    accent: '#D4AC55',

    background: '#0E140F',
    backgroundElement: '#141C15',
    backgroundSelected: '#1D281F',
    surface: '#141C15',
    surfaceMuted: '#0E140F',
    overlay: 'rgba(0, 0, 0, 0.6)',

    text: '#F1F4EF',
    textSecondary: '#A6B0A5',
    textOnPrimary: '#FFFFFF',

    border: '#26302A',
    borderStrong: '#37443B',

    success: '#4CA37A',
    warning: '#D6963D',
    error: '#D97070',
    info: '#5A8FAE',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Spacing scale — base unit 4px.
 * Prefer named tokens where possible for readability.
 */
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  // Legacy aliases kept so existing template-derived files don't break.
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  none: 0,
  small: 8,
  medium: 12,
  large: 18,
  xlarge: 24,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

/**
 * Font families provided by @expo-google-fonts/manrope.
 * These constants are what components should reference.
 */
export const FontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

/**
 * Typography scale — matches the PRD "typography.scale" section.
 * Consumers should spread a token onto a Text style prop.
 */
export const Typography = {
  display: { fontFamily: FontFamily.extrabold, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: FontFamily.bold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: FontFamily.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: FontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: FontFamily.medium, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  button: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 20 },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: FontFamily.regular,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: FontFamily.regular,
    serif: 'serif',
    rounded: FontFamily.regular,
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
