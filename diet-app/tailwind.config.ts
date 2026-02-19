import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Teal - メインカラー
        teal: {
          50: '#E6F2F2',
          100: '#CCE5E5',
          200: '#99CBCB',
          300: '#66B1B1',
          400: '#339797',
          500: '#0F3D3E', // Deep Teal メイン
          600: '#0C3132',
          700: '#092525',
          800: '#061919',
          900: '#030C0C',
        },
        // Soft Sand - ベース背景
        sand: {
          50: '#FFFFFF',
          100: '#FDFCFB',
          200: '#F9F8F6',
          300: '#F5F3EF', // Soft Sand メイン
          400: '#EDE9E2',
          500: '#E5DFD5',
          600: '#D4CCBE',
          700: '#B8AE9C',
          800: '#9C907A',
          900: '#7F7258',
        },
        // Silver/Lavender Gray - アクセント
        silver: {
          50: '#F5F6F8',
          100: '#EBEDF1',
          200: '#D7DBE3',
          300: '#C7CCD6', // Muted Silver メイン
          400: '#A7B0C4', // Cool Lavender Gray
          500: '#8B95AB',
          600: '#6F7A92',
          700: '#5A6479',
          800: '#464E60',
          900: '#323847',
        },
        // Muted Coral - エラー・警告
        coral: {
          50: '#FDF2F2',
          100: '#FCE4E4',
          200: '#F9C9C9',
          300: '#F3A0A0',
          400: '#E87777',
          500: '#D96C6C', // Muted Coral メイン
          600: '#C54E4E',
          700: '#A13636',
          800: '#7D2A2A',
          900: '#5A1F1F',
        },
        // 既存のカラー（互換性維持）
        primary: {
          50: '#E6F2F2',
          100: '#CCE5E5',
          200: '#99CBCB',
          300: '#66B1B1',
          400: '#339797',
          500: '#0F3D3E',
          600: '#0C3132',
          700: '#092525',
          800: '#061919',
          900: '#030C0C',
        },
        soft: {
          100: '#F5F3EF',
          200: '#EDE9E2',
          300: '#E5DFD5',
          400: '#D4CCBE',
          500: '#B8AE9C',
          600: '#9C907A',
        }
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config