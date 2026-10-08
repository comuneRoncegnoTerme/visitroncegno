import { revalidateTag } from "next/cache";
import { DIRECTUS_CACHE_TAG } from "@/lib/directus-cache";
import { NextResponse } from "next/server";
import {
  contentHubDirectusFetch,
  contentHubUnavailableResponse,
  logContentHubUpstreamError,
  readJsonSafely,
  requireContentHubSession,
  unauthorizedContentHubResponse,
  upstreamFailureResponse,
} from "@/lib/content-hub-api";

const editableFields = [
  "hero_eyebrow",
  "hero_title",
  "hero_description",
  "hero_primary_label",
  "hero_primary_url",
  "hero_secondary_label",
  "hero_secondary_url",
  "routes_eyebrow",
  "routes_title",
  "routes_description",
  "routes_link_label",
  "routes_link_url",
  "identity_eyebrow",
  "identity_title",
  "identity_description",
  "identity_fact_1_value",
  "identity_fact_1_label",
  "identity_fact_2_value",
  "identity_fact_2_label",
  "identity_fact_3_value",
  "identity_fact_3_label",
  "highlights_eyebrow",
  "highlights_title",
  "highlights_description",
  "highlights_link_label",
  "highlights_link_url",
  "seasonal_eyebrow",
  "seasonal_title",
  "seasonal_description",
  "seasonal_primary_label",
  "seasonal_primary_url",
  "seasonal_secondary_label",
  "seasonal_secondary_url",
  "seasonal_note_small",
  "seasonal_note_strong",
  "events_eyebrow",
  "events_title",
  "events_description",
  "events_link_label",
  "events_link_url",
  "map_eyebrow",
  "map_title",
  "map_description",
  "map_primary_label",
  "map_primary_url",
  "map_secondary_label",
  "map_secondary_url",
  "memory_eyebrow",
  "memory_title",
  "memory_description",
  "memory_link_label",
  "memory_link_url",
  "planning_eyebrow",
  "planning_title",
  "planning_description",
  "closing_eyebrow",
  "closing_title",
  "closing_description",
  "closing_primary_label",
  "closing_primary_url",
  "closing_secondary_label",
  "closing_secondary_url",
] as const;

type EditableField = (typeof editableFields)[number];
type HomepagePatch = Partial<Record<EditableField, string | null>> & {
  seasonal_enabled?: boolean;
};

export async function PATCH(request: Request) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const patch: HomepagePatch = {};

  for (const field of editableFields) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value !== null && typeof value !== "string") {
      return NextResponse.json({ error: `Campo ${field} non valido` }, { status: 400 });
    }
    patch[field] = value as string | null;
  }

  if ("seasonal_enabled" in input) {
    if (typeof input.seasonal_enabled !== "boolean") {
      return NextResponse.json({ error: "Campo seasonal_enabled non valido" }, { status: 400 });
    }
    patch.seasonal_enabled = input.seasonal_enabled;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nessuna modifica ricevuta" }, { status: 400 });
  }

  try {
    const response = await contentHubDirectusFetch("/items/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return upstreamFailureResponse("update-homepage", response);

    // Il sito pubblico mostra subito la modifica (vedi src/lib/directus-cache.ts).
    revalidateTag(DIRECTUS_CACHE_TAG, { expire: 0 });
    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result });
  } catch (error) {
    logContentHubUpstreamError("update-homepage", error);
    return contentHubUnavailableResponse();
  }
}
