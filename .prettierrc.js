module.exports = {
  // Basic formatting rules
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // Language-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};