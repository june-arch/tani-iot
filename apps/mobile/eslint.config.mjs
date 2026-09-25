// Tani IoT mobile — ESLint flat config: 1 file tsx ≤250 baris, tanpa `any`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['app/**/*.tsx', 'src/**/*.tsx'],
    rules: {
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', 'dist-check/**', 'node_modules/**', 'android/**', 'ios/**'],
  },
);
