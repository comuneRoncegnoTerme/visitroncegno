import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import SettingsEditor from "./SettingsEditor";

export default async function ContentHubSettingsPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");
  return <SettingsEditor />;
}
