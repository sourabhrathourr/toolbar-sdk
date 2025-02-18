module.exports = {
  extends: ['turbo', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
  },
  parserOptions: {
    project: './tsconfig.json',
  },
}; 