export const DIRECTUS_URL =
  process.env.DIRECTUS_URL ?? "http://164.132.85.146:8055";

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

export async function getHomepage(): Promise<HomepageContent> {
  const response = await fetch(`${DIRECTUS_URL}/items/homepage`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Directus homepage error: ${response.status}`);
  }

  const result =
    (await response.json()) as DirectusResponse<HomepageContent>;

  return result.data;
}

export async function getExperiences(): Promise<Experience[]> {
  const params = new URLSearchParams();

  params.set("filter[status][_eq]", "published");
  params.set("filter[featured][_eq]", "true");
  params.set("sort", "sort");
  params.set(
    "fields",
    "id,status,sort,title,slug,description,image,link,featured"
  );

  const response = await fetch(
    `${DIRECTUS_URL}/items/experiences?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Directus experiences error: ${response.status}`);
  }

  const result =
    (await response.json()) as DirectusResponse<Experience[]>;

  return result.data;
}

export function getDirectusAssetUrl(
  fileId: string | null | undefined
): string | null {
  if (!fileId) {
    return null;
  }

  return `${DIRECTUS_URL}/assets/${fileId}`;
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

export async function getMapPlaces(): Promise<MapPlace[]> {
  const params = new URLSearchParams();

  params.set("filter[status][_eq]", "published");
  params.set("filter[show_on_map][_eq]", "true");
  params.set("sort", "map_priority");
  params.set(
    "fields",
    "id,title,slug,summary,image,latitude,longitude,map_label,map_icon,map_priority"
  );

  const response = await fetch(
    `${DIRECTUS_URL}/items/places?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Directus map places error: ${response.status}`);
  }

  const result = (await response.json()) as DirectusResponse<MapPlace[]>;

  return result.data;
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
  category?: {
    name: string;
  } | null;
  place?: {
    title: string;
  } | null;
}

export async function getUpcomingEvents(): Promise<EventItem[]> {
  const params = new URLSearchParams();

  const now = new Date().toISOString();

  params.set("filter[status][_eq]", "published");
  params.set("filter[start_date][_gte]", now);
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

  const response = await fetch(
    `${DIRECTUS_URL}/items/events?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Directus events error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as DirectusResponse<EventItem[]>;

  return result.data;
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
  category?: {
    name: string;
  } | null;
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

  const response = await fetch(
    `${DIRECTUS_URL}/items/places?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Directus featured places error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as DirectusResponse<PlaceItem[]>;

  return result.data;
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

export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await fetch(
    `${DIRECTUS_URL}/items/site_settings`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Directus site settings error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as DirectusResponse<SiteSettings>;

  return result.data;
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

  category?: {
    name: string;
  } | null;

  points?: RoutePoint[];
}

export async function getRouteBySlug(
  slug: string
): Promise<RouteItem | null> {
  const params = new URLSearchParams();

  params.set("filter[status][_eq]", "published");
  params.set("filter[slug][_eq]", slug);
  params.set("limit", "1");

  params.set(
    "fields",
    [
      "*",
      "category.name",
    ].join(",")
  );

  const response = await fetch(
    `${DIRECTUS_URL}/items/routes?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Directus route error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as DirectusResponse<RouteItem[]>;

  const route = result.data[0];

  if (!route) {
    return null;
  }

  const pointParams = new URLSearchParams();

  pointParams.set(
    "filter[route][_eq]",
    String(route.id)
  );

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

  const pointsResponse = await fetch(
    `${DIRECTUS_URL}/items/route_points?${pointParams.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!pointsResponse.ok) {
    throw new Error(
      `Directus route points error: ${pointsResponse.status}`
    );
  }

  const pointsResult =
    (await pointsResponse.json()) as DirectusResponse<RoutePoint[]>;

  return {
    ...route,
    points: pointsResult.data,
  };
}