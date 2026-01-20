// eslint.config.js
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  js.configs.recommended,

  {
    files: ["src/**/*.ts", "src\\**\\*.ts"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        crypto: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        CryptoKey: "readonly",
        AlgorithmIdentifier: "readonly",
        RsaPssParams: "readonly",
        EcdsaParams: "readonly"
      }
    },

    plugins: {
      "@typescript-eslint": tsPlugin
    },

    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
];