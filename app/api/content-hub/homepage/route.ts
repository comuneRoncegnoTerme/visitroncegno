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
] as const;

type EditableField = (typeof editableFields)[number];
type HomepagePatch = Partial<Record<EditableField, string | null>>;

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

    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result });
  } catch (error) {
    logContentHubUpstreamError("update-homepage", error);
    return contentHubUnavailableResponse();
  }
}
