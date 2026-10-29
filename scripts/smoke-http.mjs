#!/usr/bin/env node
/**
 * Smoke test HTTP del sito pubblico, in sola lettura.
 *
 *   npm run smoke -- https://www.visitroncegno.it
 *   SMOKE_BASE_URL=http://localhost:3000 npm run smoke
 *
 * Controlla: pagine principali, URL dei pannelli QR (/it/sentieri/*) ricavati dal codice, tutti i QR stampati
 * (/qrx/<codice> da data/qr-codes.json),
 * redirect degli URL storici, tutte le voci della sitemap, link dell'archivio memoria e video.
 * Esce con codice 1 se qualcosa non risponde come previsto.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const failures = [];
const passes = [];
const note = (ok, label, detail = "") => (ok ? passes : failures).push(`${label}${detail ? ` — ${detail}` : ""}`);

async function request(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  try {
    return await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000), ...init });
  } catch (error) {
    return { status: 0, headers: new Headers(), text: async () => "", error };
  }
}

async function expectOk(path, label = path) {
  const response = await request(path);
  note(response.status === 200, label, `HTTP ${response.status || response.error?.message}`);
  return response;
}

async function expectRedirect(path, destination) {
  const response = await request(path);
  const location = response.headers.get("location") ?? "";
  const target = location.replace(base, "");
  // Lo slash finale viene prima normalizzato da Next con un 308 verso lo stesso percorso senza slash.
  if ([307, 308].includes(response.status) && target === path.replace(/\/+$/, "")) return expectRedirect(target, destination);
  note([301, 308].includes(response.status) && target === destination, `redirect ${path}`, `HTTP ${response.status} → ${target || "(nessuno)"}, atteso ${destination}`);
}

async function inBatches(items, size, task) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(task));
  }
}

// 1. Pagine principali
const pages = [
  "/", "/luoghi", "/percorsi", "/eventi", "/musei", "/musei/mulino-angeli", "/musei/museo-della-musica",
  "/memoria", "/festa-della-castagna", "/sentieri-di-roncegno", "/organizza-la-visita", "/scopri-roncegno", "/e-bike", "/cartina", "/robots.txt", "/sitemap.xml", "/api/health",
];
await inBatches(pages, 4, (path) => expectOk(path));

// 2. Pannelli QR: inventario statico nel codice + storie con percorso legacy esplicito
const panelSlugs = [read("src/lib/trail-panels.ts"), read("src/lib/cinque-valli-panels.ts"), read("src/lib/masi-panels.ts")]
  .flatMap((source) => [...source.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((match) => match[1]));
const storyPaths = [...read("src/lib/stories.ts").matchAll(/:\s*"(\/it\/sentieri\/[^"]+)"/g)].map((match) => match[1]);
const panelPaths = [...new Set([...panelSlugs.map((slug) => `/it/sentieri/${slug}`), ...storyPaths])].sort();
await inBatches(panelPaths, 4, (path) => expectOk(path, `QR ${path}`));

// 2b. Tutti i QR stampati (data/qr-codes.json) codificano /qrx/<codice>: seguendo i redirect devono arrivare a una pagina 200.
async function expectReachable(path, label, hops = 0) {
  const response = await request(path);
  const location = response.headers.get("location");
  if ([301, 302, 303, 307, 308].includes(response.status) && location && hops < 5) {
    return expectReachable(location.replace(base, "").split("#")[0], label, hops + 1);
  }
  note(response.status === 200, label, `HTTP ${response.status || response.error?.message}${hops ? ` dopo ${hops} redirect (${path})` : ""}`);
}
const qrCodes = JSON.parse(read("data/qr-codes.json")).codes;
await inBatches(qrCodes, 4, (qr) => expectReachable(`/qrx/${qr.code}`, `QR ${qr.name} ${qr.path ?? "/"}`));
const unassigned = qrCodes.filter((qr) => !qr.path).map((qr) => qr.name);
if (unassigned.length) console.log(`QR senza indirizzo nel gestionale: ${unassigned.join(", ")}`);

// 3. URL storici del sito precedente
const legacy = {
  "/it/": "/",
  "/it/eventi/": "/eventi",
  "/it/ristoranti/": "/organizza-la-visita#mangiare",
  "/it/dormire/": "/organizza-la-visita#dormire",
  "/it/contacts/contatti": "/organizza-la-visita",
  "/it/roncegno-terme/": "/",
  "/it/roncegno-terme/percorsi": "/percorsi",
  "/it/roncegno-terme/luoghi-da-non-perdere": "/luoghi",
  "/it/roncegno-terme/sentieri-e-percorsi-outd": "/percorsi",
  "/it/sentieri/sentieri-di-roncegno-1": "/percorsi/circuito-del-castagno",
  "/it/sentieri/novita-in-arrivo": "/percorsi",
  "/sentieri": "/percorsi",
  "/natura-e-montagna": "/temi/natura-e-montagna",
};
await inBatches(Object.entries(legacy), 4, ([path, destination]) => expectRedirect(path, destination));

// 4. Sitemap: ogni voce deve rispondere 200 (l'origine viene sostituita con quella in prova)
const sitemap = await request("/sitemap.xml");
const locations = sitemap.status === 200
  ? [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  : [];
note(locations.length > 0, "sitemap contiene URL", `${locations.length} voci`);
await inBatches(locations.filter((path) => !pages.includes(path) && !panelPaths.includes(path)), 4, (path) => expectOk(path, `sitemap ${path}`));

// 5. Archivio memoria: i link non devono tornare a /memoria dello stesso sito
const memoria = await request("/memoria");
if (memoria.status === 200) {
  const links = [...new Set([...(await memoria.text()).matchAll(/href="([^"]*\/it\/memoria\/[^"]*)"/g)].map((match) => match[1]))];
  for (const link of links) {
    const absolute = new URL(link, base);
    if (absolute.origin === new URL(base).origin) {
      note(false, `archivio memoria ${absolute.pathname}`, "punta al sito stesso: impostare MEMORIA_ARCHIVE_URL");
    } else {
      note(true, `archivio memoria ${absolute.host}${absolute.pathname}`, "fuori dal nuovo sito");
    }
  }
}

// 6. Video della Festa: MP4 standard, richieste parziali supportate (necessarie per Safari)
const video = await request("/videos/festa-castagna-atmosfera.mp4", { headers: { Range: "bytes=0-31" } });
const head = video.status === 206 ? Buffer.from(await video.arrayBuffer()) : Buffer.alloc(0);
const brand = head.subarray(8, 12).toString("latin1");
note(video.status === 206 && (video.headers.get("content-type") ?? "").includes("video/mp4") && brand !== "qt  ",
  "video Festa", `HTTP ${video.status}, ${video.headers.get("content-type")}, brand "${brand}"`);

console.log(`Smoke test su ${base}`);
console.log(`OK: ${passes.length}`);
for (const failure of failures) console.error(`ERRORE: ${failure}`);
if (process.argv.includes("--verbose")) for (const pass of passes) console.log(`ok  ${pass}`);
if (failures.length) process.exitCode = 1;
