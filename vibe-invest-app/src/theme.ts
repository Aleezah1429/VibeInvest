// Color tokens lifted 1:1 from the HTML mock (vibeinvest_investor_ui.html).
// React Native does not support `rgba(255,255,255,0.x)` shorthand the way CSS does
// (well, it does at runtime but autocomplete is friendlier with named constants), so
// the white-alpha scale that appears all over the mock is named explicitly here.

export const colors = {
  // Surfaces
  bg: '#09090F',                  // app background
  surfaceLow: 'rgba(255,255,255,0.03)',
  surfaceMid: 'rgba(255,255,255,0.04)',
  surfaceHi:  'rgba(255,255,255,0.05)',
  surfaceTop: 'rgba(255,255,255,0.07)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.1)',
  borderTop: 'rgba(255,255,255,0.12)',
  borderGhost: 'rgba(255,255,255,0.15)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.8)',
  textMuted: 'rgba(255,255,255,0.6)',
  textDim: 'rgba(255,255,255,0.5)',
  textDimmer: 'rgba(255,255,255,0.45)',
  textFaint: 'rgba(255,255,255,0.4)',
  textHint: 'rgba(255,255,255,0.35)',
  textWhisper: 'rgba(255,255,255,0.3)',
  textTrace: 'rgba(255,255,255,0.25)',
  textGhost: 'rgba(255,255,255,0.2)',

  // Brand purple
  brand: '#6366f1',
  brandSoft: '#818cf8',
  brandTintBg: 'rgba(99,102,241,0.07)',
  brandTintMid: 'rgba(99,102,241,0.12)',
  brandTintHi: 'rgba(99,102,241,0.15)',
  brandBorderSoft: 'rgba(99,102,241,0.25)',
  brandBorder: 'rgba(99,102,241,0.3)',
  brandBorderStrong: 'rgba(99,102,241,0.4)',
  brandGridLine: 'rgba(99,102,241,0.06)',

  // Status
  success: '#22c55e',
  successBg: 'rgba(34,197,94,0.05)',
  successBgMid: 'rgba(34,197,94,0.08)',
  successBgHi: 'rgba(34,197,94,0.1)',
  successBorder: 'rgba(34,197,94,0.2)',
  successBorderHi: 'rgba(34,197,94,0.25)',
  successBorderTop: 'rgba(34,197,94,0.3)',

  warning: '#f59e0b',
  amber: '#fbbf24',
  amberBgHi: 'rgba(251,191,36,0.12)',
  amberBorder: 'rgba(251,191,36,0.25)',
  amberBg: 'rgba(251,191,36,0.1)',
  amberBorderSoft: 'rgba(251,191,36,0.2)',

  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.1)',
  dangerBgMid: 'rgba(239,68,68,0.12)',
  dangerBgHi: 'rgba(239,68,68,0.15)',
  dangerBorder: 'rgba(239,68,68,0.2)',
  dangerBorderHi: 'rgba(239,68,68,0.25)',
  dangerBorderTop: 'rgba(239,68,68,0.3)',

  purple: '#a855f7',
  purpleBg: 'rgba(168,85,247,0.1)',
  purpleBorder: 'rgba(168,85,247,0.2)',

  // Deep accents
  deepIndigo: '#1e1b4b',
  cardDark: '#1a1a2e',
  cardGreen: '#0d1b0d',
} as const;

export type ColorKey = keyof typeof colors;
