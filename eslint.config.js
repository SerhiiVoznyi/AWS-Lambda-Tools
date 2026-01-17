import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
    },

    rules: {
      /* ===== Variables ===== */
      'no-var': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
          ignoreReadBeforeAssign: true,
        },
      ],

      /* =========================
       * TypeScript enforcement
       * ========================= */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      /* ===== Formatting (ESLint = formatter) ===== */
      semi: ['error', 'never'],
      'space-infix-ops': ['error', { int32Hint: false }],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'always',
          asyncArrow: 'always',
        },
      ],
      /* ===== Whitespace & spacing ===== */
      'no-multi-spaces': 'error',
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'space-infix-ops': ['error', { int32Hint: false }],
      'space-in-parens': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': ['error', 'always'],
      /* ===== Indentation & alignment ===== */
      indent: ['error', 2],
      'keyword-spacing': ['error', { before: true, after: true }],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'block-spacing': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      'no-multi-spaces': 'error',
      /* ===== Quotes ===== */
      quotes: ['error', 'single', { avoidEscape: true }],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
    },
  },
]
