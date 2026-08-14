import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";

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

async function auth() {
  return await getContentHubSession();
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const params = new URLSearchParams({ fields: ["id", ...editableFields].join(",") });
  const response = await fetch(`${DIRECTUS_URL}/items/site_settings?${params.toString()}`, { cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Impossibile leggere le impostazioni", details: result }, { status: response.status });
  return NextResponse.json({ data: result?.data ?? {} });
}

export async function PATCH(request: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const token = process.env.DIRECTUS_TOKEN;
  if (!token) return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });

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

  const response = await fetch(`${DIRECTUS_URL}/items/site_settings`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Directus ha rifiutato la modifica", details: result }, { status: response.status });
  return NextResponse.json({ ok: true, data: result?.data ?? result });
}
