import { StyleSheet } from 'react-native';

/**
 * Lunaria design system, built on Material 3 roles.
 *
 * - colors: M3 color roles from a berry seed, plus cycle-specific roles (period / fertile / intimacy).
 *   Every on-* / text pair is checked against WCAG AA (>= 4.5:1).
 * - type: the M3 type scale. Use these instead of ad-hoc font sizes.
 * - shape: M3 corner sizes. Cards use `xl`, buttons/chips/indicators use `full`.
 * - space: 4pt grid. Screens use `lg` between sections, cards use `lg` inside.
 * - elevation, motion: M3 levels and the "emphasized" easing curve.
 */
export const colors = {
  // Brand
  primary: '#B8325A',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FBE7EC',
  onPrimaryContainer: '#5C1130',

  // Calendar palette
  midnightViolet: '#2A1E2E',
  mauve: '#DBBBF5',
  beige: '#EAF2D7',
  icyAqua: '#AEF3E7',

  // Neutral surfaces, lowest to highest emphasis
  surface: '#FFF8F6',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainer: '#F7EEEA',
  surfaceContainerHigh: '#F0E4E0',
  onSurface: '#2A1E2E',
  onSurfaceVariant: '#6B5E6E',
  outline: '#857379',
  outlineVariant: '#EEE2DD',
  scrim: '#2A1E2E66',

  // Cycle
  period: '#B8325A',
  onPeriod: '#FFFFFF',
  periodContainer: '#EAF2D7',
  onPeriodContainer: '#2A1E2E',
  fertile: '#2E7F79',
  fertileContainer: '#AEF3E7',
  fertileSurface: '#DDF2EF',
  onFertileContainer: '#2A1E2E',
  calendarToday: '#FBE7EC',
  calendarSelected: '#2A1E2E',
  intimacy: '#7B5EA7',

  // Feedback
  error: '#B3261E',
  errorContainer: '#FBE9E7',
};

export const typeScale = StyleSheet.create({
  displaySmall: { color: colors.onSurface, fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -0.5 },
  headlineLarge: { color: colors.onSurface, fontSize: 40, lineHeight: 48, fontWeight: '800', letterSpacing: -1 },
  headlineMedium: { color: colors.onSurface, fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.3 },
  titleLarge: { color: colors.onSurface, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  titleMedium: { color: colors.onSurface, fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: 0.15 },
  bodyLarge: { color: colors.onSurface, fontSize: 16, lineHeight: 24, letterSpacing: 0.2 },
  bodyMedium: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  labelLarge: { color: colors.onSurface, fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1 },
  labelMedium: { color: colors.onSurfaceVariant, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.5 },
});

export const shape = { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 999 };

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const elevation = StyleSheet.create({
  // iOS-only soft shadow; Android elevation shadows flash grey during tab cross-fades, so cards rely on their outline there.
  level1: { shadowColor: colors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  level2: { shadowColor: colors.onSurface, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
});

// Material 3 "emphasized" motion.
export const motion = { duration: 300, easing: [0.2, 0, 0, 1] as const };
