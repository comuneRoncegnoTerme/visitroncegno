import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import {
  contentHubCollections,
  contentHubFieldsForSchema,
  isContentHubCollection,
  sanitizeContentHubPayload,
} from "@/lib/content-hub-collections";
import { getDirectusCollectionFields } from "@/lib/content-hub-directus-schema";

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
  const directusFields = await getDirectusCollectionFields(collection, token);
  const fields = directusFields
    ? contentHubFieldsForSchema(collection, directusFields)
    : config.fields.filter((field) => ![
        "address",
        "phone",
        "email",
        "website_url",
        "booking_url",
        "access_notes",
        "parking_notes",
        "public_transport_notes",
      ].includes(field));

  const params = new URLSearchParams({
    fields: fields.join(","),
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

  return NextResponse.json({ data: result?.data ?? [], fields });
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

  const directusFields = await getDirectusCollectionFields(collection, token);
  const payload = sanitizeContentHubPayload(
    collection,
    body as Record<string, unknown>,
    directusFields ?? undefined
  );

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
