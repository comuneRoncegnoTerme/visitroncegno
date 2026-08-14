import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { isContentHubCollection, sanitizeContentHubPayload } from "@/lib/content-hub-collections";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  if (!(await getContentHubSession())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const token = process.env.DIRECTUS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });
  }

  const { collection, id } = await context.params;
  if (!isContentHubCollection(collection) || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Risorsa non valida" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  const payload = sanitizeContentHubPayload(collection, body as Record<string, unknown>);
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nessuna modifica ricevuta" }, { status: 400 });
  }

  const response = await fetch(`${DIRECTUS_URL}/items/${collection}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
