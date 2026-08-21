import { NextResponse } from "next/server";
import {
  contentHubDirectusFetch,
  contentHubUnavailableResponse,
  logContentHubUpstreamError,
  requireContentHubSession,
  unauthorizedContentHubResponse,
} from "@/lib/content-hub-api";

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

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logContentHubUpstreamError("read-media", error, { id });
    return contentHubUnavailableResponse();
  }
}
