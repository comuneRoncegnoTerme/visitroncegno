const DEFAULT_DIRECTUS_URL = "http://127.0.0.1:8055";
const DEFAULT_TIMEOUT_MS = 10_000;

export const DIRECTUS_URL = (
  process.env.DIRECTUS_URL?.trim() || DEFAULT_DIRECTUS_URL
).replace(/\/+$/, "");

export class DirectusRequestError extends Error {
  status: number | null;
  path: string;

  constructor(message: string, path: string, status: number | null = null) {
    super(message);
    this.name = "DirectusRequestError";
    this.path = path;
    this.status = status;
  }
}

type DirectusRequestOptions = RequestInit & {
  authenticated?: boolean;
  timeoutMs?: number;
};

function directusToken() {
  return process.env.DIRECTUS_TOKEN?.trim() || null;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  authenticated: boolean
) {
  const result = new Headers(headers);
  const token = authenticated ? directusToken() : null;

  if (token && !result.has("Authorization")) {
    result.set("Authorization", `Bearer ${token}`);
  }

  return result;
}

export async function directusFetch(
  path: string,
  options: DirectusRequestOptions = {}
) {
  const {
    authenticated = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    headers,
    ...requestOptions
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${DIRECTUS_URL}${path.startsWith("/") ? path : `/${path}`}`;

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, {
      ...requestOptions,
      headers: buildHeaders(headers, authenticated),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new DirectusRequestError(
        `Directus request timed out after ${timeoutMs}ms`,
        path
      );
    }

    throw new DirectusRequestError(
      error instanceof Error ? error.message : "Directus request failed",
      path
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function directusJson<T>(
  path: string,
  options: DirectusRequestOptions = {}
): Promise<T> {
  const response = await directusFetch(path, options);

  if (!response.ok) {
    throw new DirectusRequestError(
      `Directus request failed with status ${response.status}`,
      path,
      response.status
    );
  }

  return (await response.json()) as T;
}
