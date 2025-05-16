// eslint.config.js

import js from '@eslint/js'
import astroParser from 'astro-eslint-parser'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import react from 'eslint-plugin-react'
import * as mdx from 'eslint-plugin-mdx'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tsParser from '@typescript-eslint/parser'

export default [
  // Base Astro/JS/TS config
  ...astro.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Type-aware rules only for TS/TSX
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules
      // Add or override type-aware rules here
    }
  },

  // Astro files
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
        project: './tsconfig.json'
      }
    }
  },

  // React files
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react, 'jsx-a11y': jsxA11y },
    rules: {
      ...react.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules
      // Add or override React/JSX-a11y rules here
    }
  },

  // MDX files
  {
    ...mdx.flat,
    plugins: { mdx },
    rules: {
      // Disable base + TypeScript rules
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // Other MDX-related overrides
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    },
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
      languageMapper: {}
    })
  },
  {
    ...mdx.flatCodeBlocks,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      ...mdx.flatCodeBlocks.rules,
      ...tseslint.configs.recommendedTypeChecked.rules
    }
  },

  // Import resolver for TypeScript path aliases
  {
    settings: {
      'import/resolver': {
        typescript: {}
      }
    }
  }
]
