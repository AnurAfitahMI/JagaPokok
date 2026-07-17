module.exports = {
  extends: ['expo'],
  ignorePatterns: ['dist/*'],
  overrides: [
    {
      files: ['__tests__/**/*.{js,ts,tsx}'],
      env: {
        jest: true,
        node: true,
      },
    },
  ],
};
