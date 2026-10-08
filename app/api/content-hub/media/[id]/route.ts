import { NextResponse } from "next/server";
import {
  contentHubDirectusFetch,
  contentHubUnavailableResponse,
  logContentHubUpstreamError,
  requireContentHubSession,
  unauthorizedContentHubResponse,
} from "@/lib/content-hub-api";

// Mostrati nel browser: foto raster e audio. Tutto il resto viene scaricato come allegato.
const INLINE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "audio/"];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const { id } = await context.params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "ID file non valido" }, { status: 400 });
  }

  try {
    const response = await contentHubDirectusFetch(`/assets/${id}`);
    if (!response.ok || !response.body) {
      if (response.status >= 500) {
        logContentHubUpstreamError("read-media", response, { id });
        return contentHubUnavailableResponse();
      }
      return NextResponse.json({ error: "File non trovato" }, { status: 404 });
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
      // Nessun file (nemmeno un vecchio SVG già caricato) può eseguire script nel dominio del sito.
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
    };
    if (!INLINE_TYPES.some((prefix) => contentType.startsWith(prefix))) {
      headers["Content-Disposition"] = "attachment";
    }

    return new Response(response.body, { status: 200, headers });
  } catch (error) {
    logContentHubUpstreamError("read-media", error, { id });
    return contentHubUnavailableResponse();
  }
}
