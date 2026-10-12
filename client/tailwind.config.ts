/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Dynamic score color classes used in ScoreBar/ScoreBreakdown
    'bg-emerald-500', 'bg-emerald-400', 'bg-amber-400', 'bg-amber-500',
    'bg-orange-400', 'bg-red-400', 'bg-rose-400',
    'text-emerald-600', 'text-amber-600', 'text-orange-600', 'text-red-600',
    'border-emerald-200', 'border-amber-200', 'border-orange-200', 'border-red-200',
    'bg-emerald-50', 'bg-amber-50', 'bg-orange-50', 'bg-red-50',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c2d0ff',
          300: '#9ab1ff',
          400: '#7088ff',
          500: '#4a5ff7',
          600: '#2f3ee8',
          700: '#242fd4',
          800: '#1e28ab',
          900: '#1d2787',
          950: '#111527',
        },
        rose: {
          gold: '#C97B7B',
        },
        brand: {
          navy: '#0F172A',
          sidebar: '#111827',
          accent: '#C97B7B',
          'accent-light': '#F5DADA',
          muted: '#6B7280',
          border: '#E5E7EB',
          surface: '#F9FAFB',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
}
