import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialItem, plainText } from "@/lib/editorial";
import KioskDetail from "../../KioskDetail";

type Props = { params: Promise<{ slug: string }> };
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function KioskPlaceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, settings] = await Promise.all([
    getEditorialItem("places", slug),
    getSiteSettings(),
  ]);
  if (!item) notFound();

  const logo = getDirectusAssetUrl(settings.logo);
  const image = getDirectusAssetUrl(item.image);
  const paragraphs = plainText(item.description ?? item.content ?? item.summary);
  const facts = [
    item.address ? { label: "Dove", value: item.address } : null,
    item.opening_hours ? { label: "Orari", value: item.opening_hours } : null,
    item.visit_duration ? { label: "Tempo di visita", value: item.visit_duration } : null,
    item.accessible ? { label: "Accessibilità", value: "Accessibile" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <KioskDetail
      logo={logo}
      siteName={settings.site_name}
      section="Scopri Roncegno"
      backHref="/kiosk/luoghi"
      eyebrow={item.map_label ?? item.category?.name ?? "Luogo"}
      title={item.title}
      image={image}
      intro={item.summary}
      paragraphs={paragraphs}
      facts={facts}
    />
  );
}
