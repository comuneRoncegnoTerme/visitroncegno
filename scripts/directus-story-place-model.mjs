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

const fieldsResponse = await directus("/fields/stories");
const existingFields = new Set((fieldsResponse?.data ?? []).map((field) => field.field));

if (!existingFields.has("place")) {
  await directus("/fields/stories", {
    method: "POST",
    body: JSON.stringify({
      field: "place",
      type: "integer",
      meta: {
        interface: "select-dropdown-m2o",
        note: "Luogo principale a cui questa storia o testimonianza è collegata.",
        display: "related-values",
      },
      schema: { is_nullable: true },
    }),
  });
  console.log("created stories.place");
} else {
  console.log("skip stories.place");
}

const relationsResponse = await directus("/relations/stories/place").catch(() => null);
if (!relationsResponse?.data) {
  await directus("/relations", {
    method: "POST",
    body: JSON.stringify({
      collection: "stories",
      field: "place",
      related_collection: "places",
      schema: {
        on_delete: "SET NULL",
      },
      meta: {
        many_collection: "stories",
        many_field: "place",
        one_collection: "places",
        one_field: null,
      },
    }),
  });
  console.log("created relation stories.place -> places");
} else {
  console.log("skip relation stories.place -> places");
}

console.log("Directus story/place relation ready.");
