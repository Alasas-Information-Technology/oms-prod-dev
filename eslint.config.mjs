import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone manual-test/debug scripts, not part of the app build.
    "sample.js",
    "test-fetch.js",
    "test-stream.js",
    "test-users.js",
    "scripts/test-org-data-layer.js",
  ]),
]);

export default eslintConfig;
