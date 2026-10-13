// Compila le schede degli anelli del Circuito del Castagno a partire dai GPX in data/percorsi/circuito-del-castagno.
//
// Per ogni anello: carica il GPX nei file di Directus e riempie i campi della bozza creata da
// scripts/directus-route-circuit-model.mjs (km, dislivelli, quote, partenza, testi).
// Scrive solo i campi ancora vuoti, così non tocca quello che è già stato sistemato nel Content Hub
// (con --force sovrascrive). Lo stato non cambia: le schede restano in bozza finché non le pubblichi.
//
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:fill-castagno-loops [-- --force]

import fs from "node:fs";
import path from "node:path";

const baseUrl = (process.env.DIRECTUS_URL ?? "").replace(/\/+$/, "");
const token = process.env.DIRECTUS_TOKEN ?? "";
const force = process.argv.includes("--force");

if (!baseUrl || !token) {
  console.error("DIRECTUS_URL and DIRECTUS_TOKEN are required.");
  process.exit(1);
}

const GPX_DIR = path.join("data", "percorsi", "circuito-del-castagno");

async function directus(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? "GET"} ${pathname} failed (${response.status}): ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

// Dati presi dai tracciati Outdooractive (APT Valsugana e Lagorai): dislivello e tempi sono quelli
// ufficiali della scheda Outdooractive, km e quote sono calcolati dal GPX.
const LOOPS = [
  {
    slug: "santa-brigida-e-del-castagno",
    gpx: "santa-brigida-e-del-castagno.gpx",
    fields: {
      summary:
        "Anello di 6,2 km che sale dal paese tra antichi masi e castagneti fino alla chiesetta di Santa Brigida, da cui si apre un ampio panorama sulla valle.",
      route_highlight: "Il panorama dalla chiesetta di Santa Brigida",
      description:
        "Una passeggiata che riporta indietro nel tempo, tra gli antichi masi e i castagni del versante sopra Roncegno. " +
        "Dal paese, a circa 495 m, si sale con pendenza costante fino a sfiorare i 890 m, si raggiunge la chiesetta di Santa Brigida " +
        "e si torna al punto di partenza scendendo per un'altra strada. Lungo la salita si passa da Maso Montibelleri, " +
        "dove arriva il collegamento da Maso Zonti. Sono circa 400 m di dislivello da fare con calma: meglio scarpe da escursione, " +
        "soprattutto in discesa dopo la pioggia.",
      difficulty: "facile-moderata",
      distance_km: 6.2,
      duration_minutes: 150,
      elevation_gain_m: 398,
      elevation_loss_m: 398,
      min_elevation_m: 494,
      max_elevation_m: 891,
      start_latitude: 46.05088,
      start_longitude: 11.409638,
      loop_route: true,
      outdooractive_url:
        "https://www.outdooractive.com/it/route/escursione/roncegno/passeggiata-santa-brigida-e-del-castagno/17105533/",
    },
  },
  {
    slug: "da-maso-zonti-a-maso-montibelleri",
    gpx: "da-maso-zonti-a-maso-montibelleri.gpx",
    fields: {
      summary:
        "Breve collegamento di 1,8 km che unisce Maso Zonti a Maso Montibelleri, sull'anello di Santa Brigida e del Castagno.",
      route_highlight: "Il raccordo tra i masi del Circuito del Castagno",
      description:
        "Il tratto parte da Maso Zonti, a circa 745 m, e sale deciso: in poco più di un chilometro supera i 940 m, il punto più alto, " +
        "poi scende dolcemente fino a Maso Montibelleri, a circa 865 m. Qui si incrocia l'anello di Santa Brigida e del Castagno, " +
        "così da allungare la passeggiata o passare da un giro all'altro. È un percorso di sola andata: per tornare a Maso Zonti " +
        "si ripercorre lo stesso tratto.",
      difficulty: "facile-moderata",
      distance_km: 1.8,
      duration_minutes: 50,
      elevation_gain_m: 196,
      elevation_loss_m: 76,
      min_elevation_m: 745,
      max_elevation_m: 941,
      start_latitude: 46.055562,
      start_longitude: 11.402624,
      loop_route: false,
      outdooractive_url:
        "https://www.outdooractive.com/it/route/escursione/valsugana-lagorai-tesino/collegamento-strada-castagno-da-maso-zonti-a-maso-montibelleri/804080122/",
    },
  },
];

const isEmpty = (value) => value === null || value === undefined || value === "";

async function uploadGpx(file, title) {
  const form = new FormData();
  form.append("title", title);
  form.append("file", new Blob([fs.readFileSync(path.join(GPX_DIR, file))], { type: "application/gpx+xml" }), file);
  const result = await directus("/files", { method: "POST", body: form });
  return result.data.id;
}

for (const loop of LOOPS) {
  const params = new URLSearchParams({
    "filter[slug][_eq]": loop.slug,
    fields: ["id", "title", "status", "gpx_file", ...Object.keys(loop.fields)].join(","),
    limit: "1",
  });
  const route = (await directus(`/items/routes?${params}`))?.data?.[0];
  if (!route) {
    console.log(`skip "${loop.slug}": not found (run npm run directus:ensure-route-circuit-model first)`);
    continue;
  }

  const patch = {};
  for (const [field, value] of Object.entries(loop.fields)) {
    // loop_route è già true nelle bozze create dallo script del circuito: va corretto anche se "pieno".
    if (force || isEmpty(route[field]) || field === "loop_route") patch[field] = value;
  }
  if (force || isEmpty(route.gpx_file)) {
    patch.gpx_file = await uploadGpx(loop.gpx, `GPX · ${route.title}`);
  }

  const changed = Object.keys(patch).filter((field) => patch[field] !== route[field]);
  if (changed.length === 0) {
    console.log(`skip "${route.title}": nothing to fill`);
    continue;
  }

  await directus(`/items/routes/${route.id}`, { method: "PATCH", body: JSON.stringify(patch) });
  console.log(`filled "${route.title}" (id ${route.id}, ${route.status}): ${changed.join(", ")}`);
}

console.log(`
Schede compilate. Nel Content Hub, sezione Percorsi: aggiungi la foto, rileggi i testi e pubblica.`);
