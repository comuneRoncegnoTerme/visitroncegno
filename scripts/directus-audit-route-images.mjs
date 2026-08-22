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

async function tryDirectus(path) {
  try {
    return { ok: true, result: await directus(path) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
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

async function auditRelations() {
  console.log("Directus relation audit: route_points");

  const [relationsCheck, routeFieldCheck, placeFieldCheck] = await Promise.all([
    tryDirectus("/relations/route_points"),
    tryDirectus("/fields/route_points/route"),
    tryDirectus("/fields/route_points/place"),
  ]);

  if (!relationsCheck.ok) {
    console.log(`  relations metadata: unavailable (${relationsCheck.error})`);
  } else {
    const relations = relationsCheck.result.data || [];
    for (const field of ["route", "place"]) {
      const relation = relations.find((entry) => entry.field === field);
      if (!relation) {
        console.log(`  [BROKEN] ${field}: no relation metadata found`);
      } else {
        console.log(`  [OK] ${field}: ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
      }
    }
  }

  for (const [fieldName, check] of [["route", routeFieldCheck], ["place", placeFieldCheck]]) {
    if (!check.ok) {
      console.log(`  [WARN] field ${fieldName}: metadata unavailable (${check.error})`);
      continue;
    }

    const field = check.result.data;
    const special = Array.isArray(field?.meta?.special) ? field.meta.special.join(",") : field?.meta?.special || "-";
    console.log(`  field ${fieldName}: type=${field?.type || "-"} special=${special}`);
  }

  console.log("");
}

async function main() {
  await auditRelations();

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
    fields: "id,sort,title,route,place.id,place.title,place.slug,place.image",
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

  let unlinked = 0;
  let missing = 0;

  for (const point of points) {
    if (!point.place) {
      unlinked += 1;
      console.log(`[UNLINKED] [${String(point.sort ?? "-").padStart(2, "0")}] ${point.title}: route=${point.route ?? "-"}, no linked place`);

      const pseudoPlace = { title: point.title, slug: normalize(point.title).replace(/\s+/g, "-") };
      const candidates = imageFiles
        .map((file) => ({ file, score: score(pseudoPlace, file) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      for (const { file, score: value } of candidates) {
        console.log(`  asset candidate score=${value}: ${file.id} | ${file.title || "-"} | ${file.filename_download || "-"}`);
      }
      console.log("");
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

  console.log(`Unlinked route points: ${unlinked}`);
  console.log(`Missing linked place images: ${missing}`);
  console.log("Audit only: no Directus record was modified.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
