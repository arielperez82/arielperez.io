module.exports = {
  content: ['./src/**/*.{astro,js,jsx,ts,tsx,mdx}', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        sky: require('tailwindcss/colors').sky,
        gray: require('tailwindcss/colors').gray,
        pink: require('tailwindcss/colors').pink
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class'
}
