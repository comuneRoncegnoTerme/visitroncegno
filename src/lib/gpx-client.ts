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

function pointFromElement(point: Element): GpxPoint | null {
  const latitudeAttribute = point.getAttribute("lat");
  const longitudeAttribute = point.getAttribute("lon");

  if (!latitudeAttribute || !longitudeAttribute) {
    return null;
  }

  const latitude = Number(latitudeAttribute);
  const longitude = Number(longitudeAttribute);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const elevationElement = Array.from(point.children).find(
    (child) => child.localName === "ele"
  );
  const elevationValue = elevationElement?.textContent?.trim();
  const elevation = elevationValue ? Number(elevationValue) : null;

  return {
    latitude,
    longitude,
    elevation: elevation !== null && Number.isFinite(elevation) ? elevation : null,
  };
}

export function parseGpxSegments(gpxText: string): GpxPoint[][] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  if (xml.getElementsByTagName("parsererror").length > 0) {
    return [];
  }

  const trackSegments = Array.from(
    xml.getElementsByTagNameNS("*", "trkseg")
  );

  const parsedTrackSegments = trackSegments
    .map((segment) =>
      Array.from(segment.getElementsByTagNameNS("*", "trkpt"))
        .map(pointFromElement)
        .filter(Boolean) as GpxPoint[]
    )
    .filter((segment) => segment.length > 0);

  if (parsedTrackSegments.length > 0) {
    return parsedTrackSegments;
  }

  const routePoints = Array.from(
    xml.getElementsByTagNameNS("*", "rtept")
  )
    .map(pointFromElement)
    .filter(Boolean) as GpxPoint[];

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
    const pointsWithElevation = segment.filter(
      (point): point is GpxPoint & { elevation: number } =>
        point.elevation !== null && Number.isFinite(point.elevation)
    );

    pointsWithElevation.forEach((point, index) => {
      if (index > 0) {
        cumulativeDistance += haversineDistanceKm(
          pointsWithElevation[index - 1],
          point
        );
      }

      profile.push({
        ...point,
        elevation: point.elevation,
        distanceKm: cumulativeDistance,
      });
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
