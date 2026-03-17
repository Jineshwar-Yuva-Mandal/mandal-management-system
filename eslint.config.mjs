import cds from '@sap/cds/eslint.config.mjs'
export default [
  { ignores: ['**/webapp/test/**', 'gen/**'] },
  ...cds.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  }
]
