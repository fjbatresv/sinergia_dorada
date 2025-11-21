import { defaultExclude } from 'vitest/config';

export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    exclude: [...defaultExclude, '**/lint-staged.config.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['**/lint-staged.config.mjs']
    }
  }
};
