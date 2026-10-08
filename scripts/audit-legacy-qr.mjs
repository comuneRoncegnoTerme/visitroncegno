#!/usr/bin/env node
/**
 * Static, read-only check for VisitRoncegno's QR-backed legacy routes.
 * No Directus credentials or network access required by default.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const trail = read("src/lib/trail-panels.ts");
const valleys = read("src/lib/cinque-valli-panels.ts");
const stories = read("src/lib/stories.ts");
const page = read("app/it/sentieri/[slug]/page.tsx");
const nextConfig = read("next.config.ts");
const errors = [];
const warnings = [];

const panelEntries = (source) =>
  [...source.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((match) => match[1]);
const panelSlugs = [...panelEntries(trail), ...panelEntries(valleys)];
const panelPaths = panelSlugs.map((slug) => `/it/sentieri/${slug}`);

const seen = new Set();
for (const slug of panelSlugs) {
  if (seen.has(slug)) errors.push(`Duplicate panel slug: ${slug}`);
  seen.add(slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`Invalid panel slug: ${slug}`);
  }
}

if (!page.includes("getStaticTrailPanel(slug)") ||
    !page.includes("getTrailPanel(slug)") ||
    !page.includes("getCinqueValliPanel(slug)")) {
  errors.push("The legacy route no longer appears to resolve both static panel inventories.");
}

const referencePaths = [
  ...trail.matchAll(/href:\s*"(\/it\/sentieri\/[^"]+)"/g),
].map((match) => match[1]);
for (const path of referencePaths) {
  if (!panelPaths.includes(path)) {
    warnings.push(`Related panel URL is not in static inventory (may resolve from Directus): ${path}`);
  }
}

const explicitMappings = [...stories.matchAll(/:\s*"(\/it\/sentieri\/[^"]+)"/g)].map((match) => match[1]);
if (!stories.includes("getStoryByLegacySlug")) {
  errors.push("Missing Directus legacy-story resolver.");
}
if (!page.includes("getDirectusTrailPanel(slug)")) {
  errors.push("Legacy route no longer queries Directus stories.");
}

const redirectDestinations = [...nextConfig.matchAll(/destination:\s*"(\/[^"]+)"/g)].map((match) => match[1]);
for (const path of [...panelPaths, ...explicitMappings]) {
  if (redirectDestinations.includes(path)) errors.push(`Unexpected redirect targets an existing legacy panel URL: ${path}`);
}

const paths = [...new Set([...panelPaths, ...explicitMappings])].sort();
console.log(`Static legacy panel URLs: ${panelPaths.length}`);
console.log(`Explicit story mappings: ${explicitMappings.length}`);
console.log(`Distinct known legacy URLs: ${paths.length}`);
console.log("These checks validate repository wiring, not live HTTP availability or Directus-only slugs.");
for (const value of warnings) console.warn(`WARN: ${value}`);
for (const value of errors) console.error(`ERROR: ${value}`);

if (process.argv.includes("--list")) {
  for (const path of paths) console.log(path);
}

if (errors.length) process.exitCode = 1;
