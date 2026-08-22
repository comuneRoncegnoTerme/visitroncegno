const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";
const routeSlug = process.argv[2] || "circuito-del-castagno";

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required");
  process.exit(1);
}

const headers = DIRECTUS_TOKEN
  ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
  : {};

async function directus(path) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}

function normalize(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "di", "del", "della", "delle", "dei", "degli", "da", "in", "a", "al", "alla",
  "san", "santa", "santo", "chiesa", "chiesetta", "maso", "roncegno", "terme", "foto", "img", "image"
]);

function tokens(value) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function score(place, file) {
  const placeTokens = tokens(`${place.title} ${place.slug}`);
  const fileText = `${file.title || ""} ${file.filename_download || ""} ${file.description || ""}`;
  const fileNorm = normalize(fileText);
  let points = 0;

  for (const token of placeTokens) {
    if (fileNorm.includes(token)) points += token.length >= 7 ? 4 : 2;
  }

  const placeNorm = normalize(place.title);
  if (placeNorm && fileNorm.includes(placeNorm)) points += 12;
  return points;
}

async function main() {
  const routeParams = new URLSearchParams({
    "filter[slug][_eq]": routeSlug,
    fields: "id,title,slug",
    limit: "1",
  });
  const routeResult = await directus(`/items/routes?${routeParams}`);
  const route = routeResult.data?.[0];

  if (!route) {
    console.error(`Route not found: ${routeSlug}`);
    process.exit(1);
  }

  const pointParams = new URLSearchParams({
    "filter[route][_eq]": String(route.id),
    fields: "id,sort,title,place.id,place.title,place.slug,place.image",
    sort: "sort",
    limit: "100",
  });
  const pointsResult = await directus(`/items/route_points?${pointParams}`);
  const points = pointsResult.data || [];

  const filesParams = new URLSearchParams({
    fields: "id,title,filename_download,type,description",
    limit: "-1",
  });
  const filesResult = await directus(`/files?${filesParams}`);
  const imageFiles = (filesResult.data || []).filter((file) =>
    typeof file.type === "string" && file.type.startsWith("image/")
  );

  console.log(`Route: ${route.title} (${route.slug})`);
  console.log(`Points: ${points.length} | Image assets: ${imageFiles.length}`);
  console.log("");

  let missing = 0;

  for (const point of points) {
    if (!point.place) {
      console.log(`[${String(point.sort ?? "-").padStart(2, "0")}] ${point.title}: no linked place`);
      continue;
    }

    const place = point.place;
    if (place.image) {
      console.log(`[OK] ${place.title} -> image ${place.image}`);
      continue;
    }

    missing += 1;
    console.log(`[MISSING] ${place.title} (${place.slug}, place ${place.id})`);

    const candidates = imageFiles
      .map((file) => ({ file, score: score(place, file) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (candidates.length === 0) {
      console.log("  no filename/title match found in Directus assets");
    } else {
      for (const { file, score: value } of candidates) {
        console.log(`  candidate score=${value}: ${file.id} | ${file.title || "-"} | ${file.filename_download || "-"}`);
      }
    }
    console.log("");
  }

  console.log(`Missing linked place images: ${missing}`);
  console.log("Audit only: no Directus record was modified.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
