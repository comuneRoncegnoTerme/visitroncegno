#!/usr/bin/env node
/**
 * Copia in public/ il worker di MapLibre della versione installata.
 * Il worker viene caricato da /maplibre-gl-worker.mjs (vedi src/lib/maplibre-worker.ts):
 * se la copia in public/ non corrisponde alla libreria, le mappe non si avviano.
 * Eseguito automaticamente prima di `npm run build` e `npm run dev`.
 */
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "node_modules/maplibre-gl/dist");
const target = resolve(root, "public");

for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  const source = resolve(dist, file);
  const destination = resolve(target, file);
  if (existsSync(source)) {
    copyFileSync(source, destination);
    console.log(`maplibre: ${file} aggiornato`);
  } else if (existsSync(destination)) {
    // Le versioni recenti non hanno più il modulo condiviso: la vecchia copia va rimossa.
    rmSync(destination);
    console.log(`maplibre: ${file} rimosso (non più presente nella libreria)`);
  }
}
