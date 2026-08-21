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
    field: "place_type",
    type: "string",
    meta: {
      interface: "select-dropdown",
      note: "Determina quali informazioni sono rilevanti nella scheda pubblica.",
      options: {
        choices: [
          ["heritage", "Patrimonio / monumento"],
          ["museum", "Museo"],
          ["institution", "Istituzione / edificio pubblico"],
          ["parking", "Parcheggio"],
          ["station", "Stazione / mobilità"],
          ["food", "Ristorazione"],
          ["sleep", "Ospitalità"],
          ["service", "Servizio"],
          ["nature", "Natura"],
          ["other", "Altro"],
        ].map(([value, text]) => ({ value, text })),
      },
    },
    schema: { is_nullable: true },
  },
  {
    field: "detail_mode",
    type: "string",
    meta: {
      interface: "select-dropdown",
      note: "Decide se il luogo usa una scheda completa, compatta o rimanda a un contenuto dedicato.",
      options: {
        choices: [
          { value: "internal", text: "Scheda luogo completa" },
          { value: "compact", text: "Scheda pratica compatta" },
          { value: "redirect", text: "Rimando a pagina interna dedicata" },
          { value: "external", text: "Rimando a sito esterno" },
        ],
      },
    },
    schema: { is_nullable: true },
  },
  { field: "canonical_path", type: "string", meta: { interface: "input", note: "Percorso interno, ad esempio /musei/mulino-angeli." }, schema: { is_nullable: true } },
  { field: "external_detail_url", type: "string", meta: { interface: "input", note: "URL ufficiale da usare quando detail_mode è external." }, schema: { is_nullable: true } },
  { field: "opening_hours", type: "text", meta: { interface: "input-multiline", note: "Orari solo quando utili al visitatore; evitare dati instabili se esiste una fonte ufficiale migliore." }, schema: { is_nullable: true } },
  { field: "ticket_info", type: "text", meta: { interface: "input-multiline", note: "Biglietti, costi o accesso gratuito." }, schema: { is_nullable: true } },
  { field: "visit_duration", type: "string", meta: { interface: "input", note: "Durata indicativa della visita, ad esempio 45 min." }, schema: { is_nullable: true } },
  { field: "services_notes", type: "text", meta: { interface: "input-multiline", note: "Servizi disponibili rilevanti per il visitatore." }, schema: { is_nullable: true } },
  { field: "capacity_notes", type: "string", meta: { interface: "input", note: "Capienza o posti disponibili, utile soprattutto per parcheggi e servizi." }, schema: { is_nullable: true } },
  { field: "restrictions_notes", type: "text", meta: { interface: "input-multiline", note: "Limitazioni, divieti, accessi regolamentati o altre condizioni." }, schema: { is_nullable: true } },
];

async function directus(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${body}`);
  }
  return response.status === 204 ? null : response.json();
}

const existingResponse = await directus("/fields/places");
const existing = new Set((existingResponse?.data ?? []).map((field) => field.field));

let created = 0;
for (const definition of fields) {
  if (existing.has(definition.field)) {
    console.log(`skip ${definition.field}`);
    continue;
  }

  await directus("/fields/places", {
    method: "POST",
    body: JSON.stringify(definition),
  });
  created += 1;
  console.log(`created ${definition.field}`);
}

console.log(`Directus place model ready. Created ${created} field(s).`);
