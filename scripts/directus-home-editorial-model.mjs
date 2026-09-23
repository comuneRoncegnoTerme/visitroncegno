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
  ["routes_eyebrow", "Soprattitolo della sezione Esperienze e percorsi."],
  ["routes_title", "Titolo della sezione Esperienze e percorsi."],
  ["routes_description", "Testo introduttivo della sezione Esperienze e percorsi."],
  ["routes_link_label", "Etichetta del link verso l'indice dei percorsi."],
  ["routes_link_url", "Destinazione del link verso l'indice dei percorsi."],
  ["highlights_eyebrow", "Soprattitolo della sezione Luoghi in evidenza."],
  ["highlights_title", "Titolo della sezione Luoghi in evidenza."],
  ["highlights_description", "Testo introduttivo della sezione Luoghi in evidenza."],
  ["highlights_link_label", "Etichetta del link verso l'indice dei luoghi."],
  ["highlights_link_url", "Destinazione del link verso l'indice dei luoghi."],
  ["map_eyebrow", "Soprattitolo del richiamo alla cartina."],
  ["map_title", "Titolo del richiamo alla cartina."],
  ["map_description", "Testo del richiamo alla cartina e alla mappa interattiva."],
  ["map_primary_label", "Etichetta della CTA principale della cartina."],
  ["map_primary_url", "Destinazione della CTA principale della cartina."],
  ["map_secondary_label", "Etichetta della CTA secondaria della cartina."],
  ["map_secondary_url", "Destinazione della CTA secondaria della cartina."],
].map(([field, note]) => ({
  field,
  type: "string",
  meta: {
    interface: field.includes("description") ? "input-multiline" : "input",
    note,
  },
  schema: { is_nullable: true },
}));

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

console.log(`Directus homepage editorial model ready. Created ${created} field(s).`);
