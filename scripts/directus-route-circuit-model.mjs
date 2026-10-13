// Circuiti di percorsi: un percorso "circuito" raccoglie più anelli, ognuno con il proprio GPX.
//
// 1. Aggiunge routes.parent_route (percorso -> circuito di cui fa parte), se manca.
// 2. Prepara il Circuito del Castagno: crea in bozza i tre anelli e li collega al circuito.
//    I percorsi già presenti (stesso slug) non vengono toccati.
//
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run directus:ensure-route-circuit-model

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

// ---------------------------------------------------------------- Campo e relazione

const fieldsResponse = await directus("/fields/routes");
const existingFields = new Set((fieldsResponse?.data ?? []).map((field) => field.field));

if (!existingFields.has("parent_route")) {
  await directus("/fields/routes", {
    method: "POST",
    body: JSON.stringify({
      field: "parent_route",
      type: "integer",
      meta: {
        interface: "select-dropdown-m2o",
        note: "Circuito di cui questo percorso fa parte (es. un anello del Circuito del Castagno). Vuoto per i percorsi singoli.",
        display: "related-values",
        options: { template: "{{title}}" },
      },
      schema: { is_nullable: true },
    }),
  });
  console.log("created routes.parent_route");
} else {
  console.log("skip routes.parent_route");
}

const relationResponse = await directus("/relations/routes/parent_route").catch(() => null);
if (!relationResponse?.data) {
  await directus("/relations", {
    method: "POST",
    body: JSON.stringify({
      collection: "routes",
      field: "parent_route",
      related_collection: "routes",
      schema: { on_delete: "SET NULL" },
      meta: {
        many_collection: "routes",
        many_field: "parent_route",
        one_collection: "routes",
        one_field: null,
      },
    }),
  });
  console.log("created relation routes.parent_route -> routes");
} else {
  console.log("skip relation routes.parent_route -> routes");
}

// ---------------------------------------------------------------- Circuito del Castagno

const CIRCUIT = { slug: "circuito-del-castagno", title: "Circuito del Castagno" };

// I tre anelli, con i nomi dei tracciati Outdooractive del vecchio sito.
const LOOPS = [
  { slug: "castagno-maso-molini", title: "Castagno di Maso Molini", sort: 1 },
  { slug: "da-maso-zonti-a-maso-montibelleri", title: "Da Maso Zonti a Maso Montibelleri", sort: 2 },
  { slug: "santa-brigida-e-del-castagno", title: "Santa Brigida e del Castagno", sort: 3 },
];

async function findRoute(slug) {
  const params = new URLSearchParams({ "filter[slug][_eq]": slug, fields: "id,title,status,parent_route", limit: "1" });
  const result = await directus(`/items/routes?${params}`);
  return result?.data?.[0] ?? null;
}

let circuit = await findRoute(CIRCUIT.slug);
if (!circuit) {
  const created = await directus("/items/routes", {
    method: "POST",
    body: JSON.stringify({ status: "draft", title: CIRCUIT.title, slug: CIRCUIT.slug, loop_route: true }),
  });
  circuit = created.data;
  console.log(`created route "${CIRCUIT.title}" (draft, id ${circuit.id})`);
} else {
  console.log(`found circuit "${circuit.title}" (id ${circuit.id}, ${circuit.status})`);
}

for (const loop of LOOPS) {
  const existing = await findRoute(loop.slug);
  if (existing) {
    console.log(`skip "${existing.title}": already exists (id ${existing.id}, ${existing.status})`);
    continue;
  }
  const created = await directus("/items/routes", {
    method: "POST",
    body: JSON.stringify({
      status: "draft",
      title: loop.title,
      slug: loop.slug,
      sort: loop.sort,
      loop_route: true,
      parent_route: circuit.id,
    }),
  });
  console.log(`created "${loop.title}" (draft, id ${created.data.id}) in ${CIRCUIT.title}`);
}

console.log(`
Circuito pronto. Nel Content Hub, sezione Percorsi:
- completa i tre anelli (GPX, km, durata, dislivello, foto, descrizione) e pubblicali;
- nella scheda "${CIRCUIT.title}" la mappa mostrerà da sola i tracciati degli anelli pubblicati.`);
