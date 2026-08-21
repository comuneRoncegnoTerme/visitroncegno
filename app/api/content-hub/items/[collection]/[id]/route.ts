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
import { isContentHubCollection, sanitizeContentHubPayload } from "@/lib/content-hub-collections";
import { getDirectusCollectionFields } from "@/lib/content-hub-directus-schema";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const { collection, id } = await context.params;
  if (!isContentHubCollection(collection) || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Risorsa non valida" }, { status: 404 });
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

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "Nessuna modifica ricevuta" }, { status: 400 });
    }

    const response = await contentHubDirectusFetch(`/items/${collection}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return upstreamFailureResponse("update-item", response, { collection, id });
    }

    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result });
  } catch (error) {
    logContentHubUpstreamError("update-item", error, { collection, id });
    return contentHubUnavailableResponse();
  }
}
