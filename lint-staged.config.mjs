export default {
  '**/*.{js,json,css,md,html}': ['prettier --write'],
  'scripts/**/*.js': [
    'eslint --fix',
    // Vitest no soporta --runTestsByPath; pasamos los paths directamente
    'vitest --no-watch tests/dogs.test.js tests/ui.test.js tests/content.test.js tests/accessibility.test.js --passWithNoTests'
  ],
  'tests/**/*.js': ['prettier --write']
};
