import { getDirectusInternalAssetUrl } from "@/lib/directus";
import { publicDirectusCache } from "@/lib/directus-cache";
import { flattenGpxSegments, parseGpxSegments } from "@/lib/gpx-client";

export type RouteTrace = {
  /** Percorso SVG in un riquadro 100 × 100, già centrato. */
  path: string;
  start: [number, number];
  end: [number, number];
};

const MAX_POINTS = 140;

// Traccia GPX semplificata per le anteprime: pochi punti, proiezione piana
// (a questa scala la curvatura della Terra non si vede).
export async function getRouteTrace(gpxFileId: string | null | undefined): Promise<RouteTrace | null> {
  const url = getDirectusInternalAssetUrl(gpxFileId);
  if (!url) return null;

  try {
    const response = await fetch(url, publicDirectusCache);
    if (!response.ok) return null;
    const points = flattenGpxSegments(parseGpxSegments(await response.text()));
    if (points.length < 2) return null;

    const step = Math.max(1, Math.floor(points.length / MAX_POINTS));
    const sampled = points.filter((_, index) => index % step === 0 || index === points.length - 1);

    const meanLatitude = sampled.reduce((sum, point) => sum + point.latitude, 0) / sampled.length;
    const xScale = Math.cos((meanLatitude * Math.PI) / 180);
    const xs = sampled.map((point) => point.longitude * xScale);
    const ys = sampled.map((point) => -point.latitude);
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const span = Math.max(maxX - minX, maxY - minY) || 1;
    // Margine del 8% e centratura nel lato più corto.
    const size = 84;
    const offsetX = 8 + (size - ((maxX - minX) / span) * size) / 2;
    const offsetY = 8 + (size - ((maxY - minY) / span) * size) / 2;
    const project = (index: number): [number, number] => [
      Number((offsetX + ((xs[index] - minX) / span) * size).toFixed(2)),
      Number((offsetY + ((ys[index] - minY) / span) * size).toFixed(2)),
    ];

    const projected = sampled.map((_, index) => project(index));
    const path = projected.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
    return { path, start: projected[0], end: projected[projected.length - 1] };
  } catch {
    return null;
  }
}
