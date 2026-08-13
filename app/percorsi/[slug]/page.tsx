import { notFound } from "next/navigation";
import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import {
  getDirectusAssetUrl,
  getRouteBySlug,
  getSiteSettings,
} from "@/lib/directus";

interface RoutePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function difficultyLabel(value: string | null) {
  switch (value) {
    case "easy":
      return "Facile";

    case "medium":
      return "Media";

    case "hard":
      return "Difficile";

    default:
      return value ?? "Non indicata";
  }
}

export default async function RoutePage({
  params,
}: RoutePageProps) {
  const { slug } = await params;

  const [route, siteSettings] = await Promise.all([getRouteBySlug(slug), getSiteSettings()]);

  if (!route) {
    notFound();
  }

  const heroImage =
    getDirectusAssetUrl(route.image);

  const gpxUrl =
    getDirectusAssetUrl(route.gpx_file);

  const duration =
    formatDuration(route.duration_minutes);

  return (
    <main>
      <SiteHeader settings={siteSettings} />
      <section className="route-hero">
        {heroImage && (
          <div
            className="route-hero-image"
            style={{
              backgroundImage: `url('${heroImage}')`,
            }}
          />
        )}

        <div className="route-hero-overlay" />

        <div className="route-hero-content">
          <Link
            className="route-back"
            href="/#esperienze"
          >
            ← Percorsi
          </Link>

          <p className="eyebrow">
            {route.category?.name ?? "Percorso"}
          </p>

          <h1>{route.title}</h1>

          {route.route_highlight && (
            <p className="route-highlight">
              {route.route_highlight}
            </p>
          )}
        </div>
      </section>

      <section className="route-overview">
        <div className="section-shell">
          <div className="route-stats">
            {route.distance_km !== null && (
              <div className="route-stat">
                <span>Distanza</span>
                <strong>
                  {route.distance_km} km
                </strong>
              </div>
            )}

            {duration && (
              <div className="route-stat">
                <span>Durata</span>
                <strong>{duration}</strong>
              </div>
            )}

            <div className="route-stat">
              <span>Difficoltà</span>
              <strong>
                {difficultyLabel(
                  route.difficulty
                )}
              </strong>
            </div>

            {route.elevation_gain_m !== null && (
              <div className="route-stat">
                <span>Dislivello</span>
                <strong>
                  +{route.elevation_gain_m} m
                </strong>
              </div>
            )}
          </div>

          {(route.summary ||
            route.description) && (
            <div className="route-description">
              {route.summary && (
                <p className="route-lead">
                  {route.summary}
                </p>
              )}

              {route.description && (
                <div>
                  {route.description}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {gpxUrl && (
        <section className="route-map-section">
          <div className="section-shell">
            <div className="route-map-heading">
              <div>
                <p className="eyebrow dark">
                  Il tracciato
                </p>

                <h2>
                  Segui il percorso
                  <br />
                  sulla mappa.
                </h2>
              </div>

              <p>
                Consulta il tracciato completo,
                individua partenza e arrivo e
                orientati lungo il percorso.
              </p>
            </div>

            <RouteMap gpxUrl={gpxUrl} />
          </div>
        </section>
      )}

      {(route.komoot_url ||
        route.outdooractive_url) && (
        <section className="route-platforms">
          <div className="section-shell">
            <p className="eyebrow dark">
              Porta il percorso con te
            </p>

            <h2>
              Apri il tracciato
              <br />
              sulla tua app.
            </h2>

            <div className="route-platform-buttons">
              {route.komoot_url && (
                <a
                  href={route.komoot_url}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-dark-outline"
                >
                  Apri su Komoot →
                </a>
              )}

              {route.outdooractive_url && (
                <a
                  href={route.outdooractive_url}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-dark-outline"
                >
                  Apri su Outdooractive →
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {route.points &&
        route.points.length > 0 && (
          <section className="route-points">
            <div className="section-shell">
              <p className="eyebrow dark">
                Lungo il percorso
              </p>

              <h2>
                Tappe e luoghi
                <br />
                da non perdere.
              </h2>

              <div className="route-points-list">
                {route.points.map(
                  (point, index) => (
                    <article
                      className="route-point"
                      key={point.id}
                    >
                      <span>
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <small>
                          {point.place
                            ? "Luogo"
                            : "Tappa"}
                        </small>

                        <h3>
                          {point.place?.title ??
                            point.title}
                        </h3>

                        {point.description && (
                          <p>
                            {
                              point.description
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>
        )}
      <SiteFooter settings={siteSettings} />
    </main>
  );
}
