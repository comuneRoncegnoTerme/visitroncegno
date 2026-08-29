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

async function fieldExists(field) {
  const response = await fetch(`${baseUrl}/fields/stories/${field}`, { headers });
  if (response.status === 404) return false;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET /fields/stories/${field} failed (${response.status}): ${body}`);
  }
  return true;
}

const fields = [
  {
    field: "audio_file",
    type: "string",
    meta: {
      interface: "input",
      note: "UUID del file MP3 in Directus. Il Content Hub offre il selettore media.",
    },
    schema: { is_nullable: true },
  },
  {
    field: "audio_title",
    type: "string",
    meta: {
      interface: "input",
      note: "Titolo mostrato nel player. Se vuoto viene usato il titolo della scheda.",
    },
    schema: { is_nullable: true },
  },
];

let created = 0;
for (const definition of fields) {
  if (await fieldExists(definition.field)) {
    console.log(`skip ${definition.field}`);
    continue;
  }

  await directus("/fields/stories", {
    method: "POST",
    body: JSON.stringify(definition),
  });
  created += 1;
  console.log(`created ${definition.field}`);
}

const minieraParams = new URLSearchParams({
  "filter[source_url][_contains]": "/it/sentieri/miniera-di-cinque-valli-8",
  fields: "id,audio_file,audio_title",
  limit: "1",
});
const miniera = await directus(`/items/stories?${minieraParams.toString()}`);
const minieraStory = miniera?.data?.[0];

if (minieraStory && !minieraStory.audio_file) {
  await directus(`/items/stories/${minieraStory.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      audio_file: "8c3546a0-fc47-4dc7-a2cc-ef1a76a62870",
      audio_title: minieraStory.audio_title || "Ascolta: La miniera di Cinque Valli",
    }),
  });
  console.log("linked Miniera audioguide");
} else if (minieraStory) {
  console.log("skip Miniera audioguide: already linked");
}

console.log(`Directus story media model ready. Created ${created} field(s).`);
