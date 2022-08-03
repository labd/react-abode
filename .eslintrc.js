module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: [],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: 'React' },
    ],
    'arrow-body-style': ['error', 'as-needed'],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  },
  env: {
    node: true,
    browser: true,
  },
};
