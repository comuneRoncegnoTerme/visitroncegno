#!/usr/bin/env node
// Contenuti dell'opuscolo InfoRoncegno 2026 che mancano in Directus (data/inforoncegno-2026/contenuti.json).
//
// Crea luoghi, percorsi e storie che non esistono ancora (confronto per slug: quelli già presenti non
// vengono toccati) e completa alcuni record esistenti: i campi "fill" si scrivono solo se vuoti, i campi
// "set" sostituiscono il valore attuale. Senza `--yes` mostra soltanto cosa farebbe.
//
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:inforoncegno-2026
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:inforoncegno-2026 -- --yes
//   ... -- --yes --draft      # crea i nuovi record come bozza invece che pubblicati

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? "").replace(/\/+$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? "";
const confirmed = process.argv.includes("--yes");
const status = process.argv.includes("--draft") ? "draft" : "published";

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required.");
  process.exit(1);
}
if (confirmed && !DIRECTUS_TOKEN) {
  console.error("DIRECTUS_TOKEN is required to write to Directus.");
  process.exit(1);
}

const content = JSON.parse(readFileSync(resolve(import.meta.dirname, "../data/inforoncegno-2026/contenuti.json"), "utf8"));
const headers = DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {};

async function directus(path, init = {}) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed (${response.status}): ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

async function bySlug(collection, fields = "id,slug") {
  const params = new URLSearchParams({ limit: "-1", fields });
  const response = await directus(`/items/${collection}?${params}`);
  return new Map((response?.data ?? []).map((item) => [item.slug, item]));
}

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === "";

const existing = {};
for (const collection of ["places", "routes", "stories"]) {
  try {
    existing[collection] = await bySlug(collection, collection === "stories" ? "id,slug" : "*");
  } catch (error) {
    if (confirmed) throw error;
    console.warn(`! ${collection}: non leggibile senza token (${error.message.split(":")[0]}), confronto saltato`);
    existing[collection] = null;
  }
}

let planned = 0;

// 1. Nuovi record (prima i luoghi: le storie si collegano a un luogo per slug).
for (const collection of ["places", "routes", "stories"]) {
  for (const item of content.create[collection] ?? []) {
    if (existing[collection]?.has(item.slug)) {
      console.log(`= ${collection}/${item.slug} esiste già, lasciato com'è`);
      continue;
    }
    const record = { ...item, status };
    if (collection === "stories" && item.place) {
      const place = existing.places?.get(item.place);
      if (!place && confirmed) throw new Error(`Luogo "${item.place}" non trovato per la storia ${item.slug}`);
      record.place = place?.id ?? null;
    }
    planned += 1;
    console.log(`+ ${collection}/${item.slug} — ${item.title}${collection === "stories" && item.place ? ` (luogo: ${item.place})` : ""}`);
    if (!confirmed) continue;
    const created = await directus(`/items/${collection}`, { method: "POST", body: JSON.stringify(record) });
    existing[collection]?.set(item.slug, created.data);
  }
}

// 2. Integrazioni di record esistenti.
for (const [collection, updates] of Object.entries(content.update ?? {})) {
  for (const { slug, fill = {}, set = {} } of updates) {
    const current = existing[collection]?.get(slug);
    if (!current) {
      console.warn(`! ${collection}/${slug} non trovato, aggiornamento saltato`);
      continue;
    }
    const changes = {};
    for (const [field, value] of Object.entries(fill)) {
      if (isEmpty(current[field])) changes[field] = value;
      else if (current[field] !== value) console.log(`= ${collection}/${slug}.${field} già valorizzato ("${current[field]}"), lasciato com'è`);
    }
    for (const [field, value] of Object.entries(set)) {
      if (current[field] !== value) changes[field] = value;
    }
    if (!Object.keys(changes).length) continue;
    planned += 1;
    for (const [field, value] of Object.entries(changes)) {
      console.log(`~ ${collection}/${slug}.${field}: ${JSON.stringify(current[field] ?? null)} → ${JSON.stringify(value)}`);
    }
    if (confirmed) await directus(`/items/${collection}/${current.id}`, { method: "PATCH", body: JSON.stringify(changes) });
  }
}

console.log(confirmed
  ? `Scritte ${planned} modifiche in Directus (nuovi record: ${status}).`
  : `${planned} modifiche previste. Nulla è stato scritto: rilanciare con --yes per applicarle.`);
