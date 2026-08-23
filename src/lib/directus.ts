import { DIRECTUS_URL, directusJson } from "@/lib/directus-client";

export { DIRECTUS_URL } from "@/lib/directus-client";

interface DirectusResponse<T> {
  data: T;
}

export interface HomepageContent {
  id: number;
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_description: string | null;
  hero_image: string | null;
  hero_primary_label: string | null;
  hero_primary_url: string | null;
  hero_secondary_label: string | null;
  hero_secondary_url: string | null;
}

export interface Experience {
  id: number;
  status: string;
  sort: number | null;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  link: string | null;
  featured: boolean;
}

export interface MapPlace {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  map_label: string | null;
  map_icon: string | null;
  map_priority: number | null;
}

export interface EventItem {
  id: number;
  status: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  location_name: string | null;
  featured: boolean;
  category?: { name: string } | null;
  place?: { title: string } | null;
}

export interface PlaceItem {
  id: number;
  status: string;
  sort: number | null;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  featured: boolean;
  latitude: number | null;
  longitude: number | null;
  map_label: string | null;
  map_icon: string | null;
  show_on_map: boolean;
  place_type?: import("@/lib/place-detail").PlaceType | null;
  detail_mode?: import("@/lib/place-detail").PlaceDetailMode | null;
  canonical_path?: string | null;
  external_detail_url?: string | null;
  category?: { name: string } | null;
}

export interface SiteSettings {
  id: number;
  site_name: string | null;
  tagline: string | null;
  logo: string | null;
  logo_light: string | null;
  footer_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_social_image: string | null;
}

export interface RoutePoint {
  id: number;
  sort: number | null;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  highlight: boolean;
  place?: {
    id: number;
    title: string;
    slug: string;
    image: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export interface RouteItem {
  id: number;
  status: string;
  sort: number | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  image: string | null;
  difficulty: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain_m: number | null;
  elevation_loss_m: number | null;
  min_elevation_m: number | null;
  max_elevation_m: number | null;
  start_latitude: number | null;
  start_longitude: number | null;
  duration_class: string | null;
  audience: string | null;
  experience_type: string | null;
  season: string | null;
  family_friendly: boolean;
  accessible: boolean;
  public_transport: boolean;
  loop_route: boolean;
  featured: boolean;
  recommended: boolean;
  route_highlight: string | null;
  komoot_url: string | null;
  outdooractive_url: string | null;
  gpx_file: string | null;
  category?: { name: string } | null;
  points?: RoutePoint[];
}

const EMPTY_HOMEPAGE: HomepageContent = {
  id: 0,
  hero_eyebrow: null,
  hero_title: null,
  hero_description: null,
  hero_image: null,
  hero_primary_label: null,
  hero_primary_url: null,
  hero_secondary_label: null,
  hero_secondary_url: null,
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 0,
  site_name: "Visit Roncegno",
  tagline: null,
  logo: null,
  logo_light: null,
  footer_description: null,
  contact_email: null,
  contact_phone: null,
  address: null,
  facebook_url: null,
  instagram_url: null,
  default_seo_title: "Visit Roncegno",
  default_seo_description: null,
  default_social_image: null,
};

function queryPath(collection: string, params: URLSearchParams) {
  return `/items/${collection}?${params.toString()}`;
}

function reportPublicReadFallback(scope: string, error: unknown) {
  console.warn("Directus public read unavailable; using fallback", {
    scope,
    message: error instanceof Error ? error.message : "Unknown error",
  });
}

export async function getHomepage(): Promise<HomepageContent> {
  try {
    const result = await directusJson<DirectusResponse<HomepageContent>>(
      "/items/homepage"
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("homepage", error);
    return EMPTY_HOMEPAGE;
  }
}

export async function getExperiences(): Promise<Experience[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[featured][_eq]", "true");
  params.set("sort", "sort");
  params.set("fields", "id,status,sort,title,slug,description,image,link,featured");

  try {
    const result = await directusJson<DirectusResponse<Experience[]>>(
      queryPath("experiences", params)
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("experiences", error);
    return [];
  }
}

export function getDirectusAssetUrl(fileId: string | null | undefined): string | null {
  return fileId ? `${DIRECTUS_URL}/assets/${fileId}` : null;
}

export async function getMapPlaces(): Promise<MapPlace[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[show_on_map][_eq]", "true");
  params.set("sort", "map_priority");
  params.set(
    "fields",
    "id,title,slug,summary,image,latitude,longitude,map_label,map_icon,map_priority"
  );

  try {
    const result = await directusJson<DirectusResponse<MapPlace[]>>(
      queryPath("places", params)
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("map-places", error);
    return [];
  }
}

export async function getUpcomingEvents(): Promise<EventItem[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[start_date][_gte]", new Date().toISOString());
  params.set("sort", "start_date");
  params.set("limit", "3");
  params.set(
    "fields",
    [
      "id",
      "status",
      "title",
      "slug",
      "summary",
      "image",
      "start_date",
      "end_date",
      "all_day",
      "location_name",
      "featured",
      "category.name",
      "place.title",
    ].join(",")
  );

  try {
    const result = await directusJson<DirectusResponse<EventItem[]>>(
      queryPath("events", params)
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("upcoming-events", error);
    return [];
  }
}

export async function getFeaturedPlaces(): Promise<PlaceItem[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[featured][_eq]", "true");
  params.set("sort", "sort");
  params.set("limit", "3");
  params.set(
    "fields",
    [
      "id",
      "status",
      "sort",
      "title",
      "slug",
      "summary",
      "image",
      "featured",
      "latitude",
      "longitude",
      "map_label",
      "map_icon",
      "show_on_map",
      "place_type",
      "detail_mode",
      "canonical_path",
      "external_detail_url",
      "category.name",
    ].join(",")
  );

  try {
    const result = await directusJson<DirectusResponse<PlaceItem[]>>(
      queryPath("places", params)
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("featured-places", error);
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const result = await directusJson<DirectusResponse<SiteSettings>>(
      "/items/site_settings"
    );
    return result.data;
  } catch (error) {
    reportPublicReadFallback("site-settings", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getRouteBySlug(slug: string): Promise<RouteItem | null> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[slug][_eq]", slug);
  params.set("limit", "1");
  params.set("fields", "*,category.name");

  try {
    const result = await directusJson<DirectusResponse<RouteItem[]>>(
      queryPath("routes", params)
    );
    const route = result.data[0];
    if (!route) return null;

    const pointParams = new URLSearchParams();
    pointParams.set("filter[route][_eq]", String(route.id));
    pointParams.set("sort", "sort");
    pointParams.set(
      "fields",
      [
        "id",
        "sort",
        "title",
        "description",
        "latitude",
        "longitude",
        "highlight",
        "place.id",
        "place.title",
        "place.slug",
        "place.image",
        "place.latitude",
        "place.longitude",
      ].join(",")
    );

    const pointsResult = await directusJson<DirectusResponse<RoutePoint[]>>(
      queryPath("route_points", pointParams)
    );

    return { ...route, points: pointsResult.data };
  } catch (error) {
    reportPublicReadFallback(`route:${slug}`, error);
    return null;
  }
}
