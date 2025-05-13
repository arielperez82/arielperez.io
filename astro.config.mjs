// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.arielperez.io',
  base: '/',
  output: 'static',
  integrations: [react(), mdx()],

  vite: {
    plugins: [
      tailwindcss(),
      viteTsconfigPaths()
    ]
  }
});