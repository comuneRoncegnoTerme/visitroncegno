const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? "").replace(/\/+$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? "";
const strict = process.argv.includes("--strict");

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required.");
  process.exit(1);
}

const DISPLAY_FIELDS = [
  "id", "title", "slug", "status", "place_type", "detail_mode",
  "canonical_path", "external_detail_url", "image", "latitude", "longitude",
  "address", "opening_hours", "ticket_info", "visit_duration", "services_notes",
  "capacity_notes", "restrictions_notes", "phone", "email", "website_url",
  "booking_url", "access_notes", "parking_notes", "public_transport_notes",
];

const PRACTICAL_FIELDS = [
  "opening_hours", "ticket_info", "visit_duration", "services_notes",
  "capacity_notes", "restrictions_notes", "access_notes", "parking_notes",
  "public_transport_notes",
];

const KNOWN_TYPES = new Set([
  "heritage", "museum", "institution", "parking", "station", "food", "sleep",
  "service", "nature", "other",
]);

const DEDICATED_MUSEUM_PAGES = [
  {
    path: "/musei/mulino-angeli",
    matches: ["mulino angeli", "casa museo degli spaventapasseri"],
  },
  {
    path: "/musei/museo-della-musica",
    matches: [
      "museo della musica", "museo degli strumenti musicali",
      "museo strumenti musicali", "strumenti musicali popolari",
    ],
  },
];

const headers = DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {};

