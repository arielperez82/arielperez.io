/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-astro',
    'stylelint-config-tailwindcss'
  ],
  rules: {
    'color-no-invalid-hex': true,
    'block-no-empty': true
    // Add more rules here
  },
  overrides: [
    {
      files: ['**/*.astro']
    }
  ]
}
