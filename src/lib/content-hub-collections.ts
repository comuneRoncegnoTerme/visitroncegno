export type ContentHubCollection = "events" | "places" | "routes" | "stories";

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
      "address",
      "phone",
      "email",
      "website_url",
      "booking_url",
      "access_notes",
      "parking_notes",
      "public_transport_notes",
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
  stories: {
    fields: [
      "id",
      "status",
      "title",
      "slug",
      "excerpt",
      "body",
      "image",
      "audio_file",
      "audio_title",
      "source_url",
      "source_label",
    ],
    sort: "title",
    limit: 250,
  },
};

export function isContentHubCollection(value: string): value is ContentHubCollection {
  return value in contentHubCollections;
}

export function contentHubFieldsForSchema(
  collection: ContentHubCollection,
  availableFields: Iterable<string>
) {
  const available = new Set(availableFields);
  return contentHubCollections[collection].fields.filter((field) => available.has(field));
}

export function sanitizeContentHubPayload(
  collection: ContentHubCollection,
  input: Record<string, unknown>,
  availableFields?: Iterable<string>
) {
  const configured = contentHubCollections[collection].fields.filter((field) => field !== "id");
  const available = availableFields ? new Set(availableFields) : null;
  const allowed = new Set(configured.filter((field) => !available || available.has(field)));
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) continue;
    output[key] = value === "" ? null : value;
  }

  return output;
}
