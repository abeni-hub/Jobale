/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#086BB7',
          'blue-light': '#2A8AE0',
          'blue-dark': '#054E87',
          navy: '#082C4C',
          'navy-light': '#0F3D63',
          'navy-dark': '#041D33',
        },
        surface: {
          white: '#FFFFFF',
          offwhite: '#F4F7FA',
          steel: '#D9E3EC',
          'steel-dark': '#B8C8D6',
        },
        ink: {
          DEFAULT: '#334155',
          light: '#64748B',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(8, 44, 76, 0.08), 0 1px 2px -1px rgba(8, 44, 76, 0.06)',
        'card-hover': '0 12px 24px -4px rgba(8, 44, 76, 0.12), 0 4px 8px -2px rgba(8, 44, 76, 0.08)',
        'elevated': '0 20px 40px -12px rgba(8, 44, 76, 0.18)',
      },
    },
  },
  plugins: [],
};
