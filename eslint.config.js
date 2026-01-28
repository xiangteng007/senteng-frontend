import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  prettierConfig,
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      prettier,
    },
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
      // Prettier integration
      'prettier/prettier': ['error', {
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        printWidth: 100,
        endOfLine: 'lf',
      }],
      // Unused vars are warnings, not errors (common in migrated codebase)
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^[A-Z_]|^_',
        argsIgnorePattern: '^_|^e$|^err$|^event$'
      }],
      // Allow exports of non-component functions in files with components
      'react-refresh/only-export-components': 'off',
      // Disable overly strict react-hooks rules (valid patterns trigger these)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
]);

