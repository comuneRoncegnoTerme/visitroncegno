import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
