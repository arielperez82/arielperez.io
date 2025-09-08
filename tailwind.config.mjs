import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        gray: colors.gray,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: colors.gray[700],
            '[class~="lead"]': {
              color: colors.gray[600],
            },
          },
        },
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
  darkMode: 'class'
}
