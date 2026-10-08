import { directusJson } from "@/lib/directus-client";

interface DirectusResponse<T> {
  data: T;
}

interface RoutePointRelation {
  route?: {
    id: number;
    status: string;
    title: string;
    slug: string;
    summary: string | null;
    image: string | null;
    difficulty: string | null;
    distance_km: number | null;
    duration_minutes: number | null;
    elevation_gain_m: number | null;
    route_highlight: string | null;
    category?: {
      name: string;
    } | null;
  } | null;
}

export interface RelatedRoute {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  difficulty: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain_m: number | null;
  route_highlight: string | null;
  category?: {
    name: string;
  } | null;
}

export async function getRoutesForPlace(placeId: number): Promise<RelatedRoute[]> {
  const params = new URLSearchParams();
  params.set("filter[place][_eq]", String(placeId));
  params.set("filter[route][status][_eq]", "published");
  params.set(
    "fields",
    [
      "route.id",
      "route.status",
      "route.title",
      "route.slug",
      "route.summary",
      "route.image",
      "route.difficulty",
      "route.distance_km",
      "route.duration_minutes",
      "route.elevation_gain_m",
      "route.route_highlight",
      "route.category.name",
    ].join(",")
  );
  params.set("limit", "20");

  try {
    const result = await directusJson<DirectusResponse<RoutePointRelation[]>>(
      `/items/route_points?${params.toString()}`
    );
    const unique = new Map<number, RelatedRoute>();

    for (const relation of result.data) {
      const route = relation.route;
      if (!route) continue;

      unique.set(route.id, {
        id: route.id,
        title: route.title,
        slug: route.slug,
        summary: route.summary,
        image: route.image,
        difficulty: route.difficulty,
        distance_km: route.distance_km,
        duration_minutes: route.duration_minutes,
        elevation_gain_m: route.elevation_gain_m,
        route_highlight: route.route_highlight,
        category: route.category,
      });
    }

    return [...unique.values()];
  } catch (error) {
    console.warn("Directus place routes unavailable", {
      placeId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}
