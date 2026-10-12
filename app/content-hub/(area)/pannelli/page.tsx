import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import PannelliEditor from "./PannelliEditor";

export default async function ContentHubPanelsPage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");
  return <PannelliEditor />;
}
