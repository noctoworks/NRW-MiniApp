/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Алиасы намеренно указывают на те же токены, что и .card/.btn-* в
      // globals.css: админка написана в этих утилитах, главный экран — в
      // компонентных классах, и палитра у них должна быть буквально одна.
      colors: {
        bg: 'hsl(var(--background))',
        surface: 'hsl(var(--card))',
        'surface-2': 'hsl(var(--muted))',
        border: 'rgba(255,255,255,0.06)',
        accent: {
          DEFAULT: 'hsl(var(--primary))',
          text: 'hsl(var(--primary-foreground))',
        },
        success: '#21c45d',
        muted: 'hsl(var(--subtitle-foreground))',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
