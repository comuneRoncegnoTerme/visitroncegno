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
      "route.category.name",
    ].join(",")
  );
  params.set("limit", "20");

  try {
    const result = await directusJson<DirectusResponse<RoutePointRelation[]>>(
      `/items/route_points?${params.toString()}`,
      { cache: "no-store" }
    );
    const unique = new Map<number, RelatedRoute>();

    for (const relation of result.data) {
      if (relation.route) {
        const { status: _status, ...route } = relation.route;
        unique.set(route.id, route);
      }
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
