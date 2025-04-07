// @ts-check
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const flatCompat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    files: ["**/*.{mjs,ts,tsx}"],
    ignores: ["dist"],
  },
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
      sourceType: "module",
      ecmaVersion: 2020,
    },
  },
  js.configs.recommended,
  ...flatCompat.extends("next/core-web-vitals"),
  ...flatCompat.extends("next/typescript"),
  eslintConfigPrettier,
);
