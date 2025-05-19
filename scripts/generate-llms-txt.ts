// scripts/generate-llms-txt.ts
// Post-build script to generate llms.txt from all HTML files in dist
import fs from 'fs/promises'
import path from 'path'
import TurndownService from 'turndown'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '../dist')
const outputFile = path.join(distDir, 'llms.txt')
const turndownService = new TurndownService()

type PageMeta = { title: string; description: string }

function extractMeta(html: string): PageMeta {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const descMatch = html.match(
    /<meta name=["']description["'] content=["'](.*?)["']/i
  )
  return {
    title: titleMatch ? titleMatch[1] : 'Untitled',
    description: descMatch ? descMatch[1] : ''
  }
}

function stripNavTags(html: string): string {
  // Remove <nav>...</nav> (non-greedy, supports multiline)
  return html.replace(/<nav[\s\S]*?<\/nav>/gi, '')
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
      entry.name !== 'llms.txt'
    ) {
      yield fullPath
    }
  }
}

async function processHtmlFile(filePath: string): Promise<string> {
  const html = await fs.readFile(filePath, 'utf-8')
  const { title, description } = extractMeta(html)
  const htmlWithoutNav = stripNavTags(html)
  const markdown = turndownService.turndown(htmlWithoutNav)
  return `--- title: ${title} description: ${description} tags: [] ---\n\n# ${title}\n\n${markdown}\n\n---\n\n`
}

async function main() {
  let llmsContent = ''
  for await (const filePath of walkHtmlFiles(distDir)) {
    llmsContent += await processHtmlFile(filePath)
  }
  await fs.writeFile(outputFile, llmsContent, 'utf-8')
  console.log('llms.txt generated at', outputFile)
}

main().catch((err) => {
  console.error('Failed to generate llms.txt:', err)

  process.exit(1)
})
