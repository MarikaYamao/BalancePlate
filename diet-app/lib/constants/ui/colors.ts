// UI color constants for consistent theming

export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'gray' 
  | 'purple' 
  | 'blue' 
  | 'red'
  | 'green'
  | 'yellow'
  | 'pink'
  | 'indigo';

export interface ColorConfig {
  bg: string;
  bgHover: string;
  bgActive: string;
  border: string;
  borderHover: string;
  text: string;
  textHover: string;
}

export const COLOR_CONFIGS: Record<ColorVariant, ColorConfig> = {
  primary: {
    bg: 'bg-blue-50',
    bgHover: 'bg-blue-100',
    bgActive: 'bg-blue-200',
    border: 'border-blue-400',
    borderHover: 'border-blue-500',
    text: 'text-blue-700',
    textHover: 'text-blue-800'
  },
  secondary: {
    bg: 'bg-gray-50',
    bgHover: 'bg-gray-100',
    bgActive: 'bg-gray-200',
    border: 'border-gray-400',
    borderHover: 'border-gray-500',
    text: 'text-gray-700',
    textHover: 'text-gray-800'
  },
  success: {
    bg: 'bg-green-50',
    bgHover: 'bg-green-100',
    bgActive: 'bg-green-200',
    border: 'border-green-400',
    borderHover: 'border-green-500',
    text: 'text-green-700',
    textHover: 'text-green-800'
  },
  warning: {
    bg: 'bg-yellow-50',
    bgHover: 'bg-yellow-100',
    bgActive: 'bg-yellow-200',
    border: 'border-yellow-400',
    borderHover: 'border-yellow-500',
    text: 'text-yellow-700',
    textHover: 'text-yellow-800'
  },
  danger: {
    bg: 'bg-red-50',
    bgHover: 'bg-red-100',
    bgActive: 'bg-red-200',
    border: 'border-red-400',
    borderHover: 'border-red-500',
    text: 'text-red-700',
    textHover: 'text-red-800'
  },
  info: {
    bg: 'bg-blue-50',
    bgHover: 'bg-blue-100',
    bgActive: 'bg-blue-200',
    border: 'border-blue-400',
    borderHover: 'border-blue-500',
    text: 'text-blue-700',
    textHover: 'text-blue-800'
  },
  gray: {
    bg: 'bg-gray-50',
    bgHover: 'bg-gray-100',
    bgActive: 'bg-gray-200',
    border: 'border-gray-400',
    borderHover: 'border-gray-500',
    text: 'text-gray-700',
    textHover: 'text-gray-800'
  },
  purple: {
    bg: 'bg-purple-50',
    bgHover: 'bg-purple-100',
    bgActive: 'bg-purple-200',
    border: 'border-purple-400',
    borderHover: 'border-purple-500',
    text: 'text-purple-700',
    textHover: 'text-purple-800'
  },
  blue: {
    bg: 'bg-blue-50',
    bgHover: 'bg-blue-100',
    bgActive: 'bg-blue-200',
    border: 'border-blue-400',
    borderHover: 'border-blue-500',
    text: 'text-blue-700',
    textHover: 'text-blue-800'
  },
  red: {
    bg: 'bg-red-50',
    bgHover: 'bg-red-100',
    bgActive: 'bg-red-200',
    border: 'border-red-400',
    borderHover: 'border-red-500',
    text: 'text-red-700',
    textHover: 'text-red-800'
  },
  green: {
    bg: 'bg-green-50',
    bgHover: 'bg-green-100',
    bgActive: 'bg-green-200',
    border: 'border-green-400',
    borderHover: 'border-green-500',
    text: 'text-green-700',
    textHover: 'text-green-800'
  },
  yellow: {
    bg: 'bg-yellow-50',
    bgHover: 'bg-yellow-100',
    bgActive: 'bg-yellow-200',
    border: 'border-yellow-400',
    borderHover: 'border-yellow-500',
    text: 'text-yellow-700',
    textHover: 'text-yellow-800'
  },
  pink: {
    bg: 'bg-pink-50',
    bgHover: 'bg-pink-100',
    bgActive: 'bg-pink-200',
    border: 'border-pink-400',
    borderHover: 'border-pink-500',
    text: 'text-pink-700',
    textHover: 'text-pink-800'
  },
  indigo: {
    bg: 'bg-indigo-50',
    bgHover: 'bg-indigo-100',
    bgActive: 'bg-indigo-200',
    border: 'border-indigo-400',
    borderHover: 'border-indigo-500',
    text: 'text-indigo-700',
    textHover: 'text-indigo-800'
  }
};

// Size variants
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const SIZE_CONFIGS = {
  xs: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    height: 'h-6'
  },
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    height: 'h-8'
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    height: 'h-10'
  },
  lg: {
    padding: 'px-5 py-3',
    text: 'text-lg',
    height: 'h-12'
  },
  xl: {
    padding: 'px-6 py-4',
    text: 'text-xl',
    height: 'h-14'
  }
};