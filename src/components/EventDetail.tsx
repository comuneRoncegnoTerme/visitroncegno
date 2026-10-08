import Link from "next/link";
import { getDirectusImageUrl, getDirectusShareImageUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList, plainText, type EditorialItem } from "@/lib/editorial";
import DirectionsLink from "./DirectionsLink";
import EditorialHeader from "./EditorialHeader";
import HomeMap from "./HomeMap";
import SiteFooter from "./SiteFooter";
import {
  currentAndUpcomingEvents,
  eventDayBadge,
  eventEndLabel,
  eventStartLabel,
  googleCalendarDates,
  schemaEventDates,
} from "@/lib/event-dates";
import { jsonLdString, SITE_URL } from "@/lib/seo";
import styles from "./EventDetail.module.css";

const FALLBACK_HERO = "/images/hero/roncegno-hero.jpg";

type Props = { item: EditorialItem };

function normalizeUrl(value?: string | null) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

// schema.org/Event costruito solo dai campi Directus compilati.
function eventJsonLd(item: EditorialItem, location: string, image: string | null) {
  const dates = schemaEventDates(item);
  if (!dates) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: item.title,
    description: item.summary ?? undefined,
    startDate: dates.startDate,
    endDate: dates.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${SITE_URL}/eventi/${item.slug}`,
    image: image ? [image] : undefined,
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        streetAddress: item.address ?? undefined,
        addressLocality: "Roncegno Terme",
        addressRegion: "TN",
        addressCountry: "IT",
      },
      geo:
        typeof item.latitude === "number" && typeof item.longitude === "number"
          ? { "@type": "GeoCoordinates", latitude: item.latitude, longitude: item.longitude }
          : undefined,
    },
  };
}

function googleCalendarHref(item: EditorialItem, location: string) {
  const dates = googleCalendarDates(item);
  if (!dates) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
    dates,
    location,
  });

  if (item.summary) params.set("details", item.summary);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventDetail({ item }: Props) {
  const [settings, allEvents] = await Promise.all([
    getSiteSettings(),
    getEditorialList("events"),
  ]);

  const directusImage = getDirectusImageUrl(item.image);
  const heroImage = directusImage ?? FALLBACK_HERO;
  const location = item.address ?? item.location_name ?? item.place?.title ?? "Roncegno Terme";
  const categoryLabel = item.map_label ?? item.category?.name ?? "Evento";
  const eventDate = eventStartLabel(item);
  const eventEnd = eventEndLabel(item);
  const badge = eventDayBadge(item.start_date);
  const paragraphs = plainText(item.content ?? item.description);
  const website = normalizeUrl(item.website_url);
  const booking = normalizeUrl(item.booking_url);
  const calendar = googleCalendarHref(item, location);
  const jsonLd = eventJsonLd(item, location, getDirectusShareImageUrl(item.image));
  const hasCoordinates = typeof item.latitude === "number" && typeof item.longitude === "number";
  const related = currentAndUpcomingEvents(allEvents)
    .filter((candidate) => candidate.id !== item.id)
    .slice(0, 3);

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />}

      <section
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(8,35,28,.9),rgba(8,35,28,.18)),url('${heroImage}')`,
        }}
      >
        <Link className={styles.backLink} href="/eventi">← Tutti gli eventi</Link>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{categoryLabel}</p>
          <h1>{item.title}</h1>
          {item.summary && <p className={styles.heroSummary}>{item.summary}</p>}

          <div className={styles.heroMeta} aria-label="Informazioni principali dell'evento">
            {badge && (
              <div className={styles.dateBadge} aria-hidden="true">
                <strong>{badge.day}</strong>
                <span>{badge.month}</span>
              </div>
            )}
            <div className={styles.heroFact}>
              <small>Quando</small>
              <strong>{eventDate ?? "Data in aggiornamento"}</strong>
              {eventEnd && <span>{eventEnd.includes(" ") ? `Fino a ${eventEnd}` : `Fino alle ${eventEnd}`}</span>}
            </div>
            <div className={styles.heroFact}>
              <small>Dove</small>
              <strong>{location}</strong>
            </div>
          </div>

        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.editorialCopy}>
          <p className={styles.kicker}>L’appuntamento</p>
          {/* Senza testo esteso resta il riepilogo: mai frasi segnaposto rivolte al visitatore. */}
          {paragraphs.length
            ? paragraphs.map((text, index) => <p key={index}>{text}</p>)
            : item.summary && <p>{item.summary}</p>}
        </article>

        <aside className={styles.infoCard} aria-label="Informazioni pratiche">
          {badge && (
            <div className={styles.infoDate}>
              <span><strong>{badge.day}</strong>{badge.month}</span>
              <p>{item.title}</p>
            </div>
          )}
          <div><small>Quando</small><strong>{eventDate ?? "Data in aggiornamento"}</strong></div>
          {eventEnd && <div><small>Termina</small><strong>{eventEnd}</strong></div>}
          <div><small>Dove</small><strong>{location}</strong></div>
          {item.ticket_info && <div><small>Biglietti / accesso</small><strong>{item.ticket_info}</strong></div>}
          {item.phone && <div><small>Telefono</small><a href={`tel:${item.phone}`}>{item.phone}</a></div>}
          {item.email && <div><small>Email</small><a href={`mailto:${item.email}`}>{item.email}</a></div>}

          <div className={styles.actions}>
            {(hasCoordinates || item.address) && (
              <DirectionsLink latitude={item.latitude} longitude={item.longitude} address={item.address}>
                Ottieni indicazioni
              </DirectionsLink>
            )}
            {calendar && (
              <a href={calendar} target="_blank" rel="noreferrer">
                Aggiungi al calendario ↗
              </a>
            )}
            {booking && <a href={booking} target="_blank" rel="noreferrer">Prenota / contatta ↗</a>}
            {website && <a href={website} target="_blank" rel="noreferrer">Sito ufficiale ↗</a>}
          </div>
        </aside>
      </section>

      {hasCoordinates && (
        <section className={styles.locationSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Dove</p>
              <h2>{location}</h2>
            </div>
            <DirectionsLink latitude={item.latitude} longitude={item.longitude} address={item.address}>
              Apri indicazioni ↗
            </DirectionsLink>
          </div>
          <div className={styles.map}>
            <HomeMap
              compact
              showFilters={false}
              places={[{
                id: item.id,
                title: item.title,
                slug: item.slug,
                summary: item.summary ?? null,
                imageUrl: directusImage,
                latitude: item.latitude as number,
                longitude: item.longitude as number,
                mapLabel: item.map_label ?? null,
                mapIcon: item.map_icon ?? null,
                placeType: item.place_type,
                detailMode: item.detail_mode,
                canonicalPath: item.canonical_path,
                externalDetailUrl: item.external_detail_url,
              }]}
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Prossimi appuntamenti</p>
              <h2>Da segnare in agenda.</h2>
            </div>
            <Link href="/eventi">Tutti gli eventi →</Link>
          </div>

          <div className={styles.relatedGrid}>
            {related.map((relatedItem) => {
              const image = getDirectusImageUrl(relatedItem.image) ?? FALLBACK_HERO;
              const date = eventDayBadge(relatedItem.start_date);
              return (
                <Link className={styles.relatedCard} key={relatedItem.id} href={`/eventi/${relatedItem.slug}`}>
                  <div className={styles.relatedImage} style={{ backgroundImage: `url('${image}')` }}>
                    {date && <span><strong>{date.day}</strong>{date.month}</span>}
                  </div>
                  <div className={styles.relatedCopy}>
                    <small>{relatedItem.category?.name ?? "Evento"}</small>
                    <strong>{relatedItem.title}</strong>
                    {relatedItem.summary && <p>{relatedItem.summary}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.endLinks}>
        <Link href="/organizza-la-visita">
          <small>Organizza</small>
          <strong>Dove mangiare e dormire →</strong>
        </Link>
        <Link href="/luoghi">
          <small>Continua a esplorare</small>
          <strong>Conosci i luoghi →</strong>
        </Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
