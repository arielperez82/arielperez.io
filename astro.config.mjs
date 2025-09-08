// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.arielperez.io',
  base: '/',
  output: 'static',
  integrations: [
    react(), 
    mdx(), 
    sitemap({
      filter: (page) => {
        // Exclude 404
        return !page.includes('/404')
      }
    }
  )],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  vite: {
    plugins: [tailwindcss(), viteTsconfigPaths()]
  }
})
