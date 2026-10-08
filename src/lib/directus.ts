import { DIRECTUS_URL, directusJson } from "@/lib/directus-client";
import { currentAndUpcomingEvents, directusUpcomingLowerBound } from "@/lib/event-dates";

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
  routes_eyebrow: string | null;
  routes_title: string | null;
  routes_description: string | null;
  routes_link_label: string | null;
  routes_link_url: string | null;
  highlights_eyebrow: string | null;
  highlights_title: string | null;
  highlights_description: string | null;
  highlights_link_label: string | null;
  highlights_link_url: string | null;
  map_eyebrow: string | null;
  map_title: string | null;
  map_description: string | null;
  map_primary_label: string | null;
  map_primary_url: string | null;
  map_secondary_label: string | null;
  map_secondary_url: string | null;

  identity_eyebrow: string | null;
  identity_title: string | null;
  identity_description: string | null;
  identity_fact_1_value: string | null;
  identity_fact_1_label: string | null;
  identity_fact_2_value: string | null;
  identity_fact_2_label: string | null;
  identity_fact_3_value: string | null;
  identity_fact_3_label: string | null;

  seasonal_enabled: boolean | null;
  seasonal_eyebrow: string | null;
  seasonal_title: string | null;
  seasonal_description: string | null;
  seasonal_primary_label: string | null;
  seasonal_primary_url: string | null;
  seasonal_secondary_label: string | null;
  seasonal_secondary_url: string | null;
  seasonal_note_small: string | null;
  seasonal_note_strong: string | null;

  events_eyebrow: string | null;
  events_title: string | null;
  events_description: string | null;
  events_link_label: string | null;
  events_link_url: string | null;

  memory_eyebrow: string | null;
  memory_title: string | null;
  memory_description: string | null;
  memory_link_label: string | null;
  memory_link_url: string | null;

  planning_eyebrow: string | null;
  planning_title: string | null;
  planning_description: string | null;

  closing_eyebrow: string | null;
  closing_title: string | null;
  closing_description: string | null;
  closing_primary_label: string | null;
  closing_primary_url: string | null;
  closing_secondary_label: string | null;
  closing_secondary_url: string | null;
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
  all_day: boolean | null;
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
  routes_eyebrow: null,
  routes_title: null,
  routes_description: null,
  routes_link_label: null,
  routes_link_url: null,
  highlights_eyebrow: null,
  highlights_title: null,
  highlights_description: null,
  highlights_link_label: null,
  highlights_link_url: null,
  map_eyebrow: null,
  map_title: null,
  map_description: null,
  map_primary_label: null,
  map_primary_url: null,
  map_secondary_label: null,
  map_secondary_url: null,
  identity_eyebrow: null,
  identity_title: null,
  identity_description: null,
  identity_fact_1_value: null,
  identity_fact_1_label: null,
  identity_fact_2_value: null,
  identity_fact_2_label: null,
  identity_fact_3_value: null,
  identity_fact_3_label: null,
  seasonal_enabled: true,
  seasonal_eyebrow: null,
  seasonal_title: null,
  seasonal_description: null,
  seasonal_primary_label: null,
  seasonal_primary_url: null,
  seasonal_secondary_label: null,
  seasonal_secondary_url: null,
  seasonal_note_small: null,
  seasonal_note_strong: null,
  events_eyebrow: null,
  events_title: null,
  events_description: null,
  events_link_label: null,
  events_link_url: null,
  memory_eyebrow: null,
  memory_title: null,
  memory_description: null,
  memory_link_label: null,
  memory_link_url: null,
  planning_eyebrow: null,
  planning_title: null,
  planning_description: null,
  closing_eyebrow: null,
  closing_title: null,
  closing_description: null,
  closing_primary_label: null,
  closing_primary_url: null,
  closing_secondary_label: null,
  closing_secondary_url: null,
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

// Fotografie: Directus restituisce una versione ridimensionata in WebP invece dell'originale
// (spesso 4000-6000 px e diversi MB). Usare solo per immagini raster, non per file, audio, GPX o SVG.
// DIRECTUS_IMAGE_TRANSFORMS=false disattiva la trasformazione se Directus non la consente.
const IMAGE_TRANSFORMS_ENABLED = process.env.DIRECTUS_IMAGE_TRANSFORMS?.trim().toLowerCase() !== "false";

export function getDirectusImageUrl(
  fileId: string | null | undefined,
  width = 1600,
  format: "webp" | "jpg" = "webp"
): string | null {
  const url = getDirectusAssetUrl(fileId);
  if (!url || !IMAGE_TRANSFORMS_ENABLED) return url;
  const params = new URLSearchParams({
    width: String(width),
    quality: "78",
    format,
    withoutEnlargement: "true",
  });
  return `${url}?${params.toString()}`;
}

// Anteprima per social e app di messaggistica: JPEG, che tutte leggono.
export function getDirectusShareImageUrl(fileId: string | null | undefined): string | null {
  return getDirectusImageUrl(fileId, 1200, "jpg");
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

export async function getUpcomingEvents(limit = 4): Promise<EventItem[]> {
  // Gli eventi già iniziati ma non ancora finiti (es. la Festa nel fine settimana) devono restare visibili:
  // Directus restituisce un intervallo largo, la selezione esatta avviene con l'ora di Roncegno.
  const lowerBound = directusUpcomingLowerBound();
  const params = new URLSearchParams();
  params.set(
    "filter",
    JSON.stringify({
      _and: [
        { status: { _eq: "published" } },
        { _or: [{ start_date: { _gte: lowerBound } }, { end_date: { _gte: lowerBound } }] },
      ],
    })
  );
  params.set("sort", "start_date");
  params.set("limit", "60");
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
    return currentAndUpcomingEvents(result.data).slice(0, limit);
  } catch (error) {
    reportPublicReadFallback("upcoming-events", error);
    return [];
  }
}

export async function getHomepageRoutes(): Promise<RouteItem[]> {
  async function readRoutes(filterField?: "recommended" | "featured") {
    const params = new URLSearchParams();
    params.set("filter[status][_eq]", "published");
    if (filterField) params.set(`filter[${filterField}][_eq]`, "true");
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
        "difficulty",
        "distance_km",
        "duration_minutes",
        "elevation_gain_m",
        "experience_type",
        "season",
        "family_friendly",
        "accessible",
        "loop_route",
        "featured",
        "recommended",
        "route_highlight",
        "category.name",
      ].join(",")
    );

    const result = await directusJson<DirectusResponse<RouteItem[]>>(
      queryPath("routes", params)
    );
    return result.data;
  }

  try {
    const recommended = await readRoutes("recommended");
    if (recommended.length > 0) return recommended;

    const featured = await readRoutes("featured");
    if (featured.length > 0) return featured;

    return await readRoutes();
  } catch (error) {
    reportPublicReadFallback("homepage-routes", error);
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
