/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        // Allow HTML comments in template sections
        htmlWhitespaceSensitivity: 'ignore',
        // Don't format comments aggressively
        proseWrap: 'preserve'
      }
    },
    {
      files: '*.{yaml,yml}',
      options: {
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: true,
        trailingComma: 'all'
      }
    }
  ],
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  astroAllowShorthand: false,
  tailwindConfig: './tailwind.config.mjs'
}

export default config