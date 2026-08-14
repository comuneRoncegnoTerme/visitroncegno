import { NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";

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
  const session = await getContentHubSession();
  if (!session) {
    return NextResponse.json({ error: "Sessione scaduta o non valida" }, { status: 401 });
  }

  const directusToken = process.env.DIRECTUS_TOKEN;
  if (!directusToken) {
    return NextResponse.json(
      { error: "DIRECTUS_TOKEN non configurato sul server" },
      { status: 503 }
    );
  }

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

  const response = await fetch(`${DIRECTUS_URL}/items/homepage`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${directusToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Directus ha rifiutato la modifica", details: result },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true, data: result?.data ?? result });
}
