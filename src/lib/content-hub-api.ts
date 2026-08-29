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

export function upstreamFailureResponse(
  operation: string,
  response: Response,
  metadata: Record<string, string | number | null | undefined> = {}
) {
  logContentHubUpstreamError(operation, response, metadata);
  return NextResponse.json(
    { error: "Operazione non riuscita. Riprova tra poco." },
    { status: response.status >= 500 ? 503 : 502 }
  );
}
