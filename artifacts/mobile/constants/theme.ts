/**
 * notha design tokens — single source of truth for all styling.
 *
 * Import the `palette` object directly (no hook needed while the app is
 * light-only).  When dark mode is added, pipe consumption through
 * useColors() so it can switch palettes at runtime.
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const palette = {
  // Backgrounds
  bg: '#F4F5F7',
  card: '#FFFFFF',
  // Brand / ink
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  // Surface chips
  chipUrgent: '#ECECEF',
  chipMuted: '#F4F5F7',
  // Semantic alerts
  red: '#C0392B',
  redBg: '#FBEAE8',
  amber: '#A6690A',
  amberBg: '#FCF1DC',
  // On-dark overlays (content inside dark hero cards)
  onDarkSoft: 'rgba(255,255,255,0.55)' as const,
  onDarkMid: 'rgba(255,255,255,0.50)' as const,
  onDarkFaint: 'rgba(255,255,255,0.45)' as const,
  onDarkSubtle: 'rgba(255,255,255,0.12)' as const,
  onDarkBorder: 'rgba(255,255,255,0.14)' as const,
  // Modal scrims
  scrim: 'rgba(21,21,29,0.44)' as const,
  scrimHeavy: 'rgba(21,21,29,0.50)' as const,
};

// ---------------------------------------------------------------------------
// Spacing scale  (4-point grid)
// ---------------------------------------------------------------------------
export const spacing = {
  1: 4,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

// ---------------------------------------------------------------------------
// Border-radius scale
// ---------------------------------------------------------------------------
export const radii = {
  sm: 11,   // icon cells, small decorative elements
  md: 12,   // action buttons, small inputs
  lg: 14,   // larger action buttons, chips
  xl: 16,   // modal close button, medium cards
  '2xl': 20, // bottom nav pill
  card: 22,  // list-item cards
  cardLg: 24, // light section cards
  hero: 28,  // dark hero cards, bottom sheets
  full: 999, // pills, badges, progress tracks
} as const;

// ---------------------------------------------------------------------------
// Font size scale
// ---------------------------------------------------------------------------
export const fontSize = {
  '2xs': 11,
  xs: 11.5,
  sm: 12,
  'sm+': 12.5,
  base: 13,
  'base+': 13.5,
  md: 14,
  'md+': 14.5,
  lg: 15,
  'lg+': 15.5,
  xl: 16,
  '2xl': 17,
  '3xl': 18,
  '4xl': 20,
  '5xl': 21,
  '6xl': 24,
  '7xl': 32,
  display: 34,
  hero: 42,
  mega: 44,
} as const;

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'SpaceGrotesk_700Bold',
} as const;

// ---------------------------------------------------------------------------
// Shadow presets
// ---------------------------------------------------------------------------
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
} as const;

const theme = { palette, spacing, radii, fontSize, fonts, shadows };
export default theme;
