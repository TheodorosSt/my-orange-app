import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          gold: {
            dark: '#785723',
            DEFAULT: '#bf913a',
            mid: '#c7ad67',
            light: '#dad395',
            accent: '#b28636',
            muted: '#9d742e',
          },
          bg: {
            primary: '#1a1714',
            secondary: '#231f1b',
            tertiary: '#2c2620',
            elevated: '#342d26',
          },
          text: {
            primary: '#e8e0d4',
            secondary: '#a09888',
            muted: '#6a6058',
          },
          border: {
            DEFAULT: '#3a3228',
            gold: 'rgba(199, 173, 103, 0.25)',
          },
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(199, 173, 103, 0.12), 0 0 60px rgba(199, 173, 103, 0.06)',
        'glow-strong': '0 0 40px rgba(199, 173, 103, 0.25), 0 0 80px rgba(199, 173, 103, 0.1)',
        premium: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(199, 173, 103, 0.12)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;