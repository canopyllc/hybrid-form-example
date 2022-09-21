module.exports = {
  ignorePatterns: ['static/', 'collected_static/'],
  root: true,
  env: {
    node: true,
    browser: true,
  },
  plugins: ['vue'],
  globals: {
    vue: 'readonly',
  },
  extends: ['plugin:vue/vue3-recommended', 'airbnb-base'],
  settings: {
    'import/resolver': 'webpack',
  },
  rules: {
    'no-console': 'off',
    'no-restricted-syntax': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // Allow ternary statements
    'no-unused-expressions': ['error', {allowTernary: true}],

    // Max line length
    'max-len': ['error', 380, 4],

    // Allow parameter attributes to be reassigned
    'no-param-reassign': ['error', {props: false}],

    // Prefer const over let
    'prefer-const': 0,

    // misc
    'no-multiple-empty-lines': [2, {max: 1, maxEOF: 0, maxBOF: 0}],
    'linebreak-style': ['off', 'unix'],
    'import/extensions': ['error', 'ignorePackages', {js: 'never', vue: 'never', scss: 'never'}],
    'no-control-regex': 0,
    'no-plusplus': [2, {allowForLoopAfterthoughts: true}],

    // disallow empty functions, except for standalone funcs/arrows
    // https://eslint.org/docs/rules/no-empty-function
    'no-empty-function': ['error', {allow: []}],

    // >>> PEARS requests

    // allow `new Vue()` without assigning to a variable
    'no-new': 0,

    // just one var declaration per function
    'one-var': ['error', 'consecutive'],

    // require or disallow space before function opening parenthesis
    // https://eslint.org/docs/rules/space-before-function-paren
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],

    // spacing
    'object-curly-spacing': ['error', 'never'],

    // this option sets a specific tab width for your code
    // https://eslint.org/docs/rules/indent
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 'first',
        outerIIFEBody: 1,
        // MemberExpression: null,
        FunctionDeclaration: {
          parameters: 1,
          body: 1,
        },
        FunctionExpression: {
          parameters: 1,
          body: 1,
        },
        CallExpression: {
          arguments: 1,
        },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        // list derived from https://github.com/benjamn/ast-types/blob/HEAD/def/jsx.js
        ignoredNodes: [
          'JSXElement',
          'JSXElement > *',
          'JSXAttribute',
          'JSXIdentifier',
          'JSXNamespacedName',
          'JSXMemberExpression',
          'JSXSpreadAttribute',
          'JSXExpressionContainer',
          'JSXOpeningElement',
          'JSXClosingElement',
          'JSXText',
          'JSXEmptyExpression',
          'JSXSpreadChild',
        ],
        ignoreComments: false,
      },
    ],

    // put runtime deps in devDependancies also since the package is getting rolled up w/ webpack
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}],

    // We don't care about this
    'import/prefer-default-export': 'off',

    // Make it allow multiple attributes per line
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 6,
        multiline: 1,
      },
    ],

    // allow no name functions in some cases
    'func-names': ['error', 'never'],

    // TEMPORARY - allow v-html for now until we do clean-html directive
    'vue/no-v-html': ['off'],

  },
};
