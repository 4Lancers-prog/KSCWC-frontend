// eslint.config.js — flat ESLint config: TypeScript + React hooks rules (bug-finding, not style).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules', 'dist', '.wrangler', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['worker/**/*.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  {
    files: ['*.config.{js,ts}', 'playwright.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
);
