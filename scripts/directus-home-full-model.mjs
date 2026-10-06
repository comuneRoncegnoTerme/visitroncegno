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

const textFields = [
  ["identity_eyebrow", "Soprattitolo della fascia identitaria."],
  ["identity_title", "Titolo della fascia identitaria."],
  ["identity_description", "Descrizione della fascia identitaria."],
  ["identity_fact_1_value", "Valore del primo dato identitario."],
  ["identity_fact_1_label", "Etichetta del primo dato identitario."],
  ["identity_fact_2_value", "Valore del secondo dato identitario."],
  ["identity_fact_2_label", "Etichetta del secondo dato identitario."],
  ["identity_fact_3_value", "Valore del terzo dato identitario."],
  ["identity_fact_3_label", "Etichetta del terzo dato identitario."],
  ["seasonal_eyebrow", "Soprattitolo o data del banner stagionale."],
  ["seasonal_title", "Titolo del banner stagionale."],
  ["seasonal_description", "Descrizione del banner stagionale."],
  ["seasonal_primary_label", "Etichetta della CTA principale del banner stagionale."],
  ["seasonal_primary_url", "Destinazione della CTA principale del banner stagionale."],
  ["seasonal_secondary_label", "Etichetta della CTA secondaria del banner stagionale."],
  ["seasonal_secondary_url", "Destinazione della CTA secondaria del banner stagionale."],
  ["seasonal_note_small", "Nota breve del banner stagionale."],
  ["seasonal_note_strong", "Nota in evidenza del banner stagionale."],
  ["events_eyebrow", "Soprattitolo della sezione eventi."],
  ["events_title", "Titolo della sezione eventi."],
  ["events_description", "Descrizione della sezione eventi."],
  ["events_link_label", "Etichetta del link alla pagina eventi."],
  ["events_link_url", "Destinazione del link alla pagina eventi."],
  ["memory_eyebrow", "Soprattitolo della sezione memoria."],
  ["memory_title", "Titolo della sezione memoria."],
  ["memory_description", "Descrizione della sezione memoria."],
  ["memory_link_label", "Etichetta della CTA della sezione memoria."],
  ["memory_link_url", "Destinazione della CTA della sezione memoria."],
  ["planning_eyebrow", "Soprattitolo della sezione pianifica la visita."],
  ["planning_title", "Titolo della sezione pianifica la visita."],
  ["planning_description", "Descrizione della sezione pianifica la visita."],
  ["closing_eyebrow", "Soprattitolo della sezione finale."],
  ["closing_title", "Titolo della sezione finale."],
  ["closing_description", "Descrizione della sezione finale."],
  ["closing_primary_label", "Etichetta della CTA principale finale."],
  ["closing_primary_url", "Destinazione della CTA principale finale."],
  ["closing_secondary_label", "Etichetta della CTA secondaria finale."],
  ["closing_secondary_url", "Destinazione della CTA secondaria finale."],
].map(([field, note]) => ({
  field,
  type: "string",
  meta: {
    interface: field.includes("description") ? "input-multiline" : "input",
    note,
  },
  schema: { is_nullable: true },
}));

const fields = [
  {
    field: "seasonal_enabled",
    type: "boolean",
    meta: {
      interface: "boolean",
      note: "Mostra o nasconde il banner stagionale nella homepage.",
    },
    schema: { is_nullable: false, default_value: true },
  },
  ...textFields,
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

console.log(`Directus full homepage model ready. Created ${created} field(s).`);
