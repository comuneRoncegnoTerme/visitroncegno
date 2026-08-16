import { DIRECTUS_URL } from "@/lib/directus";

export type EditorialItem = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  content?: string | null;
  image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  difficulty?: string | null;
  distance_km?: number | null;
  duration_minutes?: number | null;
  elevation_gain_m?: number | null;
  family_friendly?: boolean;
  accessible?: boolean;
  public_transport?: boolean;
  route_highlight?: string | null;
  map_label?: string | null;
  map_icon?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  booking_url?: string | null;
  access_notes?: string | null;
  parking_notes?: string | null;
  public_transport_notes?: string | null;
  category?: { name?: string | null } | null;
  place?: { title?: string | null } | null;
};

async function fetchItems(collection: string, params: URLSearchParams) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/${collection}?${params}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const result = (await response.json()) as { data?: EditorialItem[] };
    return result.data ?? [];
  } catch {
    return [];
  }
}

export async function getEditorialList(collection: "places" | "routes" | "events") {
  const params = new URLSearchParams({
    "filter[status][_eq]": "published",
    fields: "*,category.name,place.title",
    sort: collection === "events" ? "start_date" : "sort,title",
    limit: "100",
  });
  return fetchItems(collection, params);
}

export async function getEditorialItem(collection: "places" | "events", slug: string) {
  const params = new URLSearchParams({
    "filter[status][_eq]": "published",
    "filter[slug][_eq]": slug,
    fields: "*,category.name,place.title",
    limit: "1",
  });
  return (await fetchItems(collection, params))[0] ?? null;
}

export function plainText(value?: string | null) {
  if (!value) return [];
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
