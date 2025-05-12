module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-explicit-any": "warn", // Prefer 'warn' over 'error' for now
    "@typescript-eslint/explicit-module-boundary-types": "off", // Can be enabled later if desired
    // Add any project-specific rules here
  },
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
};
