import { DIRECTUS_URL } from "@/lib/directus-client";

// Asset pubblici di Directus serviti dal dominio del sito (attivo con DIRECTUS_PUBLIC_ASSET_URL=/media).
// Evita il contenuto misto quando il sito è in HTTPS e Directus risponde in HTTP su IP e porta.
const FILE_ID = /^[a-zA-Z0-9-]{1,64}$/;
const TRANSFORM_PARAMS = ["width", "height", "quality", "format", "fit", "withoutEnlargement", "key"];
const INLINE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "audio/", "video/mp4"];
const TIMEOUT_MS = 15_000;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!FILE_ID.test(id)) return new Response("Not found", { status: 404 });

  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const name of TRANSFORM_PARAMS) {
    const value = incoming.get(name);
    if (value && value.length <= 32) params.set(name, value);
  }
  const query = params.toString();
  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  let upstream: Response;
  try {
    // Nessun token: si espone solo ciò che il ruolo pubblico di Directus può già leggere.
    upstream = await fetch(`${DIRECTUS_URL}/assets/${id}${query ? `?${query}` : ""}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return new Response("Asset non disponibile", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.status === 404 || upstream.status === 403 ? "Not found" : "Asset non disponibile", {
      status: upstream.status === 404 || upstream.status === 403 ? 404 : 502,
    });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const responseHeaders = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
  });
  for (const name of ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  if (!INLINE_TYPES.some((prefix) => contentType.startsWith(prefix))) {
    responseHeaders.set("Content-Disposition", "attachment");
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
