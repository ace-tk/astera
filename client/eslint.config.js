import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/** Flat ESLint config for the Astera client (React 19 + Vite). */
export default [
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // no `React` import needed (JSX transform)
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'react/prop-types': 'off', // this codebase is intentionally untyped/JS
      'react/no-unknown-property': 'off',
    },
  },
  // Context files intentionally co-locate a Provider component with its hook;
  // the fast-refresh granularity hint doesn't apply and would be noise.
  {
    files: ['src/context/**/*.{js,jsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.vitest } },
  },
]
