import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules', 'dist', 'assets']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      'import/no-unresolved': 'off'
    }
  }
];
