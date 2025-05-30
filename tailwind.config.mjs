import colors from '@tailwindcss/colors.js'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        sky: colors.sky,
        gray: colors.gray,
        pink: colors.pink
      }
    }
  },
  plugins: [typography],
  darkMode: 'class'
}
