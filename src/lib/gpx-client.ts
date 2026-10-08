export interface GpxPoint {
  latitude: number;
  longitude: number;
  elevation: number | null;
}

export interface ElevationPoint extends GpxPoint {
  elevation: number;
  distanceKm: number;
}

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

// Parser testuale: funziona identico sul server (rendering della pagina) e nel browser.
// DOMParser esiste solo nel browser e faceva fallire con errore 500 le pagine percorso con GPX.
const TAG = "(?:[\\w.-]+:)?";
const SEGMENT_PATTERN = new RegExp(`<${TAG}trkseg\\b[^>]*>([\\s\\S]*?)</${TAG}trkseg\\s*>`, "gi");
const ELEVATION_PATTERN = new RegExp(`<${TAG}ele\\b[^>]*>\\s*([^<\\s]+)\\s*</${TAG}ele\\s*>`, "i");

function pointPattern(tag: "trkpt" | "rtept") {
  return new RegExp(`<${TAG}${tag}\\b([^>]*?)(?:/>|>([\\s\\S]*?)</${TAG}${tag}\\s*>)`, "gi");
}

function attribute(attributes: string, name: string) {
  const match = attributes.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? Number(match[1]) : Number.NaN;
}

function parsePoints(source: string, tag: "trkpt" | "rtept"): GpxPoint[] {
  const points: GpxPoint[] = [];

  for (const match of source.matchAll(pointPattern(tag))) {
    const latitude = attribute(match[1], "lat");
    const longitude = attribute(match[1], "lon");
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const elevationValue = match[2]?.match(ELEVATION_PATTERN)?.[1];
    const elevation = elevationValue ? Number(elevationValue) : null;

    points.push({
      latitude,
      longitude,
      elevation: elevation !== null && Number.isFinite(elevation) ? elevation : null,
    });
  }

  return points;
}

export function parseGpxSegments(gpxText: string): GpxPoint[][] {
  // I commenti XML possono contenere tag di esempio: vanno ignorati.
  const source = gpxText.replace(/<!--[\s\S]*?-->/g, "");

  const trackSegments = [...source.matchAll(SEGMENT_PATTERN)]
    .map((segment) => parsePoints(segment[1], "trkpt"))
    .filter((segment) => segment.length > 0);

  if (trackSegments.length > 0) {
    return trackSegments;
  }

  const routePoints = parsePoints(source, "rtept");
  return routePoints.length > 0 ? [routePoints] : [];
}

export function flattenGpxSegments(segments: GpxPoint[][]) {
  return segments.flat();
}

export function haversineDistanceKm(
  first: Pick<GpxPoint, "latitude" | "longitude">,
  second: Pick<GpxPoint, "latitude" | "longitude">
) {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function buildElevationProfile(segments: GpxPoint[][]): ElevationPoint[] {
  let cumulativeDistance = 0;
  const profile: ElevationPoint[] = [];

  segments.forEach((segment) => {
    // Measure the entire track, including points without an elevation value.
    // Otherwise missing <ele> tags cause the profile to underreport distance.
    segment.forEach((point, index) => {
      if (index > 0) {
        cumulativeDistance += haversineDistanceKm(segment[index - 1], point);
      }

      if (point.elevation !== null && Number.isFinite(point.elevation)) {
        profile.push({
          ...point,
          elevation: point.elevation,
          distanceKm: cumulativeDistance,
        });
      }
    });
  });

  return profile;
}

export function thinPoints<T>(points: T[], maxPoints: number) {
  if (points.length <= maxPoints) return points;

  const step = (points.length - 1) / (maxPoints - 1);
  const thinned = Array.from({ length: maxPoints }, (_, index) =>
    points[Math.round(index * step)]
  );

  thinned[0] = points[0];
  thinned[thinned.length - 1] = points[points.length - 1];

  return thinned;
}
