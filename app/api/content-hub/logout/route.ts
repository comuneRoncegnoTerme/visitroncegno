import { NextResponse } from "next/server";
import { clearContentHubSession } from "@/lib/content-hub-auth";

export async function POST(request: Request) {
  await clearContentHubSession();
  return NextResponse.redirect(new URL("/content-hub/login", request.url), 303);
}
