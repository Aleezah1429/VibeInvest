// VibeInvest design tokens
export const colors = {
  bg: '#09090F',
  bgElevated: 'rgba(255,255,255,0.04)',
  bgElevatedSolid: '#13131c',
  border: 'rgba(255,255,255,0.10)',
  borderSoft: 'rgba(255,255,255,0.08)',

  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.45)',
  textDim: 'rgba(255,255,255,0.35)',
  textFaint: 'rgba(255,255,255,0.25)',

  primary: '#6366f1',
  primaryLight: '#818cf8',
  primarySoft: 'rgba(99,102,241,0.15)',
  primaryBorder: 'rgba(99,102,241,0.30)',

  success: '#22c55e',
  successSoft: 'rgba(34,197,94,0.10)',
  successBorder: 'rgba(34,197,94,0.25)',

  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.12)',
  dangerBorder: 'rgba(239,68,68,0.25)',

  warning: '#f59e0b',
  warningSoft: 'rgba(251,191,36,0.12)',
  warningBorder: 'rgba(251,191,36,0.25)',

  purple: '#a855f7',
  purpleSoft: 'rgba(168,85,247,0.10)',
  purpleBorder: 'rgba(168,85,247,0.20)',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 50,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const typography = {
  // Use Inter / SF Pro / system — install your own font in iOS/Android native config.
  family: undefined, // falls back to system
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
