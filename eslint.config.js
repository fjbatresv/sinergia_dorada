import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules', 'dist', 'assets', 'scripts/sentry.js']
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
  },
  {
    // Herramientas de build/CI que corren en Node, no en el navegador
    files: ['scripts/copy-vendor.js', 'scripts/check-links.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
