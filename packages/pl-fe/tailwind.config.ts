import aspectRatioPlugin from '@tailwindcss/aspect-ratio';
import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

import { parseColorMatrix } from './tailwind/colors';

import type { Config } from 'tailwindcss';

const blackVariantPlugin = plugin(({ addVariant }) => addVariant('black', '&:is(.dark.black *)'));
const reducedMotionPlugin = plugin(({ addVariant }) => addVariant('no-reduce-motion', '.no-reduce-motion &'));

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}', './custom/instance/**/*.html', './index.html'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '581px',
      md: '768px',
      lg: '976px',
      xl: '1280px',
    },
    extend: {
      boxShadow: ({ theme }) => ({
        '3xl': '0 25px 75px -15px rgba(0, 0, 0, 0.25)',
        'inset-ring': `inset 0 0 0 2px ${theme('colors.accent-blue')}`,
      }),
      fontSize: {
        base: '0.9375rem',
      },
      fontFamily: {
        'sans': [
          'pl-fe i18n',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        'mono': [
          'Roboto Mono',
          'ui-monospace',
          'mono',
        ],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      colors: parseColorMatrix({
        // Define color matrix (of available colors)
        // Colors are configured at runtime with CSS variables in pl-fe.json
        gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        secondary: [100, 200, 300, 400, 500, 600],
        success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        accent: [300, 500],
        'accent-blue': true,
        'gradient-start': true,
        'gradient-end': true,
        'greentext': true,
      }),
      animation: {
        'sonar-scale-4': 'sonar-scale-4 3s linear infinite',
        'sonar-scale-3': 'sonar-scale-3 3s 0.5s linear infinite',
        'sonar-scale-2': 'sonar-scale-2 3s 1s linear infinite',
        'sonar-scale-1': 'sonar-scale-1 3s 1.5s linear infinite',
        'enter': 'enter 200ms ease-out',
        'leave': 'leave 150ms ease-in forwards',
        'text-overflow': 'text-overflow 8s linear infinite',
      },
      keyframes: {
        'sonar-scale-4': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(4)' },
        },
        'sonar-scale-3': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(3.5)' },
        },
        'sonar-scale-2': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(3)' },
        },
        'sonar-scale-1': {
          from: { opacity: '0.4', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(2.5)' },
        },
        enter: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        leave: {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.9)', opacity: '0' },
        },
        // https://stackoverflow.com/posts/78825869/revisions
        'text-overflow': {
          '10%, 90%': { transform: 'translate(0, 0)', left: '0%' },
          '40%, 60%': { transform: 'translate(-100%, 0)', left: '100%' },
        },
      },
    },
  },
  plugins: [
    aspectRatioPlugin,
    formsPlugin,
    typographyPlugin,
    blackVariantPlugin,
    reducedMotionPlugin,
  ],
};

export { config as default };
