import { NextResponse } from "next/server";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { directusFetch, DirectusRequestError } from "@/lib/directus-client";

export async function requireContentHubSession() {
  return await getContentHubSession();
}

export function unauthorizedContentHubResponse() {
  return NextResponse.json(
    { error: "Sessione scaduta o non valida" },
    { status: 401 }
  );
}

export function contentHubUnavailableResponse() {
  return NextResponse.json(
    { error: "Servizio editoriale temporaneamente non disponibile" },
    { status: 503 }
  );
}

export async function contentHubDirectusFetch(
  path: string,
  options: RequestInit = {}
) {
  if (!process.env.DIRECTUS_TOKEN?.trim()) {
    throw new Error("DIRECTUS_TOKEN non configurato");
  }

  return directusFetch(path, {
    cache: "no-store",
    ...options,
    authenticated: true,
  });
}

export async function readJsonSafely(response: Response) {
  return await response.json().catch(() => null);
}

export function logContentHubUpstreamError(
  operation: string,
  error: unknown,
  metadata: Record<string, string | number | null | undefined> = {}
) {
  if (error instanceof DirectusRequestError) {
    console.error("Content Hub Directus request failed", {
      operation,
      path: error.path,
      status: error.status,
      ...metadata,
    });
    return;
  }

  if (error instanceof Response) {
    console.error("Content Hub Directus response failed", {
      operation,
      status: error.status,
      ...metadata,
    });
    return;
  }

  console.error("Content Hub operation failed", {
    operation,
    message: error instanceof Error ? error.message : "Unknown error",
    ...metadata,
  });
}

// Motivo restituito da Directus (es. "Value for field \"distance_km\" in collection \"routes\" has to be numeric").
async function directusErrorDetail(response: Response) {
  const body = (await response.clone().json().catch(() => null)) as
    | { errors?: Array<{ message?: string; extensions?: { code?: string; field?: string } }> }
    | null;
  const first = body?.errors?.[0];
  if (!first?.message) return null;
  return { message: first.message, code: first.extensions?.code, field: first.extensions?.field };
}

export async function upstreamFailureResponse(
  operation: string,
  response: Response,
  metadata: Record<string, string | number | null | undefined> = {}
) {
  const detail = await directusErrorDetail(response);
  logContentHubUpstreamError(operation, response, {
    ...metadata,
    directusCode: detail?.code,
    directusField: detail?.field,
    directusMessage: detail?.message,
  });

  // Errori di validazione (4xx): chi compila deve sapere quale campo correggere.
  if (detail && response.status < 500 && response.status !== 401) {
    const field = detail.field ? ` (campo "${detail.field}")` : "";
    return NextResponse.json(
      { error: `Salvataggio rifiutato da Directus${field}: ${detail.message}` },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: "Operazione non riuscita. Riprova tra poco." },
    { status: response.status >= 500 ? 503 : 502 }
  );
}
