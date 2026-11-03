import { themeConfig } from './src/theme/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: themeConfig.colors.brand,
        surface: themeConfig.colors.surface,
        darkSurface: themeConfig.colors.darkSurface,
        feedback: themeConfig.colors.feedback,
      },
      fontFamily: {
        sans: themeConfig.typography.fontFamily.sans,
        heading: themeConfig.typography.fontFamily.heading,
        mono: themeConfig.typography.fontFamily.mono,
      }
    },
  },
  plugins: [],
}
