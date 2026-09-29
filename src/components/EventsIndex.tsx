import Link from "next/link";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import type { EditorialItem } from "@/lib/editorial";
import EditorialHeader from "./EditorialHeader";
import SiteFooter from "./SiteFooter";
import styles from "./EventsIndex.module.css";

type EventBucket = {
  featured: EditorialItem | null;
  featuredIsOngoing: boolean;
  future: EditorialItem[];
  past: EditorialItem[];
};

function eventStart(item: EditorialItem) {
  return item.start_date ? new Date(item.start_date).getTime() : Number.POSITIVE_INFINITY;
}

function eventEnd(item: EditorialItem) {
  return item.end_date ? new Date(item.end_date).getTime() : null;
}

function romeDayKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function isOngoing(item: EditorialItem, now: number, today: string) {
  if (!item.start_date || eventStart(item) > now) return false;
  const end = eventEnd(item);
  if (end !== null) return end >= now;
  return romeDayKey(item.start_date) === today;
}

function isPast(item: EditorialItem, now: number, today: string) {
  if (!item.start_date) return false;
  const end = eventEnd(item);
  if (end !== null) return end < now;
  return romeDayKey(item.start_date) < today;
}

function splitEvents(items: EditorialItem[]): EventBucket {
  const now = Date.now();
  const today = romeDayKey(new Date(now));

  const ongoing = items
    .filter((item) => isOngoing(item, now, today))
    .sort((a, b) => eventStart(a) - eventStart(b));

  const upcoming = items
    .filter((item) => item.start_date && eventStart(item) > now)
    .sort((a, b) => eventStart(a) - eventStart(b));

  const featured = ongoing[0] ?? upcoming[0] ?? null;
  const featuredIsOngoing = Boolean(featured && ongoing.some((item) => item.id === featured.id));

  const future = upcoming.filter((item) => item.id !== featured?.id);

  const past = items
    .filter((item) => isPast(item, now, today))
    .sort((a, b) => eventStart(b) - eventStart(a));

  return { featured, featuredIsOngoing, future, past };
}

function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    ...options,
  }).format(new Date(value));
}

function dateParts(value?: string | null) {
  if (!value) return { day: "", month: "", year: "" };
  const date = new Date(value);
  return {
    day: formatDate(value, { day: "2-digit" }),
    month: formatDate(value, { month: "short" }).replace(".", "").toUpperCase(),
    year: formatDate(value, { year: "numeric" }),
  };
}

function location(item: EditorialItem) {
  return item.location_name ?? item.place?.title ?? "Roncegno Terme";
}

function EventCard({ item, compact = false }: { item: EditorialItem; compact?: boolean }) {
  const image = getDirectusAssetUrl(item.image);
  const date = dateParts(item.start_date);

  return (
    <Link className={compact ? styles.pastCard : styles.futureCard} href={`/eventi/${item.slug}`}>
      <div
        className={compact ? styles.pastImage : styles.futureImage}
        style={image ? { backgroundImage: `url('${image}')` } : undefined}
      />
      <div className={compact ? styles.pastCopy : styles.futureCopy}>
        <div className={styles.dateBadge} aria-label={formatDate(item.start_date, { dateStyle: "long" })}>
          <strong>{date.day}</strong>
          <span>{date.month}</span>
        </div>
        <small>{item.category?.name ?? "Evento"} · {location(item)}</small>
        <h3>{item.title}</h3>
        {!compact && item.summary && <p>{item.summary}</p>}
        <span className={styles.cardLink}>{compact ? "Rivedi l’evento" : "Scopri l’evento"} →</span>
      </div>
    </Link>
  );
}

export default async function EventsIndex({ items }: { items: EditorialItem[] }) {
  const settings = await getSiteSettings();
  const { featured, featuredIsOngoing, future, past } = splitEvents(items);
  const heroImage = getDirectusAssetUrl(featured?.image);
  const heroPhotoA = getDirectusAssetUrl(future[0]?.image ?? featured?.image);
  const heroPhotoB = getDirectusAssetUrl(future[1]?.image ?? featured?.image);

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />

      <section className={styles.hero}>
        {heroImage && <div className={styles.heroBackdrop} style={{ backgroundImage: `url('${heroImage}')` }} aria-hidden="true" />}
        <div className={styles.heroInner}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}>Agenda</p>
            <h1>Vivi Roncegno,<br />insieme.</h1>
          </div>
          <p className={styles.heroIntro}>
            Feste di paese, cultura, sport e sapori: gli appuntamenti per incontrare la comunità e vivere il territorio nel momento giusto.
          </p>
          {(heroPhotoA || heroPhotoB) && (
            <div className={styles.heroPhotos} aria-hidden="true">
              {heroPhotoA && <span className={styles.heroPhotoA} style={{ backgroundImage: `url('${heroPhotoA}')` }} />}
              {heroPhotoB && <span className={styles.heroPhotoB} style={{ backgroundImage: `url('${heroPhotoB}')` }} />}
            </div>
          )}
        </div>
      </section>

      {featured ? (
        <section className={styles.featuredSection} aria-labelledby="featured-event-title">
          <div className={styles.sectionLabelRow}>
            <p className={styles.sectionKicker}>{featuredIsOngoing ? "In corso" : "Prossimo evento"}</p>
            <span>{future.length + (featuredIsOngoing ? 0 : 1)} appuntamenti in arrivo</span>
          </div>

          <Link className={styles.featuredCard} href={`/eventi/${featured.slug}`}>
            <div
              className={styles.featuredImage}
              style={getDirectusAssetUrl(featured.image) ? { backgroundImage: `url('${getDirectusAssetUrl(featured.image)}')` } : undefined}
            />
            <div className={styles.featuredShade} />
            <div className={styles.featuredCopy}>
              <div className={styles.featuredMeta}>
                <span>{formatDate(featured.start_date, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
                <span>{location(featured)}</span>
              </div>
              <h2 id="featured-event-title">{featured.title}</h2>
              {featured.summary && <p>{featured.summary}</p>}
              <strong>Scopri l’evento <span aria-hidden="true">→</span></strong>
            </div>
          </Link>
        </section>
      ) : null}

      <section className={styles.futureSection} aria-labelledby="future-events-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionKicker}>Prossimamente</p>
            <h2 id="future-events-title">Eventi futuri.</h2>
          </div>
          <p>Gli appuntamenti già programmati, in ordine cronologico.</p>
        </div>

        {future.length ? (
          <div className={styles.futureGrid}>
            {future.map((item) => <EventCard item={item} key={item.id} />)}
          </div>
        ) : (
          <p className={styles.empty}>Non ci sono altri eventi futuri pubblicati in questo momento.</p>
        )}
      </section>

      {past.length ? (
        <section className={styles.pastSection} aria-labelledby="past-events-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionKicker}>Archivio</p>
              <h2 id="past-events-title">Eventi passati.</h2>
            </div>
            <p>Gli appuntamenti già conclusi restano consultabili come memoria della vita del territorio.</p>
          </div>

          <div className={styles.pastGrid}>
            {past.map((item) => <EventCard item={item} compact key={item.id} />)}
          </div>
        </section>
      ) : null}

      <nav className={styles.footerNav} aria-label="Continua a esplorare">
        <Link href="/cartina"><small>Orientati</small><strong>Esplora la cartina illustrata →</strong></Link>
        <Link href="/organizza-la-visita"><small>Organizza</small><strong>Prepara la tua visita →</strong></Link>
      </nav>

      <SiteFooter settings={settings} />
    </main>
  );
}
