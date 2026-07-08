import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "e2e/**/*.ts", "vite.config.ts", "playwright.config.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "no-undef": "off",
    },
  },
  prettier,
);
