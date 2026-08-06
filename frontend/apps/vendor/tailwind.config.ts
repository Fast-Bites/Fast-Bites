import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        /** Two-column menu fields / compact page inset; does not change `sm` (640px)+. */
        xs: '420px',
      },
    },
  },
  plugins: [],
} satisfies Config;
