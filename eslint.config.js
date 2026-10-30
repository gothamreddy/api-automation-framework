import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.features-gen/**',
      'node_modules/**',
      'allure-report/**',
      'playwright-report/**',
      'tests-support/**/*.mjs',
      'scripts/**/*.mjs',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['steps/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },
);
