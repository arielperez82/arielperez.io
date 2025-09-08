// scripts/generate-llms-txt.ts
// Post-build script to generate llms.txt and llms-full.txt from all HTML files in dist
import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import TurndownService from 'turndown'
import { fileURLToPath } from 'url'

import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '../dist')
const llmsFile = path.join(distDir, 'llms.txt')
const llmsFullFile = path.join(distDir, 'llms-full.txt')
const turndownService = new TurndownService()

type PageMeta = {
  title: string
  description: string
  url: string
  path: string
  section: string
}

const getSiteURL = () => {
  return process.env.SITE_URL || 'https://www.arielperez.io'
}

function getGitTimestamp(filePath: string): string {
  try {
    // Map dist file path back to source file path
    const relativePath = path.relative(distDir, filePath)
    const sourcePath = relativePath
      .replace(/\.html$/, '')
      .replace(/\/index$/, '')

    // Map to source files
    console.log('sourcePath', sourcePath)
    let sourceFile = ''
    if (sourcePath === 'about') {
      sourceFile = 'src/pages/about.md'
    } else if (sourcePath === '') {
      sourceFile = 'src/pages/index.astro'
    } else {
      sourceFile = `src/pages/${sourcePath}.astro`
    }

    if (sourceFile) {
      const timestamp = execSync(
        `git log -1 --format="%cd" --date=iso -- "${sourceFile}"`,
        { encoding: 'utf-8' }
      ).trim()
      return timestamp
    }
    return new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function extractMeta(html: string, filePath: string): PageMeta {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const descMatch = html.match(
    /<meta name=["']description["'] content=["'](.*?)["']/i
  )

  // Extract path from file path
  const relativePath = path.relative(distDir, filePath)
  const urlPath = relativePath.replace(/\.html$/, '').replace(/index$/, '')

  const baseUrl = getSiteURL()
  const url = `${baseUrl}/${urlPath}`

  // Determine section based on path and og:type
  const section = 'Home'

  return {
    title: titleMatch ? titleMatch[1] : 'Untitled',
    description: descMatch ? descMatch[1] : '',
    url,
    path: urlPath,
    section
  }
}

async function* walkHtmlFiles(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(fullPath)
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.html') &&
      entry.name !== '404.html' &&
      entry.name !== 'llms.txt' &&
      entry.name !== 'llms-full.txt' &&
      entry.name !== 'robots.txt' &&
      entry.name !== 'sitemap.xml'
    ) {
      yield fullPath
    }
  }
}

async function convertHtmlToMarkdown(filePath: string): Promise<string> {
  const html = await fs.readFile(filePath, 'utf-8')

  return turndownService
    .addRule('ariaLabeledLink', {
      filter: (node) =>
        node.nodeName === 'A' && !!node.getAttribute('aria-label'),
      replacement: (_, node) => {
        const ariaLabel = (node as HTMLElement).getAttribute('aria-label')
        return `[${ariaLabel || ''}](${(node as HTMLElement).getAttribute('href') || ''})`
      }
    })
    .remove('script')
    .remove('style')
    .remove('header')
    .remove('footer')
    .remove('nav')
    .turndown(html)
}

async function processHtmlFileForFull(filePath: string): Promise<string> {
  const html = await fs.readFile(filePath, 'utf-8')
  const meta = extractMeta(html, filePath)
  const lastUpdate = getGitTimestamp(filePath)

  let markdown = ''

  // For other files, continue with HTML to markdown conversion
  markdown = await convertHtmlToMarkdown(filePath)

  return `---

URL: ${meta.url}
Last update: ${lastUpdate}
---
title: "${meta.title}"
description: "${meta.description}"
---

${markdown}

---

`
}

async function generateLLMsTxtSitemap(pages: PageMeta[]): Promise<string> {
  let sitemap = `# ${SITE_TITLE}\n\n${SITE_DESCRIPTION}\n\n`

  // Group pages by section
  const sections = new Map<string, PageMeta[]>()
  pages.forEach((page) => {
    if (!sections.has(page.section)) {
      sections.set(page.section, [])
    }
    sections.get(page.section)!.push(page)
  })

  // Generate sections and pages
  for (const [section, sectionPages] of sections) {
    sitemap += `## ${section}\n\n`
    for (const page of sectionPages) {
      sitemap += `- [${page.title}](${page.url})\n`
    }
    sitemap += '\n'
  }

  return sitemap
}

async function main() {
  const pages: PageMeta[] = []
  const fullContent: string[] = []

  // Process all HTML files
  for await (const filePath of walkHtmlFiles(distDir)) {
    const html = await fs.readFile(filePath, 'utf-8')
    const meta = extractMeta(html, filePath)
    pages.push(meta)

    // Generate full content for llms-full.txt
    const fullPageContent = await processHtmlFileForFull(filePath)
    fullContent.push(fullPageContent)
  }

  // Generate llms.txt (sitemap format)
  const llmsTxtSitemap = await generateLLMsTxtSitemap(pages)
  await fs.writeFile(llmsFile, llmsTxtSitemap, 'utf-8')
  console.log('llms.txt generated at', llmsFile)

  // Generate llms-full.txt (full content format)
  const fullContentText = fullContent.join('\n')
  await fs.writeFile(llmsFullFile, fullContentText, 'utf-8')
  console.log('llms-full.txt generated at', llmsFullFile)
}

main().catch((err) => {
  console.error('Failed to generate llms files:', err)
  process.exit(1)
})
