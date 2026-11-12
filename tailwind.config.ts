// tailwind.config.ts — civic-trust token system (navy primary, restrained Karnataka gold accent).
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep royal navy from the KSCCA emblem
        navy: {
          50: '#eef3fc',
          100: '#d6e3f7',
          200: '#aec6ee',
          300: '#7ba1e0',
          400: '#4574cc',
          500: '#2156b4', // primary action
          600: '#17448f', // primary hover
          700: '#123872',
          800: '#0e2c59',
          900: '#0a2150', // masthead
          950: '#061436',
        },
        // Metallic gold from the emblem ring/ribbon
        gold: {
          300: '#f6d56f',
          400: '#efc23f',
          500: '#dca81f', // primary accent
          600: '#b9871a',
          700: '#8f6713',
        },
        // Karnataka flag accents (from the map + ribbon tails) — used sparingly
        kred: '#e23b2e',
        kyellow: '#ffcc00',
        mist: '#f3f6fc', // tinted surface
        line: '#e2e8f0',
        ink: '#0f172a',
        slate2: '#475569',
        success: '#15803d',
        danger: '#b91c1c',
      },
      fontFamily: {
        display: ['"Baloo Tamma 2"', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans Kannada"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { content: '1180px' },
      boxShadow: {
        card: '0 1px 2px rgba(11,35,64,0.04), 0 8px 24px rgba(11,35,64,0.06)',
        lift: '0 2px 4px rgba(11,35,64,0.06), 0 16px 40px rgba(11,35,64,0.10)',
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
} satisfies Config;
