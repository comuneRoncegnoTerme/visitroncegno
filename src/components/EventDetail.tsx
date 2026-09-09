import Link from "next/link";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList, plainText, type EditorialItem } from "@/lib/editorial";
import DirectionsLink from "./DirectionsLink";
import EditorialHeader from "./EditorialHeader";
import HomeMap from "./HomeMap";
import SiteFooter from "./SiteFooter";
import styles from "./EventDetail.module.css";

const FALLBACK_HERO = "/images/hero/roncegno-hero.jpg";

type Props = { item: EditorialItem };

function normalizeUrl(value?: string | null) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "full",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

function dateBadge(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    day: new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      timeZone: "Europe/Rome",
    }).format(date),
    month: new Intl.DateTimeFormat("it-IT", {
      month: "short",
      timeZone: "Europe/Rome",
    }).format(date).replace(".", "").toUpperCase(),
  };
}

function calendarStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function googleCalendarHref(item: EditorialItem, location: string) {
  if (!item.start_date) return null;

  const start = new Date(item.start_date);
  if (Number.isNaN(start.getTime())) return null;

  const explicitEnd = item.end_date ? new Date(item.end_date) : null;
  const end = explicitEnd && !Number.isNaN(explicitEnd.getTime())
    ? explicitEnd
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
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

  const directusImage = getDirectusAssetUrl(item.image);
  const heroImage = directusImage ?? FALLBACK_HERO;
  const location = item.address ?? item.location_name ?? item.place?.title ?? "Roncegno Terme";
  const categoryLabel = item.map_label ?? item.category?.name ?? "Evento";
  const eventDate = formatDateTime(item.start_date);
  const eventEnd = formatDateTime(item.end_date);
  const badge = dateBadge(item.start_date);
  const paragraphs = plainText(item.content ?? item.description ?? item.summary);
  const website = normalizeUrl(item.website_url);
  const booking = normalizeUrl(item.booking_url);
  const calendar = googleCalendarHref(item, location);
  const hasCoordinates = typeof item.latitude === "number" && typeof item.longitude === "number";
  const now = Date.now();
  const related = allEvents
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => {
      if (!candidate.start_date) return false;
      const time = new Date(candidate.start_date).getTime();
      return !Number.isNaN(time) && time >= now;
    })
    .slice(0, 3);

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />

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
              {item.end_date && <span>Fino a {formatDate(item.end_date)}</span>}
            </div>
            <div className={styles.heroFact}>
              <small>Dove</small>
              <strong>{location}</strong>
            </div>
          </div>

          {!directusImage && (
            <small className={styles.imageNotice}>
              Immagine del territorio · aggiungi una foto specifica dal Content Hub
            </small>
          )}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.editorialCopy}>
          <p className={styles.kicker}>Vivi Roncegno</p>
          {paragraphs.length ? (
            paragraphs.map((text, index) => <p key={index}>{text}</p>)
          ) : (
            <p>Le informazioni complete sull&apos;evento saranno disponibili a breve.</p>
          )}
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
              const image = getDirectusAssetUrl(relatedItem.image) ?? FALLBACK_HERO;
              const date = dateBadge(relatedItem.start_date);
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
