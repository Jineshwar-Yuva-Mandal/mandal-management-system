import cds from '@sap/cds/eslint.config.mjs'
export default [
  { ignores: ['**/webapp/test/**', 'gen/**'] },
  ...cds.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['app/sw.js'],
    languageOptions: {
      globals: { caches: 'readonly', CacheStorage: 'readonly', Cache: 'readonly' }
    }
  },
  {
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' }
  }
]
