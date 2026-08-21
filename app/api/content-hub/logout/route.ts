import { clearContentHubSession } from "@/lib/content-hub-auth";

export async function POST() {
  await clearContentHubSession();

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/content-hub/login",
    },
  });
}
