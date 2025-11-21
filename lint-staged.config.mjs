export default {
  '**/*.{js,json,css,md,html}': ['prettier --write'],
  'scripts/**/*.js': [
    'eslint --fix',
    'vitest --no-watch --runTestsByPath tests/dogs.test.js tests/ui.test.js tests/content.test.js'
  ],
  'tests/**/*.js': ['prettier --write']
};
