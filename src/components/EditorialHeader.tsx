import type { SiteSettings } from "@/lib/directus";
import SiteHeader from "./SiteHeader";

export default function EditorialHeader({ settings }: { settings: SiteSettings }) {
  return <SiteHeader settings={settings} />;
}
