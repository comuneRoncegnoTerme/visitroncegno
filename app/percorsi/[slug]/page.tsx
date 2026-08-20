import { notFound } from "next/navigation";
import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import RouteElevationProfile from "@/components/RouteElevationProfile";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import mobileStyles from "@/components/RouteMobile.module.css";

import {
  DIRECTUS_URL,
  getDirectusAssetUrl,
  getRouteBySlug,
  getSiteSettings,
  type RoutePoint,
} from "@/lib/directus";

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

interface PointPlaceMedia {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  map_label: string | null;
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
    case "facile-moderata": return "Facile / moderata";
    default: return value ?? "Non indicata";
  }
}

function humanize(value: string | null) {
  if (!value) return null;
  return value.replaceAll("-", " ");
}

async function loadGpxText(gpxUrl: string | null) {
  if (!gpxUrl) return null;

  try {
    const response = await fetch(gpxUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`GPX asset error: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error("GPX asset error:", error);
    return null;
  }
}

async function loadPointPlaceMedia(points: RoutePoint[] | undefined) {
  const ids = Array.from(
    new Set(
      (points ?? [])
        .map((point) => point.place?.id)
        .filter((id): id is number => typeof id === "number")
    )
  );

  if (ids.length === 0) {
    return new Map<number, PointPlaceMedia>();
  }

  const params = new URLSearchParams();
  params.set("filter[id][_in]", ids.join(","));
  params.set("limit", String(ids.length));
  params.set("fields", "id,title,slug,image,map_label");

  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/places?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error(`Directus route place media error: ${response.status}`);
      return new Map<number, PointPlaceMedia>();
    }

    const result = (await response.json()) as { data?: PointPlaceMedia[] };
    return new Map((result.data ?? []).map((place) => [place.id, place]));
  } catch (error) {
    console.error("Directus route place media error:", error);
    return new Map<number, PointPlaceMedia>();
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const [route, siteSettings] = await Promise.all([
    getRouteBySlug(slug),
    getSiteSettings(),
  ]);

  if (!route) notFound();

  const [pointPlaceMedia] = await Promise.all([
    loadPointPlaceMedia(route.points),
  ]);

  const directusHeroImage = getDirectusAssetUrl(route.image);
  const heroImage = directusHeroImage ?? FALLBACK_ROUTE_IMAGE;
  const gpxUrl = getDirectusAssetUrl(route.gpx_file);
  const gpxText = await loadGpxText(gpxUrl);
  const duration = formatDuration(route.duration_minutes);

  const primaryStats = [
    route.distance_km !== null ? ["Distanza", `${route.distance_km} km`] : null,
    duration ? ["Durata", duration] : null,
    ["Difficoltà", difficultyLabel(route.difficulty)],
    route.elevation_gain_m !== null ? ["Dislivello", `+${route.elevation_gain_m} m`] : null,
  ].filter(Boolean) as [string, string][];

  const audience = route.audience
    ? humanize(route.audience)
    : route.family_friendly
      ? "Famiglie"
      : null;

  const secondaryStats = [
    audience ? ["Adatto a", audience] : null,
    route.season ? ["Periodo", humanize(route.season)] : null,
    route.loop_route ? ["Tracciato", "Ad anello"] : null,
    route.public_transport
      ? ["Come arrivare", "Anche con trasporto pubblico"]
      : null,
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

      {gpxText && (
        <section className="route-map-section route-map-section-v2">
          <div className="section-shell">
            <div className="route-map-heading">
              <div>
                <p className="eyebrow dark">Il tracciato</p>
                <h2>Segui il percorso<br />sulla mappa.</h2>
              </div>
              <p>Consulta il tracciato completo, individua partenza e arrivo e orientati lungo il percorso.</p>
            </div>
            <RouteMap gpxText={gpxText} />
            <RouteElevationProfile gpxText={gpxText} />
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
                const mediaPlace = point.place ? pointPlaceMedia.get(point.place.id) : null;
                const placeImageId = mediaPlace?.image ?? point.place?.image ?? null;
                const placeImage = getDirectusAssetUrl(placeImageId);
                const href = point.place ? `/luoghi/${point.place.slug}` : null;
                const badge = mediaPlace?.map_label || (point.place ? "Luogo" : "Tappa");
                const imageClass = placeImage
                  ? "route-point-image"
                  : "route-point-image route-point-image-empty";

                const card = (
                  <article className="route-point-card">
                    <div
                      className={imageClass}
                      style={placeImage ? { backgroundImage: `url('${placeImage}')` } : undefined}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {!placeImage && <small>Foto da aggiungere</small>}
                    </div>
                    <div className="route-point-copy">
                      <small>{badge}</small>
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
              <p className="eyebrow light">Sul telefono</p>
              <h2>Porta il percorso con te.</h2>
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
