/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF3EC',
        surface: '#FFFFFF',
        brand: '#A42840',
        'brand-soft': '#FAE3E7',
        'brand-line': '#F0C4CD',
        gold: '#B8860B',
        ink: '#1A1A1A',
        muted: '#6B6B6B',
        faint: '#A0A0A0',
        line: '#E7DFD7',
        up: '#15803d',
        down: '#b91c1c',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
