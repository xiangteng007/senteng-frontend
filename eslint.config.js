import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Unused vars are warnings, not errors (common in migrated codebase)
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^[A-Z_]|^_',
        argsIgnorePattern: '^_|^e$|^err$|^event$'
      }],
      // Allow exports of non-component functions in files with components
      'react-refresh/only-export-components': [
        'warn',
        { allowExportNames: ['hasPageAccess', 'hasAction', 'calculateEqualPayment', 'calculateEqualPrincipal'] }
      ],
    },
  },
])
