export type ContentHubCollection = "events" | "places" | "routes";

export const contentHubCollections: Record<
  ContentHubCollection,
  { fields: readonly string[]; sort: string; limit: number }
> = {
  events: {
    fields: [
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
    ],
    sort: "-start_date",
    limit: 250,
  },
  places: {
    fields: [
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
      "map_priority",
      "show_on_map",
    ],
    sort: "sort,title",
    limit: 250,
  },
  routes: {
    fields: [
      "id",
      "status",
      "sort",
      "title",
      "slug",
      "summary",
      "description",
      "image",
      "difficulty",
      "distance_km",
      "duration_minutes",
      "elevation_gain_m",
      "start_latitude",
      "start_longitude",
      "family_friendly",
      "accessible",
      "public_transport",
      "loop_route",
      "featured",
      "recommended",
      "route_highlight",
      "gpx_file",
    ],
    sort: "sort,title",
    limit: 250,
  },
};

export function isContentHubCollection(value: string): value is ContentHubCollection {
  return value in contentHubCollections;
}

export function sanitizeContentHubPayload(
  collection: ContentHubCollection,
  input: Record<string, unknown>
) {
  const allowed = new Set(contentHubCollections[collection].fields.filter((field) => field !== "id"));
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) continue;
    output[key] = value === "" ? null : value;
  }

  return output;
}
