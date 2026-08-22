const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";
const apply = process.argv.includes("--apply");

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required");
  process.exit(1);
}

if (!DIRECTUS_TOKEN) {
  console.error("DIRECTUS_TOKEN is required for relation repair");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }

  return body;
}

async function relationExists(collection, field) {
  const response = await fetch(`${DIRECTUS_URL}/relations/${collection}/${field}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
  });
  if (response.status === 404) return false;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Unable to inspect relation ${collection}.${field}: ${response.status} ${text}`);
  }
  return true;
}

const desiredRelations = [
  {
    collection: "route_points",
    field: "route",
    related_collection: "routes",
    schema: {
      on_update: "NO ACTION",
      on_delete: "CASCADE",
    },
    meta: {
      many_collection: "route_points",
      many_field: "route",
      one_collection: "routes",
      one_field: null,
      one_deselect_action: "nullify",
      sort_field: null,
      junction_field: null,
    },
  },
  {
    collection: "route_points",
    field: "place",
    related_collection: "places",
    schema: {
      on_update: "NO ACTION",
      on_delete: "SET NULL",
    },
    meta: {
      many_collection: "route_points",
      many_field: "place",
      one_collection: "places",
      one_field: null,
      one_deselect_action: "nullify",
      sort_field: null,
      junction_field: null,
    },
  },
];

async function main() {
  console.log(`Directus relation repair: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log("");

  let missing = 0;
  for (const relation of desiredRelations) {
    const key = `${relation.collection}.${relation.field} -> ${relation.related_collection}`;
    if (await relationExists(relation.collection, relation.field)) {
      console.log(`[OK] ${key}`);
      continue;
    }

    missing += 1;
    console.log(`[MISSING] ${key}`);
    console.log(`  on_delete=${relation.schema.on_delete}`);

    if (apply) {
      const result = await request("/relations", {
        method: "POST",
        body: JSON.stringify(relation),
      });
      console.log(`  created relation id=${result?.data?.meta?.id ?? result?.data?.id ?? "?"}`);
    }
  }

  console.log("");
  if (!apply) {
    console.log(`Dry run complete. Missing relation(s): ${missing}`);
    console.log("No Directus schema was modified. Re-run with --apply to create only the missing relations.");
  } else {
    console.log(`Apply complete. Missing relation(s) handled: ${missing}`);
    console.log("Re-run the audit script afterwards to verify relation metadata and linked route points.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
