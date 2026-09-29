import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialItem, plainText } from "@/lib/editorial";
import KioskDetail from "../../KioskDetail";

type Props = { params: Promise<{ slug: string }> };
export const metadata: Metadata = { robots: { index: false, follow: false } };

function formatDate(value?: string | null) {
  if (!value) return "Da definire";
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

export default async function KioskEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, settings] = await Promise.all([
    getEditorialItem("events", slug),
    getSiteSettings(),
  ]);
  if (!item) notFound();

  const logo = getDirectusAssetUrl(settings.logo);
  const image = getDirectusAssetUrl(item.image);
  const paragraphs = plainText(item.description ?? item.content ?? item.summary);
  const facts = [
    { label: "Quando", value: formatDate(item.start_date) },
    { label: "Dove", value: item.location_name ?? item.place?.title ?? "Roncegno Terme" },
    item.end_date ? { label: "Fine", value: formatDate(item.end_date) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <KioskDetail
      logo={logo}
      siteName={settings.site_name}
      section="Eventi"
      backHref="/kiosk/eventi"
      eyebrow={item.category?.name ?? "Evento"}
      title={item.title}
      image={image}
      intro={item.summary}
      paragraphs={paragraphs}
      facts={facts}
    />
  );
}
