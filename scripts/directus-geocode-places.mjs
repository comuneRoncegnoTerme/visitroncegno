// Coordinate dei luoghi Directus.
//
// 1. Esporta (senza modificare nulla) tutti i record di `places` con le coordinate attuali,
//    controlla quelle presenti e cerca quelle mancanti su OpenStreetMap (Nominatim),
//    limitando la ricerca al territorio di Roncegno Terme. Scrive un CSV da rivedere.
// 2. Con `--apply <file.csv>` scrive in Directus le righe con "si" nella colonna `applica`.
//    Senza `--yes` mostra solo cosa verrebbe scritto.
//
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:geocode-places
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:geocode-places -- --apply luoghi-coordinate.csv --yes

import { readFileSync, writeFileSync } from "node:fs";

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? "").replace(/\/+$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? "";
const args = process.argv.slice(2);
const applyIndex = args.indexOf("--apply");
const applyFile = applyIndex >= 0 ? args[applyIndex + 1] : null;
const confirmed = args.includes("--yes");
const offline = args.includes("--no-search");
const outIndex = args.indexOf("--out");
const outFile = outIndex >= 0 ? args[outIndex + 1] : "luoghi-coordinate.csv";

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required.");
  process.exit(1);
}
if (applyFile && !DIRECTUS_TOKEN) {
  console.error("DIRECTUS_TOKEN is required to write coordinates.");
  process.exit(1);
}

// Territorio comunale con un po' di margine (fondovalle, Panarotta, Gronlait, Monte Cola).
const AREA = { west: 11.3, east: 11.5, south: 45.96, north: 46.15 };

// Punti già verificati sulla mappa ufficiale della Festa della castagna (data/festa-castagna/mymaps-2025.kml).
// Le postazioni della Festa non coincidono sempre con l'ingresso del locale: affidabilità media.
const KNOWN_POINTS = [
  { match: ["parcheggio marter"], lat: 46.0390112, lng: 11.4005924, confidence: "alta" },
  { match: ["parcheggio oratorio", "parcheggio roncegno oratorio"], lat: 46.0489192, lng: 11.4059008, confidence: "alta" },
  { match: ["parcheggio ferme", "parcheggio loc ferme", "parcheggio localita ferme"], lat: 46.0497544, lng: 11.4214222, confidence: "alta" },
  { match: ["parcheggio camper", "area camper"], lat: 46.0467871, lng: 11.4202742, confidence: "alta" },
  { match: ["bar tre venezie", "tre venezie"], lat: 46.0529139, lng: 11.4102876, confidence: "media" },
  { match: ["bar villa rosa", "villa rosa"], lat: 46.0515389, lng: 11.4098938, confidence: "media" },
];

const headers = DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {};

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function inArea(lat, lng) {
  return lat >= AREA.south && lat <= AREA.north && lng >= AREA.west && lng <= AREA.east;
}

function round(value) {
  return Math.round(value * 1e6) / 1e6;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

// ---------------------------------------------------------------- CSV

const SEPARATOR = ";";

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^﻿/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === SEPARATOR || char === ",") {
      // Excel in italiano salva con ";": la virgola vale come separatore solo se il file non ne contiene.
      if (char === SEPARATOR || !source.includes(SEPARATOR)) { row.push(cell); cell = ""; }
      else cell += char;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((line) => line.some((value) => value.trim() !== ""));
  return body.map((line) => Object.fromEntries(head.map((key, index) => [key.trim(), (line[index] ?? "").trim()])));
}

// ---------------------------------------------------------------- Ricerca

function knownPoint(place) {
  const title = normalize(place.title);
  // Confronto a parole intere: "villa rosa" non deve agganciare "villa rosalinda".
  return KNOWN_POINTS.find(({ match }) => match.some((candidate) => ` ${title} `.includes(` ${candidate} `)));
}

let lastSearch = 0;

async function nominatim(query) {
  // Regole d'uso di Nominatim: massimo una richiesta al secondo e un User-Agent riconoscibile.
  const wait = 1100 - (Date.now() - lastSearch);
  if (wait > 0) await sleep(wait);
  lastSearch = Date.now();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    countrycodes: "it",
    viewbox: `${AREA.west},${AREA.north},${AREA.east},${AREA.south}`,
    bounded: "1",
    "accept-language": "it",
  }).toString();
  const response = await fetch(url, { headers: { "User-Agent": "visitroncegno.it coordinate luoghi (script redazione)" } });
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  return response.json();
}

// Parole del titolo che contano per riconoscere il risultato giusto.
const GENERIC_WORDS = new Set([
  "di", "del", "della", "dei", "degli", "delle", "da", "dal", "al", "alla", "alle", "e", "la", "il", "lo", "le",
  "i", "gli", "a", "in", "roncegno", "terme", "loc", "localita",
]);

function significantWords(text) {
  return normalize(text).split(" ").filter((word) => word.length > 1 && !GENERIC_WORDS.has(word));
}

function scoreResult(place, result) {
  const words = significantWords(place.title);
  if (!words.length) return 0;
  const haystack = normalize(`${result.name ?? ""} ${result.display_name ?? ""}`);
  const found = words.filter((word) => haystack.includes(word)).length;
  return found / words.length;
}

async function searchPlace(place) {
  const queries = [
    `${place.title}, Roncegno Terme`,
    place.address ? `${place.address}, Roncegno Terme` : null,
    place.title,
  ].filter(Boolean);

  let best = null;
  for (const query of queries) {
    let results;
    try {
      results = await nominatim(query);
    } catch (error) {
      return { error: error.message };
    }
    for (const result of results) {
      if (result.category === "boundary" || result.type === "administrative") continue;
      const lat = Number(result.lat);
      const lng = Number(result.lon);
      if (!inArea(lat, lng)) continue;
      const score = query.startsWith(place.address ?? "\u0000") ? 0.6 : scoreResult(place, result);
      if (!best || score > best.score) best = { lat, lng, score, label: result.display_name, query };
    }
    if (best && best.score >= 0.99) break;
  }
  if (!best) return null;
  return {
    ...best,
    confidence: best.score >= 0.99 ? "alta" : best.score >= 0.5 ? "media" : "bassa",
  };
}

