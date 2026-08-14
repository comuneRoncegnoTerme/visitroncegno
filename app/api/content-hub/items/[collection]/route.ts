import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import {
  contentHubCollections,
  isContentHubCollection,
  sanitizeContentHubPayload,
} from "@/lib/content-hub-collections";

async function requireSession() {
  const session = await getContentHubSession();
  return session ?? null;
}

function getToken() {
  return process.env.DIRECTUS_TOKEN ?? null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const token = getToken();
  if (!token) {
    return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });
  }

  const { collection } = await context.params;
  if (!isContentHubCollection(collection)) {
    return NextResponse.json({ error: "Collezione non consentita" }, { status: 404 });
  }

  const config = contentHubCollections[collection];
  const params = new URLSearchParams({
    fields: config.fields.join(","),
    sort: config.sort,
    limit: String(config.limit),
  });

  const response = await fetch(`${DIRECTUS_URL}/items/${collection}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Impossibile leggere i contenuti", details: result },
      { status: response.status }
    );
  }

  return NextResponse.json({ data: result?.data ?? [] });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const token = getToken();
  if (!token) {
    return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });
  }

  const { collection } = await context.params;
  if (!isContentHubCollection(collection)) {
    return NextResponse.json({ error: "Collezione non consentita" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  const payload = sanitizeContentHubPayload(collection, body as Record<string, unknown>);
  if (!payload.title || !payload.slug) {
    return NextResponse.json({ error: "Titolo e slug sono obbligatori" }, { status: 400 });
  }

  const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: "POST",
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
      { error: "Directus ha rifiutato la creazione", details: result },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true, data: result?.data ?? result }, { status: 201 });
}
