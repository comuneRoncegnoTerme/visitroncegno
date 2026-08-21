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

function queryPath(collection: string, params: URLSearchParams) {
  return `/items/${collection}?${params.toString()}`;
}

export async function getHomepage(): Promise<HomepageContent> {
  const result = await directusJson<DirectusResponse<HomepageContent>>(
    "/items/homepage"
  );
  return result.data;
}

export async function getExperiences(): Promise<Experience[]> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[featured][_eq]", "true");
  params.set("sort", "sort");
  params.set("fields", "id,status,sort,title,slug,description,image,link,featured");

  const result = await directusJson<DirectusResponse<Experience[]>>(
    queryPath("experiences", params)
  );
  return result.data;
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

  const result = await directusJson<DirectusResponse<MapPlace[]>>(
    queryPath("places", params)
  );
  return result.data;
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

  const result = await directusJson<DirectusResponse<EventItem[]>>(
    queryPath("events", params)
  );
  return result.data;
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
      "category.name",
    ].join(",")
  );

  const result = await directusJson<DirectusResponse<PlaceItem[]>>(
    queryPath("places", params)
  );
  return result.data;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await directusJson<DirectusResponse<SiteSettings>>(
    "/items/site_settings"
  );
  return result.data;
}

export async function getRouteBySlug(slug: string): Promise<RouteItem | null> {
  const params = new URLSearchParams();
  params.set("filter[status][_eq]", "published");
  params.set("filter[slug][_eq]", slug);
  params.set("limit", "1");
  params.set("fields", "*,category.name");

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
}
