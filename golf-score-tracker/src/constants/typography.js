// Typography constants for the Golf Score Tracker app

export const typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Common text styles
export const textStyles = {
  header: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
  },
  subheader: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodyBold: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  score: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  money: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  moneyLarge: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
  },
};

export default typography;
