import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      maxWidth: {
        /* 90vw container — used across all pages */
        container: '90vw',
      },
      colors: {
        /* ── Primary orange — exact from screenshot CTA button ── */
        primary: {
          DEFAULT: '#FF6B00',
          50:  '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF6B00',
          600: '#E65100',
          700: '#BF360C',
          800: '#8D2400',
          900: '#5D1500',
        },
        /* ── Navy blue — "Terno" logo text + hero dark bg ────── */
        navy: {
          DEFAULT: '#1E3A5F',
          50:  '#EEF2F7',
          100: '#D6E0ED',
          500: '#1E3A5F',
          600: '#162C4A',
          700: '#0F1E33',
          800: '#0A1525',
          900: '#060D17',
        },
        /* ── Page background — light gray like demo ─────────── */
        page: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
      boxShadow: {
        card:       '0 1px 4px 0 rgba(0,0,0,0.08)',
        'card-hover':'0 4px 16px 0 rgba(0,0,0,0.12)',
        stats:      '0 1px 4px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
