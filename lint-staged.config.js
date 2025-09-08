export default {
  '*.md': ['pnpm run lint:format:md:fix', 'pnpm run lint:md:fix'],
  '*.{js,jsx,ts,tsx,astro,mdx}': [
    'pnpm run lint:format:code:fix',
    'pnpm run lint:code:fix',
    'pnpm run check'
  ],
  '*.{css,astro}': ['pnpm run lint:format:css:fix', 'pnpm run lint:styles:fix']
}
