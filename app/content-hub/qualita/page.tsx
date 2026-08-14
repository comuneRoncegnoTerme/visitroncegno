import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import QualityDashboard from "./QualityDashboard";

export default async function ContentHubQualityPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");
  return <QualityDashboard />;
}
