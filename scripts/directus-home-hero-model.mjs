const baseUrl = (process.env.DIRECTUS_URL ?? "").replace(/\/+$/, "");
const token = process.env.DIRECTUS_TOKEN ?? "";

if (!baseUrl || !token) {
  console.error("DIRECTUS_URL and DIRECTUS_TOKEN are required.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const fields = [
  {
    field: "hero_mode",
    type: "string",
    meta: {
      interface: "select-dropdown",
      note: "Modalità del media principale. Se vuoto, la home continua a usare la fotografia attuale.",
      options: {
        choices: [
          { value: "photo", text: "Fotografia" },
          { value: "video", text: "Video" },
          { value: "illustration", text: "Illustrazione" },
          { value: "minimal", text: "Hero tipografica / colore" },
        ],
      },
    },
    schema: { is_nullable: true },
  },
  {
    field: "hero_video_url",
    type: "string",
    meta: {
      interface: "input",
      note: "URL del video hero. Usato solo quando hero_mode è video; l’immagine resta il poster/fallback.",
    },
    schema: { is_nullable: true },
  },
  {
    field: "hero_atmosphere_enabled",
    type: "boolean",
    meta: {
      interface: "boolean",
      note: "Applica un trattamento di luce molto leggero basato sull’ora locale di Roncegno.",
    },
    schema: { is_nullable: false, default_value: false },
  },
  {
    field: "hero_hotspots_enabled",
    type: "boolean",
    meta: {
      interface: "boolean",
      note: "Mostra i punti territoriali definiti nel campo hero_hotspots.",
    },
    schema: { is_nullable: false, default_value: false },
  },
  {
    field: "hero_hotspots",
    type: "json",
    meta: {
      interface: "input-code",
      note: "Elenco opzionale di hotspot: [{\"label\":\"...\",\"href\":\"/percorso\",\"x\":35,\"y\":42}]. Coordinate in percentuale sul media.",
      options: { language: "json" },
    },
    schema: { is_nullable: true },
  },
  {
    field: "hero_ambient_audio_enabled",
    type: "boolean",
    meta: {
      interface: "boolean",
      note: "Abilita il controllo volontario Ascolta il paesaggio. Nessun autoplay audio.",
    },
    schema: { is_nullable: false, default_value: false },
  },
  {
    field: "hero_ambient_audio_url",
    type: "string",
    meta: {
      interface: "input",
      note: "URL di una registrazione ambientale autentica. Usato solo se l’audio è abilitato.",
    },
    schema: { is_nullable: true },
  },
];

async function directus(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

const existingResponse = await directus("/fields/homepage");
const existing = new Set((existingResponse?.data ?? []).map((field) => field.field));

let created = 0;
for (const definition of fields) {
  if (existing.has(definition.field)) {
    console.log(`skip ${definition.field}`);
    continue;
  }

  await directus("/fields/homepage", {
    method: "POST",
    body: JSON.stringify(definition),
  });
  created += 1;
  console.log(`created ${definition.field}`);
}

console.log(`Directus homepage hero model ready. Created ${created} field(s).`);
