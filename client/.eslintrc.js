// https://eslint.org/
module.exports = {
    parser: "babel-eslint",
    env: {
      browser: true,
      es6: true,
      node: true
    },
    plugins: ["prettier", "react", "react-hooks"],
  
    // https://eslint.org/docs/rules/
    rules: {
      // https://github.com/prettier/eslint-plugin-prettier
      "prettier/prettier": "error",
  
      "prefer-const": "error",
      "no-use-before-define": "error",
      "no-var": "error",
      "no-throw-literal": "error",
      // Light console usage is useful but remove debug logs before merging to master.
      "no-console": "off",
  
      // https://www.npmjs.com/package/eslint-plugin-react-hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    extends: [
      // https://github.com/prettier/eslint-config-prettier
      "prettier",
      "plugin:react/recommended",
      "eslint:recommended"
    ]
  };
  