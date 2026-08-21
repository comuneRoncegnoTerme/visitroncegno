import { NextRequest, NextResponse } from "next/server";
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
  "site_name",
  "tagline",
  "logo",
  "logo_light",
  "footer_description",
  "contact_email",
  "contact_phone",
  "address",
  "facebook_url",
  "instagram_url",
  "default_seo_title",
  "default_seo_description",
  "default_social_image",
] as const;

export async function GET() {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const params = new URLSearchParams({ fields: ["id", ...editableFields].join(",") });

  try {
    const response = await contentHubDirectusFetch(
      `/items/site_settings?${params.toString()}`
    );
    if (!response.ok) return upstreamFailureResponse("read-settings", response);

    const result = await readJsonSafely(response);
    return NextResponse.json({ data: result?.data ?? {} });
  } catch (error) {
    logContentHubUpstreamError("read-settings", error);
    return contentHubUnavailableResponse();
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const patch: Record<string, string | null> = {};
  for (const field of editableFields) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value !== null && typeof value !== "string") {
      return NextResponse.json({ error: `Campo ${field} non valido` }, { status: 400 });
    }
    patch[field] = value === "" ? null : (value as string | null);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nessuna modifica ricevuta" }, { status: 400 });
  }

  try {
    const response = await contentHubDirectusFetch("/items/site_settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return upstreamFailureResponse("update-settings", response);

    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result });
  } catch (error) {
    logContentHubUpstreamError("update-settings", error);
    return contentHubUnavailableResponse();
  }
}
