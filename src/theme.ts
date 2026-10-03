import { StyleSheet } from 'react-native';

// Contrast ratios checked against WCAG AA: every text/background pair below is >= 4.5:1.
export const colors = {
  background: '#FFF8F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F7EEEA',
  border: '#EEE2DD',
  outline: '#857379',
  text: '#2A1E2E',
  muted: '#6B5E6E',
  primary: '#B8325A',
  primarySoft: '#FBE7EC',
  onPrimary: '#FFFFFF',
  period: '#CF3A55',
  periodSoft: '#FDE4E7',
  periodText: '#A8334F',
  fertile: '#2E7F79',
  fertileSoft: '#DDF2EF',
  fertileBand: '#BFE6E1',
  fertileText: '#17605B',
  intimacy: '#7B5EA7',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  backdrop: '#2A1E2E66',
};

export const radius = { sm: 12, md: 16, lg: 28, pill: 999 };

// Generous by default; tighten later if needed.
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

// Material 3 "emphasized" motion.
export const motion = { duration: 300, easing: [0.2, 0, 0, 1] as const };

export const typography = StyleSheet.create({
  display: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.6 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  heading: { color: colors.text, fontSize: 19, lineHeight: 24, fontWeight: '700' },
  body: { color: colors.text, fontSize: 16, lineHeight: 23 },
  bodyStrong: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '600' },
  caption: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  label: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600' },
});

export const shadow = StyleSheet.create({
  card: {
    shadowColor: '#2A1E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
}).card;
