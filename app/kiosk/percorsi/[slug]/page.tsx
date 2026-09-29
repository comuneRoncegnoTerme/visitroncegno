import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDirectusAssetUrl, getRouteBySlug, getSiteSettings } from "@/lib/directus";
import { plainText } from "@/lib/editorial";
import KioskDetail from "../../KioskDetail";

type Props = { params: Promise<{ slug: string }> };
export const metadata: Metadata = { robots: { index: false, follow: false } };

function durationLabel(minutes: number | null) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours} h` : null, rest ? `${rest} min` : null].filter(Boolean).join(" ");
}

export default async function KioskRouteDetailPage({ params }: Props) {
  const { slug } = await params;
  const [route, settings] = await Promise.all([
    getRouteBySlug(slug),
    getSiteSettings(),
  ]);
  if (!route) notFound();

  const logo = getDirectusAssetUrl(settings.logo);
  const image = getDirectusAssetUrl(route.image);
  const paragraphs = plainText(route.description ?? route.summary);
  const facts = [
    route.distance_km !== null ? { label: "Distanza", value: `${route.distance_km} km` } : null,
    durationLabel(route.duration_minutes) ? { label: "Durata", value: durationLabel(route.duration_minutes) as string } : null,
    route.difficulty ? { label: "Difficoltà", value: route.difficulty.replaceAll("-", " ") } : null,
    route.elevation_gain_m !== null ? { label: "Dislivello", value: `+${route.elevation_gain_m} m` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <KioskDetail
      logo={logo}
      siteName={settings.site_name}
      section="Percorsi"
      backHref="/kiosk/percorsi"
      eyebrow={route.category?.name ?? "Percorso"}
      title={route.title}
      image={image}
      intro={route.route_highlight ?? route.summary}
      paragraphs={paragraphs}
      facts={facts}
      pathname={`/kiosk/percorsi/${slug}`}
    />
  );
}
