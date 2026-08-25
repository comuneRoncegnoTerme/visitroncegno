const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";
const strict = process.argv.includes("--strict");

if (!DIRECTUS_URL) {
  console.error("DIRECTUS_URL is required");
  process.exit(1);
}

const headers = DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {};

async function directus(path) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}

function hasPair(a, b) {
  return a !== null && a !== undefined && b !== null && b !== undefined;
}

function pushIssue(issues, severity, message) {
  issues.push({ severity, message });
}

async function main() {
  const routeParams = new URLSearchParams({
    "filter[status][_eq]": "published",
    sort: "sort,title",
    limit: "-1",
    fields: [
      "id","title","slug","summary","description","image","difficulty","distance_km",
      "duration_minutes","elevation_gain_m","elevation_loss_m","min_elevation_m","max_elevation_m",
      "start_latitude","start_longitude","duration_class","audience","experience_type","season",
      "family_friendly","accessible","public_transport","loop_route","featured","recommended",
      "route_highlight","komoot_url","outdooractive_url","gpx_file","category.name"
    ].join(","),
  });

  const routesResult = await directus(`/items/routes?${routeParams}`);
  const routes = routesResult.data || [];

  const pointParams = new URLSearchParams({
    sort: "route,sort,title",
    limit: "-1",
    fields: [
      "id","sort","title","description","latitude","longitude","highlight","route",
      "place.id","place.title","place.slug","place.image","place.latitude","place.longitude",
      "place.detail_mode","place.canonical_path","place.external_detail_url","place.place_type"
    ].join(","),
  });

  const pointsResult = await directus(`/items/route_points?${pointParams}`);
  const points = pointsResult.data || [];
  const pointsByRoute = new Map();
  for (const point of points) {
    const routeId = typeof point.route === "object" ? point.route?.id : point.route;
    if (!routeId) continue;
    if (!pointsByRoute.has(routeId)) pointsByRoute.set(routeId, []);
    pointsByRoute.get(routeId).push(point);
  }

  console.log(`Published routes: ${routes.length}`);
  console.log("");

  let routesWithIssues = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const route of routes) {
    const issues = [];
    const routePoints = pointsByRoute.get(route.id) || [];

    if (!route.slug) pushIssue(issues, "ERROR", "missing slug");
    if (!route.summary) pushIssue(issues, "WARN", "missing summary");
    if (!route.description) pushIssue(issues, "WARN", "missing description");
    if (!route.image) pushIssue(issues, "WARN", "missing hero image");
    if (!route.gpx_file) pushIssue(issues, "WARN", "missing GPX file");
    if (!route.difficulty) pushIssue(issues, "WARN", "missing difficulty");
    if (route.distance_km === null) pushIssue(issues, "WARN", "missing distance_km");
    if (route.duration_minutes === null) pushIssue(issues, "WARN", "missing duration_minutes");
    if (route.elevation_gain_m === null) pushIssue(issues, "WARN", "missing elevation_gain_m");
    if (!hasPair(route.start_latitude, route.start_longitude)) pushIssue(issues, "WARN", "missing start coordinates");
    if (routePoints.length === 0) pushIssue(issues, "WARN", "no route_points");

    for (const point of routePoints) {
      const prefix = `point ${point.sort ?? "-"} \"${point.title}\"`;
      if (!point.place) {
        pushIssue(issues, "ERROR", `${prefix}: no linked place`);
        if (!hasPair(point.latitude, point.longitude)) {
          pushIssue(issues, "WARN", `${prefix}: no point coordinates either`);
        }
        continue;
      }

      const place = point.place;
      if (!place.image) pushIssue(issues, "WARN", `${prefix}: linked place \"${place.title}\" has no image`);
      if (!hasPair(place.latitude, place.longitude) && !hasPair(point.latitude, point.longitude)) {
        pushIssue(issues, "WARN", `${prefix}: neither place nor point has coordinates`);
      }
      if (place.detail_mode === "redirect" && !(place.canonical_path || "").startsWith("/")) {
        pushIssue(issues, "ERROR", `${prefix}: redirect place without canonical_path`);
      }
      if (place.detail_mode === "external" && !/^https?:\/\//i.test(place.external_detail_url || "")) {
        pushIssue(issues, "ERROR", `${prefix}: external place without valid external_detail_url`);
      }
    }

    const errors = issues.filter((item) => item.severity === "ERROR").length;
    const warnings = issues.length - errors;
    errorCount += errors;
    warningCount += warnings;

    console.log(`${issues.length ? "[CHECK]" : "[OK]"} ${route.title} (${route.slug})`);
    console.log(`  points=${routePoints.length} | gpx=${route.gpx_file ? "yes" : "no"} | image=${route.image ? "yes" : "no"}`);
    for (const issue of issues) console.log(`  [${issue.severity}] ${issue.message}`);
    console.log("");

    if (issues.length) routesWithIssues += 1;
  }

  console.log(`Routes with issues: ${routesWithIssues}/${routes.length}`);
  console.log(`Errors: ${errorCount} | Warnings: ${warningCount}`);
  console.log("Audit only: no Directus record was modified.");

  if (strict && (errorCount > 0 || warningCount > 0)) process.exit(2);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
