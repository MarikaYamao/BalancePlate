/**
 * Design Tokens - 統一されたカラーシステム
 * Deep Teal × Sand × Silver Gray テーマ
 * WCAG AA準拠のコントラストを確保
 */

export const colors = {
  // Background Colors
  bg: {
    primary: '#F5F3EF', // Soft Sand - メイン背景
    surface: '#FFFFFF', // カード・サーフェス
    elevated: '#FDFCFB', // 浮き上がったUI要素
    subtle: '#F9F8F6', // 微細な背景差分
  },

  // Text Colors - 3階層の明確な差分
  text: {
    primary: '#1F2A2E', // 濃いニュートラル（見出し・主要情報）
    secondary: '#4C5A62', // 中間グレー（補足情報）
    tertiary: '#7A8892', // 薄めグレー（注釈・最小限の読みやすさ確保）
    inverse: '#FFFFFF', // 反転文字（ダークBG用）
  },

  // Brand Colors
  brand: {
    primary: '#0F3D3E', // Deep Teal
    primaryHover: '#0C3233', // Deep Teal Hover
    secondary: '#339797', // Light Teal
    secondaryHover: '#2A7E7E',
  },

  // Accent Colors
  accent: {
    lavender: '#A7B0C4', // Lavender Gray - グラフ・選択状態
    silver: '#C7CCD6', // Silver - 弱いアクセント
  },

  // Semantic Colors
  semantic: {
    danger: '#D96C6C', // Muted Coral
    dangerHover: '#C54E4E',
    warning: '#E0A458', // Warm Orange
    success: '#4A8D6E', // Muted Green
    info: '#5B87B3', // Muted Blue
  },

  // Border & Shadow
  border: {
    default: '#E6E1DA', // 薄いSand系ボーダー
    light: '#F0EDE8',
    dark: '#D4CCBE',
  },

  shadow: {
    xs: 'rgba(15, 61, 62, 0.04)',
    sm: 'rgba(15, 61, 62, 0.06)',
    md: 'rgba(15, 61, 62, 0.08)',
    lg: 'rgba(15, 61, 62, 0.12)',
  },
} as const;

export const typography = {
  // Font Sizes
  size: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '22px',
    '3xl': '24px',
  },

  // Font Weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.8,
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

/**
 * Component-specific token combinations
 */
export const components = {
  // Cards
  card: {
    bg: colors.bg.surface,
    border: colors.border.default,
    shadow: colors.shadow.sm,
    radius: radius.lg,
  },

  // Buttons
  button: {
    primary: {
      bg: colors.brand.primary,
      bgHover: colors.brand.primaryHover,
      text: colors.text.inverse,
      shadow: colors.shadow.md,
    },
    secondary: {
      bg: 'transparent',
      bgHover: `${colors.brand.primary}10`,
      text: colors.brand.primary,
      border: colors.brand.primary,
    },
    ghost: {
      bg: 'transparent',
      bgHover: `${colors.text.tertiary}10`,
      text: colors.text.secondary,
    },
  },

  // Navigation
  nav: {
    bg: colors.bg.surface,
    border: colors.border.default,
    active: colors.brand.primary,
    inactive: colors.text.tertiary,
    hover: colors.text.secondary,
  },

  // Form Elements
  input: {
    bg: colors.bg.surface,
    border: colors.border.default,
    borderFocus: colors.brand.primary,
    text: colors.text.primary,
    placeholder: colors.text.tertiary,
  },

  // Progress
  progress: {
    bg: colors.border.light,
    fill: colors.brand.primary,
    text: colors.text.primary,
  },
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Components = typeof components;