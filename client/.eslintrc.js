module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
    },
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": 0,
    "no-unused-vars": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-undef": "error",
    "react/no-unescaped-entities": [
      "off",
      {
        forbid: [
          {
            char: "'",
            alternatives: ["&apos;", "&#39;"],
          },
          {
            char: '"',
            alternatives: ["&quot;", "&#34;"],
          },
        ],
      },
    ],
    "no-extra-boolean-cast": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
