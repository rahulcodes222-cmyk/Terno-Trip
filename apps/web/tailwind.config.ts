import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50:  '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFC8AD',
          300: '#FFAC84',
          400: '#FF8F5B',
          500: '#FF6B35',
          600: '#E8541A',
          700: '#C43F0E',
          800: '#9A2F08',
          900: '#712103',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          800: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