// ---------------------------------------------------------------- Export

async function exportPlaces() {
  const fields = ["id", "title", "slug", "status", "place_type", "address", "latitude", "longitude", "show_on_map"];
  const { data } = await directus(`/items/places?limit=-1&sort=title&fields=${fields.join(",")}`);
  console.log(`Luoghi in Directus: ${data.length}`);

  const rows = [];
  for (const place of data) {
    const lat = toNumber(place.latitude);
    const lng = toNumber(place.longitude);
    const row = {
      id: place.id,
      titolo: place.title,
      tipo: place.place_type ?? "",
      stato: place.status ?? "",
      in_mappa: place.show_on_map === false ? "no" : "si",
      indirizzo: place.address ?? "",
      lat_attuale: lat ?? "",
      lng_attuale: lng ?? "",
      controllo: "",
      lat_proposta: "",
      lng_proposta: "",
      fonte: "",
      affidabilita: "",
      trovato: "",
      verifica: "",
      applica: "",
    };

    if (lat !== null && lng !== null && inArea(lat, lng)) {
      row.controllo = "ok";
    } else if (lat !== null && lng !== null && inArea(lng, lat)) {
      row.controllo = "latitudine e longitudine invertite";
      Object.assign(row, { lat_proposta: lng, lng_proposta: lat, fonte: "scambio dei valori attuali", affidabilita: "alta" });
    } else {
      row.controllo = lat === null || lng === null ? "mancanti" : "fuori dal territorio";
      const known = knownPoint(place);
      const found = known
        ? { lat: known.lat, lng: known.lng, confidence: known.confidence, label: "Mappa Festa della castagna 2025" }
        : offline ? null : await searchPlace(place);

      if (found?.error) {
        row.fonte = `errore ricerca: ${found.error}`;
      } else if (found) {
        Object.assign(row, {
          lat_proposta: round(found.lat),
          lng_proposta: round(found.lng),
          fonte: known ? "mappa Festa" : `OpenStreetMap (${found.query})`,
          affidabilita: found.confidence,
          trovato: found.label,
        });
      } else {
        row.fonte = offline ? "" : "nessun risultato: inserire a mano";
      }
    }

    if (row.lat_proposta !== "") {
      row.verifica = `https://www.openstreetmap.org/?mlat=${row.lat_proposta}&mlon=${row.lng_proposta}#map=18/${row.lat_proposta}/${row.lng_proposta}`;
      row.applica = row.affidabilita === "alta" ? "si" : "";
    } else if (row.controllo === "ok") {
      row.verifica = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
    }

    rows.push(row);
    console.log(`${String(place.id).padStart(4)}  ${row.controllo.padEnd(34)} ${row.affidabilita.padEnd(6)} ${place.title}`);
  }

  const columns = Object.keys(rows[0] ?? { id: "" });
  const csv = [columns.join(SEPARATOR), ...rows.map((row) => columns.map((key) => csvCell(row[key])).join(SEPARATOR))].join("\r\n");
  writeFileSync(outFile, `﻿${csv}\r\n`);

  const count = (predicate) => rows.filter(predicate).length;
  console.log(`
Scritto ${outFile}
  coordinate già corrette:     ${count((row) => row.controllo === "ok")}
  proposte affidabili (si):    ${count((row) => row.applica === "si")}
  proposte da controllare:     ${count((row) => row.lat_proposta !== "" && row.applica !== "si")}
  da inserire a mano:          ${count((row) => row.controllo !== "ok" && row.lat_proposta === "")}

Apri il CSV, controlla le proposte con il link "verifica", correggi lat/lng se serve
e scrivi "si" nella colonna "applica" per le righe da salvare. Poi:
  npm run directus:geocode-places -- --apply ${outFile}         (anteprima)
  npm run directus:geocode-places -- --apply ${outFile} --yes   (scrive in Directus)`);
}

// ---------------------------------------------------------------- Apply

async function applyCoordinates() {
  const rows = parseCsv(readFileSync(applyFile, "utf8"));
  const updates = [];
  for (const row of rows) {
    if (normalize(row.applica) !== "si") continue;
    const lat = toNumber(row.lat_proposta);
    const lng = toNumber(row.lng_proposta);
    if (lat === null || lng === null || !inArea(lat, lng)) {
      console.warn(`Saltato ${row.id} ${row.titolo}: coordinate non valide o fuori dal territorio (${row.lat_proposta}, ${row.lng_proposta})`);
      continue;
    }
    updates.push({ id: row.id, title: row.titolo, lat: round(lat), lng: round(lng) });
  }

  if (!updates.length) {
    console.log("Nessuna riga con \"si\" nella colonna applica.");
    return;
  }

  for (const update of updates) {
    console.log(`${confirmed ? "Scrivo" : "Scriverei"}  ${String(update.id).padStart(4)}  ${update.lat}, ${update.lng}  ${update.title}`);
    if (confirmed) {
      await directus(`/items/places/${encodeURIComponent(update.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ latitude: update.lat, longitude: update.lng }),
      });
    }
  }
  console.log(confirmed
    ? `\nAggiornati ${updates.length} luoghi.`
    : `\nAnteprima: ${updates.length} luoghi. Aggiungi --yes per scrivere in Directus.`);
}

await (applyFile ? applyCoordinates() : exportPlaces());