async function directus(path) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET ${path} failed (${response.status}): ${body}`);
  }
  return response.json();
}

function present(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function display(value) {
  if (!present(value)) return "-";
  if (typeof value === "object") return value.id ?? JSON.stringify(value);
  return String(value).replace(/[\t\r\n]+/g, " ");
}

function issue(severity, code, message) {
  return { severity, code, message };
}

function dedicatedMuseumPath(place) {
  const haystack = normalize(`${place.title ?? ""} ${place.slug ?? ""}`);
  return DEDICATED_MUSEUM_PAGES.find(({ matches }) =>
    matches.some((candidate) => haystack.includes(candidate))
  )?.path;
}

function auditPlace(place) {
  const issues = [];
  const add = (severity, code, message) => issues.push(issue(severity, code, message));
  const type = place.place_type;
  const mode = place.detail_mode;

  for (const field of ["title", "slug", "place_type", "detail_mode"]) {
    if (!present(place[field])) add("ERROR", "MISSING_CORE", `campo obbligatorio assente: ${field}`);
  }

  if (present(type) && !KNOWN_TYPES.has(type)) {
    add("ERROR", "UNKNOWN_PLACE_TYPE", `place_type non riconosciuto: ${type}`);
  }

  if (!present(place.image)) add("WARN", "MISSING_IMAGE", "immagine assente");
  if (!present(place.latitude) || !present(place.longitude)) {
    const detail = present(place.latitude) || present(place.longitude)
      ? "coppia di coordinate incompleta"
      : "coordinate assenti";
    add("WARN", "MISSING_COORDINATES", detail);
  }

  if (mode === "redirect" && !present(place.canonical_path)) {
    add("ERROR", "REDIRECT_WITHOUT_CANONICAL", "redirect senza canonical_path");
  }
  if (present(place.canonical_path) && !String(place.canonical_path).startsWith("/")) {
    add("ERROR", "INVALID_CANONICAL", "canonical_path deve iniziare con /");
  }
  if (mode === "external" && !present(place.external_detail_url)) {
    add("ERROR", "EXTERNAL_WITHOUT_URL", "external senza external_detail_url");
  }
  if (present(place.external_detail_url) && !/^https?:\/\//i.test(place.external_detail_url)) {
    add("ERROR", "INVALID_EXTERNAL_URL", "external_detail_url non è un URL http(s)");
  }
  if (present(place.canonical_path) && mode !== "redirect") {
    add("WARN", "UNUSED_CANONICAL", `canonical_path valorizzato con detail_mode=${mode ?? "-"}`);
  }
  if (present(place.external_detail_url) && mode !== "external") {
    add("WARN", "UNUSED_EXTERNAL_URL", `external_detail_url valorizzato con detail_mode=${mode ?? "-"}`);
  }

  if (["parking", "station"].includes(type) && mode !== "compact") {
    add("ERROR", "PRACTICAL_NOT_COMPACT", `${type} deve usare detail_mode=compact`);
  }

  const museumPath = type === "museum" ? dedicatedMuseumPath(place) : undefined;
  if (museumPath && (mode !== "redirect" || place.canonical_path !== museumPath)) {
    add(
      "ERROR",
      "MUSEUM_DEDICATED_PAGE",
      `pagina dedicata riconosciuta: impostare redirect verso ${museumPath}`,
    );
  }

  const recommendedByType = {
    museum: ["opening_hours", "ticket_info", "visit_duration", "services_notes"],
    parking: ["address", "capacity_notes", "restrictions_notes"],
    station: ["address", "services_notes", "public_transport_notes"],
    food: ["address", "opening_hours"],
    sleep: ["address", "services_notes"],
    service: ["address", "opening_hours"],
    institution: ["address", "opening_hours"],
    heritage: ["access_notes"],
    nature: ["access_notes"],
  };

  for (const field of recommendedByType[type] ?? []) {
    if (!present(place[field])) {
      add("WARN", "MISSING_TYPE_FIELD", `${field} consigliato per place_type=${type}`);
    }
  }

  if (["food", "sleep", "service", "institution"].includes(type)) {
    const contacts = ["phone", "email", "website_url", "booking_url"];
    if (!contacts.some((field) => present(place[field]))) {
      add("WARN", "MISSING_CONTACT", `nessun contatto disponibile (${contacts.join(", ")})`);
    }
  }

  return issues;
}

async function availableFields() {
  try {
    const response = await directus("/fields/places");
    return new Set((response.data ?? []).map((field) => field.field));
  } catch (error) {
    console.warn(`Schema Directus non disponibile; provo i campi attesi. ${error.message}`);
    return null;
  }
}

async function fetchPlaces(fields) {
  const places = [];
  const pageSize = 100;

  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams({
      fields: fields.join(","),
      sort: "title,id",
      limit: String(pageSize),
      offset: String(offset),
    });
    const response = await directus(`/items/places?${params}`);
    const page = response.data ?? [];
    places.push(...page);
    if (page.length < pageSize) return places;
  }
}

function printPlace(place, issues, fields) {
  console.log(`\nPLACE ${display(place.id)} | ${display(place.title)}`);
  for (const field of fields) console.log(`${field}\t${display(place[field])}`);
  console.log(`practical_fields_present\t${PRACTICAL_FIELDS.filter((field) => present(place[field])).join(",") || "-"}`);
  if (issues.length === 0) console.log("issues\tOK");
  for (const entry of issues) {
    console.log(`issue\t[${entry.severity}] ${entry.code}: ${entry.message}`);
  }
}

async function main() {
  const schemaFields = await availableFields();
  const fields = schemaFields
    ? DISPLAY_FIELDS.filter((field) => schemaFields.has(field))
    : DISPLAY_FIELDS;
  const missingSchemaFields = schemaFields
    ? DISPLAY_FIELDS.filter((field) => !schemaFields.has(field))
    : [];

  const places = await fetchPlaces(fields);
  const results = places.map((place) => ({ place, issues: auditPlace(place) }));

  console.log("Directus places audit (read-only)");
  console.log(`Endpoint: ${DIRECTUS_URL}`);
  console.log(`Places: ${places.length}`);
  if (missingSchemaFields.length) {
    console.log(`[SCHEMA] Campi non presenti nella collection: ${missingSchemaFields.join(", ")}`);
  }

  for (const result of results) printPlace(result.place, result.issues, DISPLAY_FIELDS);

  const allIssues = results.flatMap(({ issues }) => issues);
  const errors = allIssues.filter(({ severity }) => severity === "ERROR").length;
  const warnings = allIssues.filter(({ severity }) => severity === "WARN").length;
  const affected = results.filter(({ issues }) => issues.length > 0).length;

  console.log("\nSUMMARY");
  console.log(`places_total\t${places.length}`);
  console.log(`places_with_issues\t${affected}`);
  console.log(`errors\t${errors}`);
  console.log(`warnings\t${warnings}`);
  console.log(`schema_fields_missing\t${missingSchemaFields.length}`);
  console.log("mode\tREAD-ONLY: no Directus record was modified");

  if (strict && (errors > 0 || warnings > 0 || missingSchemaFields.length > 0)) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
