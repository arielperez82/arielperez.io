import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import astroParser from 'astro-eslint-parser'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'
import * as mdx from 'eslint-plugin-mdx'

// For ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

export default [
  js.configs.recommended,
  ...compat.extends('standard', 'prettier'),
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/space-before-function-paren': 'off',
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      sourceType: 'module',
      globals: { Astro: 'readonly' }
    },
    plugins: {
      astro
    },
    rules: {
      'astro/jsx-a11y/anchor-is-valid': 'warn',
      'astro/jsx-a11y/html-has-lang': 'off',
      'prettier/prettier': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**']
  },
  // MDX support (see: https://github.com/mdx-js/eslint-mdx?tab=readme-ov-file#flat-config)
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({ lintCodeBlocks: true })
  },
  {
    ...mdx.flatCodeBlocks,
    rules: {
      ...mdx.flatCodeBlocks.rules
      // Example: override/add rules for code blocks if needed
      // 'no-var': 'error',
      // 'prefer-const': 'error',
    }
  }
]
