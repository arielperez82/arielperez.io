// eslint.config.js

import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import astroParser from 'astro-eslint-parser'
import prettier from 'eslint-config-prettier/flat'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import * as mdx from 'eslint-plugin-mdx'
import react from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default [
  // Base Astro/JS/TS config
  ...astro.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Simple import/export sorting
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  },
  // Type-aware rules only for TS/TSX
  {
    files: ['{src,scripts}/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
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
        extraFileExtensions: ['.astro']
      }
    }
  },

  // React files
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react, 'jsx-a11y': jsxA11y },
    settings: {
      react: {
        version: 'detect'
      }
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Disable React import requirement for new JSX transform
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off'
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
  },
  // Prettier
  prettier
]
