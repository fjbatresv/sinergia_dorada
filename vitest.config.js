import { defaultExclude } from 'vitest/config';

export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    exclude: [
      ...defaultExclude,
      '**/lint-staged.config.mjs',
      '**/copy-vendor.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/lint-staged.config.mjs',
        'scripts/sentry.js',
        '**/copy-vendor.js',
        '**/*.json',
        'content/**',
        'assets/sentry.bundle.tracing.replay.min.js'
      ]
    }
  }
};
