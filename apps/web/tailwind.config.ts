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
        /* ── Pirttrip primary orange/yellow — matches pirttrip.com ── */
        pirttrip: {
          DEFAULT: '#FFA300',
          50:  '#FFF7E6',
          100: '#FFEEBA',
          200: '#FFE38C',
          300: '#FFD86B',
          400: '#FFCD4B',
          500: '#FFA300',
          600: '#E89300',
          700: '#C17A00',
          800: '#9A6300',
          900: '#664000',
        },
        /* ── Dark navy for text/headers ── */
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
        /* ── Page background ── */
        page: '#F5F7FA',
        /* ── Keep legacy primary for internal pages ── */
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
