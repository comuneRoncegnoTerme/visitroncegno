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

export async function GET() {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

  const params = new URLSearchParams({
    fields: "id,title,filename_download,type,filesize,width,height,uploaded_on",
    sort: "-uploaded_on",
    limit: "100",
  });

  try {
    const response = await contentHubDirectusFetch(`/files?${params.toString()}`);
    if (!response.ok) return upstreamFailureResponse("list-media", response);

    const result = await readJsonSafely(response);
    return NextResponse.json({ data: result?.data ?? [] });
  } catch (error) {
    logContentHubUpstreamError("list-media", error);
    return contentHubUnavailableResponse();
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireContentHubSession())) return unauthorizedContentHubResponse();

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

  try {
    const response = await contentHubDirectusFetch("/files", {
      method: "POST",
      body: upstream,
    });
    if (!response.ok) {
      return upstreamFailureResponse("upload-media", response, {
        filename: file.name,
        size: file.size,
      });
    }

    const result = await readJsonSafely(response);
    return NextResponse.json({ ok: true, data: result?.data ?? result }, { status: 201 });
  } catch (error) {
    logContentHubUpstreamError("upload-media", error, {
      filename: file.name,
      size: file.size,
    });
    return contentHubUnavailableResponse();
  }
}
