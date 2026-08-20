import { notFound } from "next/navigation";
import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import mobileStyles from "@/components/RouteMobile.module.css";

import {
  getDirectusAssetUrl,
  getRouteBySlug,
  getSiteSettings,
} from "@/lib/directus";

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_ROUTE_IMAGE =
  "/images/homepage/APT_Valsugana_Roncegno_2025_10_07_Luca_Matassoni_HD_12.jpg";

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours} h ${remainingMinutes} min`;
}

function difficultyLabel(value: string | null) {
  switch (value) {
    case "easy": return "Facile";
    case "medium": return "Media";
    case "hard": return "Difficile";
    default: return value ?? "Non indicata";
  }
}

function humanize(value: string | null) {
  if (!value) return null;
  return value.replaceAll("-", " ");
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const [route, siteSettings] = await Promise.all([
    getRouteBySlug(slug),
    getSiteSettings(),
  ]);

  if (!route) notFound();

  const directusHeroImage = getDirectusAssetUrl(route.image);
  const heroImage = directusHeroImage ?? FALLBACK_ROUTE_IMAGE;
  const gpxUrl = getDirectusAssetUrl(route.gpx_file);
  const duration = formatDuration(route.duration_minutes);

  const primaryStats = [
    route.distance_km !== null ? ["Distanza", `${route.distance_km} km`] : null,
    duration ? ["Durata", duration] : null,
    ["Difficoltà", difficultyLabel(route.difficulty)],
    route.elevation_gain_m !== null ? ["Dislivello", `+${route.elevation_gain_m} m`] : null,
  ].filter(Boolean) as [string, string][];

  const secondaryStats = [
    route.duration_class ? ["Impegno", humanize(route.duration_class)] : null,
    route.audience ? ["Per chi", humanize(route.audience)] : null,
    route.season ? ["Periodo", humanize(route.season)] : null,
    route.loop_route ? ["Tracciato", "Ad anello"] : null,
    route.public_transport ? ["Mobilità", "Trasporto pubblico"] : null,
    route.family_friendly ? ["Ideale per", "Famiglie"] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <main className={mobileStyles.routePage}>
      <SiteHeader settings={siteSettings} />

      <section className="route-hero route-hero-v2">
        <div
          className="route-hero-image"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="route-hero-overlay" />
        <div className="route-hero-content">
          <Link className="route-back" href="/percorsi">← Percorsi</Link>
          <p className="eyebrow">{route.category?.name ?? "Percorso"}</p>
          <h1>{route.title}</h1>
          {route.route_highlight && <p className="route-highlight">{route.route_highlight}</p>}
          {!directusHeroImage && (
            <small className="route-image-note">Immagine territoriale provvisoria · carica una foto del percorso in Directus</small>
          )}
        </div>
      </section>

      <section className="route-overview route-overview-v2">
        <div className="section-shell">
          <div className="route-stats route-stats-v2">
            {primaryStats.map(([label, value]) => (
              <div className="route-stat" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="route-story-grid">
            <article className="route-description">
              <p className="eyebrow dark">Il percorso</p>
              {route.summary && <p className="route-lead">{route.summary}</p>}
              {route.description && <div>{route.description}</div>}
            </article>

            {secondaryStats.length > 0 && (
              <aside className="route-quickfacts" aria-label="Informazioni pratiche">
                <p className="eyebrow dark">In breve</p>
                {secondaryStats.map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </aside>
            )}
          </div>
        </div>
      </section>

      {gpxUrl && (
        <section className="route-map-section route-map-section-v2">
          <div className="section-shell">
            <div className="route-map-heading">
              <div>
                <p className="eyebrow dark">Il tracciato</p>
                <h2>Segui il percorso<br />sulla mappa.</h2>
              </div>
              <p>Consulta il tracciato completo, individua partenza e arrivo e orientati lungo il percorso.</p>
            </div>
            <RouteMap gpxUrl={gpxUrl} />
          </div>
        </section>
      )}

      {route.points && route.points.length > 0 && (
        <section className="route-points route-points-v2">
          <div className="section-shell">
            <div className="route-points-heading">
              <div>
                <p className="eyebrow dark">Lungo il percorso</p>
                <h2>Tappe e luoghi<br />da non perdere.</h2>
              </div>
              <p>Apri le singole schede per scoprire storia, informazioni pratiche e posizione dei luoghi attraversati.</p>
            </div>

            <div className="route-points-grid">
              {route.points.map((point, index) => {
                const placeImage = getDirectusAssetUrl(point.place?.image) ?? heroImage;
                const href = point.place ? `/luoghi/${point.place.slug}` : null;
                const card = (
                  <article className="route-point-card">
                    <div
                      className="route-point-image"
                      style={{ backgroundImage: `url('${placeImage}')` }}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="route-point-copy">
                      <small>{point.place ? "Luogo collegato" : "Tappa"}</small>
                      <h3>{point.place?.title ?? point.title}</h3>
                      {point.description && <p>{point.description}</p>}
                      {href && <strong>Scopri il luogo →</strong>}
                    </div>
                  </article>
                );

                return href ? (
                  <Link className="route-point-link" href={href} key={point.id}>{card}</Link>
                ) : (
                  <div key={point.id}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(route.komoot_url || route.outdooractive_url) && (
        <section className="route-platforms route-platforms-v2">
          <div className="section-shell route-platform-inner">
            <div>
              <p className="eyebrow dark">Porta il percorso con te</p>
              <h2>Continua sull&apos;app che preferisci.</h2>
            </div>
            <div className="route-platform-buttons">
              {route.komoot_url && <a href={route.komoot_url} target="_blank" rel="noreferrer" className="button button-dark-outline">Komoot ↗</a>}
              {route.outdooractive_url && <a href={route.outdooractive_url} target="_blank" rel="noreferrer" className="button button-dark-outline">Outdooractive ↗</a>}
            </div>
          </div>
        </section>
      )}

      <section className="route-end-links">
        <Link href="/percorsi"><small>Continua a esplorare</small><strong>Scopri tutti i percorsi →</strong></Link>
        <Link href="/luoghi"><small>Conosci il territorio</small><strong>Esplora i luoghi →</strong></Link>
      </section>

      <SiteFooter settings={siteSettings} />
    </main>
  );
}
