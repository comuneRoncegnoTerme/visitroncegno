import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import MediaLibrary from "./MediaLibrary";

export default async function ContentHubMediaPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");
  return <MediaLibrary />;
}
