import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shu: {
          navy: '#0A2540',
          'navy-dark': '#061727',
          gold: '#C59B27',
          blue: '#0284C7',
          teal: '#0D9488',
          amber: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
};

export default config;

