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
        importOrder: [
          '<BUILTIN_MODULES>',
          '<THIRD_PARTY_MODULES>',
          '^@data/(.*)$',
          '^@layouts/(.*)$',
          '^@pages/(.*)$',
          '^@components/(.*)$',
          '^@scripts/(.*)$',
          '^@styles/(.*)$',
          '^@/(.*)$',
          '^.[./].*'
        ]
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
        trailingComma: 'all',
        importOrder: []
      }
    }
  ],
  plugins: [
    'prettier-plugin-astro',
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ],
  astroAllowShorthand: false,
  importOrder: []
}

export default config
