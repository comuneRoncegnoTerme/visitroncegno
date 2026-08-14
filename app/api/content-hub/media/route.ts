import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_URL } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";

async function guard() {
  const session = await getContentHubSession();
  const token = process.env.DIRECTUS_TOKEN;
  return { session, token };
}

export async function GET() {
  const { session, token } = await guard();
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!token) return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });

  const params = new URLSearchParams({
    fields: "id,title,filename_download,type,filesize,width,height,uploaded_on",
    sort: "-uploaded_on",
    limit: "100",
  });
  const response = await fetch(`${DIRECTUS_URL}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json({ error: "Impossibile leggere la libreria media", details: result }, { status: response.status });
  }

  return NextResponse.json({ data: result?.data ?? [] });
}

export async function POST(request: NextRequest) {
  const { session, token } = await guard();
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!token) return NextResponse.json({ error: "DIRECTUS_TOKEN non configurato" }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Seleziona un file" }, { status: 400 });
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "application/gpx+xml",
    "application/xml",
    "text/xml",
    "application/octet-stream",
  ];
  const isGpx = file.name.toLowerCase().endsWith(".gpx");
  if (!allowed.includes(file.type) && !isGpx) {
    return NextResponse.json({ error: "Formato non supportato" }, { status: 415 });
  }
  if (file.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "File troppo grande: massimo 30 MB" }, { status: 413 });
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);
  const title = String(form?.get("title") ?? "").trim();
  if (title) upstream.append("title", title);

  const response = await fetch(`${DIRECTUS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: upstream,
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json({ error: "Directus ha rifiutato il file", details: result }, { status: response.status });
  }

  return NextResponse.json({ ok: true, data: result?.data ?? result }, { status: 201 });
}
