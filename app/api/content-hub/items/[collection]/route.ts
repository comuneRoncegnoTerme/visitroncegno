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
import {
  contentHubCollections,
  contentHubFieldsForSchema,
  isContentHubCollection,
  sanitizeContentHubPayload,
} from "@/lib/content-hub-collections";
import { getDirectusCollectionFields } from "@/lib/content-hub-directus-schema";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const { collection } = await context.params;
  if (!isContentHubCollection(collection)) {
    return NextResponse.json({ error: "Collezione non consentita" }, { status: 404 });
  }

  try {
    const token = process.env.DIRECTUS_TOKEN?.trim();
    if (!token) return contentHubUnavailableResponse();

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

    const response = await contentHubDirectusFetch(
      `/items/${collection}?${params.toString()}`
    );
    if (!response.ok) return upstreamFailureResponse("list-items", response, { collection });

    const result = await readJsonSafely(response);
    return NextResponse.json({ data: result?.data ?? [], fields });
  } catch (error) {
    logContentHubUpstreamError("list-items", error, { collection });
    return contentHubUnavailableResponse();
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const { collection } = await context.params;
  if (!isContentHubCollection(collection)) {
    return NextResponse.json({ error: "Collezione non consentita" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  try {
    const token = process.env.DIRECTUS_TOKEN?.trim();
    if (!token) return contentHubUnavailableResponse();

    const directusFields = await getDirectusCollectionFields(collection, token);
    const payload = sanitizeContentHubPayload(
      collection,
      body as Record<string, unknown>,
      directusFields ?? undefined
    );

    if (!payload.title || !payload.slug) {
      return NextResponse.json({ error: "Titolo e slug sono obbligatori" }, { status: 400 });
    }

    const response = await contentHubDirectusFetch(`/items/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return upstreamFailureResponse("create-item", response, { collection });

    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result }, { status: 201 });
  } catch (error) {
    logContentHubUpstreamError("create-item", error, { collection });
    return contentHubUnavailableResponse();
  }
}
