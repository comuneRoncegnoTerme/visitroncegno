import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Existing Content Hub code predates the stricter React 19 lint rules.
    // Keep these visible as warnings while the editor components are refactored,
    // instead of making unrelated infrastructure PRs fail CI.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated vendor bundles copied for the map worker are not source files.
    "public/maplibre-gl-shared.mjs",
    "public/maplibre-gl-worker.mjs",
  ]),
]);

export default eslintConfig;
