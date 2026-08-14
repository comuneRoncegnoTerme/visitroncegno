import { NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await getContentHubSession())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "ID file non valido" }, { status: 400 });
  }

  const response = await fetch(`${DIRECTUS_URL}/assets/${id}`, { cache: "no-store" });
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "File non trovato" }, { status: response.status || 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
