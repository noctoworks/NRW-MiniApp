/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--tg-bg)',
        surface: 'var(--tg-surface)',
        'surface-2': 'var(--tg-surface-2)',
        border: 'rgba(255,255,255,0.06)',
        accent: {
          DEFAULT: 'var(--tg-accent)',
          text: 'var(--tg-accent-text)',
        },
        success: '#3ecf7e',
        muted: 'var(--tg-hint)',
      },
      borderRadius: {
        xl2: '20px',
      },
      boxShadow: {
        glow: '0 0 60px color-mix(in srgb, var(--tg-accent) 45%, transparent)',
        'glow-sm': '0 0 24px color-mix(in srgb, var(--tg-accent) 35%, transparent)',
      },
      backgroundImage: {
        'power-gradient': 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--tg-accent) 60%, white), var(--tg-accent) 70%)',
      },
    },
  },
  plugins: [],
};
