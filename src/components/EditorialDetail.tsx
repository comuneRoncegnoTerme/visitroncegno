import Link from "next/link";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList, plainText, type EditorialItem } from "@/lib/editorial";
import { getRoutesForPlace } from "@/lib/place-routes";
import { isCompactPlace, placeEditorialHeading, placeHref } from "@/lib/place-detail";
import DirectionsLink from "./DirectionsLink";
import EditorialHeader from "./EditorialHeader";
import HomeMap from "./HomeMap";
import SiteFooter from "./SiteFooter";
import styles from "./Editorial.module.css";

type Props = { item: EditorialItem; type: "place" | "event" };

const FALLBACK_HERO = "/images/hero/roncegno-hero.jpg";

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

export default async function EditorialDetail({ item, type }: Props) {
  const [settings, relatedItems, relatedRoutes] = await Promise.all([
    getSiteSettings(),
    getEditorialList(type === "place" ? "places" : "events"),
    type === "place" ? getRoutesForPlace(item.id) : Promise.resolve([]),
  ]);

  const directusImage = getDirectusAssetUrl(item.image);
  const heroImage = directusImage ?? FALLBACK_HERO;
  const paragraphs = plainText(item.content ?? item.description ?? item.summary);
  const location = item.address ?? item.location_name ?? item.place?.title ?? "Roncegno Terme";
  const website = normalizeUrl(item.website_url);
  const booking = normalizeUrl(item.booking_url);
  const categoryLabel = item.map_label ?? item.category?.name ?? (type === "place" ? "Luogo da conoscere" : "Evento");
  const compactPlace = type === "place" && isCompactPlace(item);
  const foodPlace = type === "place" && item.place_type === "food";
  const practicalInfo = type === "place" && Boolean(
    item.address || item.phone || item.email || website || booking || item.opening_hours ||
    item.ticket_info || item.visit_duration || item.services_notes || item.capacity_notes ||
    item.restrictions_notes || item.access_notes || item.parking_notes || item.public_transport_notes
  );
  const hasCoordinates = typeof item.latitude === "number" && typeof item.longitude === "number";
  const related = relatedItems
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => !foodPlace || candidate.place_type === "food")
    .slice(0, 3);
  const eventDate = type === "event" ? formatDateTime(item.start_date) : null;

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />

      <section
        className={styles.detailHero}
        style={{ backgroundImage: `linear-gradient(90deg,rgba(8,35,28,.88),rgba(8,35,28,.2)),url('${heroImage}')` }}
      >
        <Link href={type === "place" ? "/luoghi" : "/eventi"}>← {type === "place" ? "Tutti i luoghi" : "Tutti gli eventi"}</Link>
        <div className={styles.heroCopy}>
          <p>{categoryLabel}</p>
          <h1>{item.title}</h1>
          {item.summary && <div>{item.summary}</div>}
          {!directusImage && <small>Immagine del territorio · aggiungi una foto specifica dal Content Hub</small>}
        </div>
      </section>

      <section className={styles.factStrip} aria-label="Informazioni principali">
        <div><small>{type === "event" ? "Quando" : "Tipologia"}</small><strong>{type === "event" ? eventDate ?? "Data in aggiornamento" : categoryLabel}</strong></div>
        <div><small>Dove</small><strong>{location}</strong></div>
        {type === "place" && item.opening_hours && <div><small>Orari</small><strong>{item.opening_hours}</strong></div>}
        {type === "place" && item.capacity_notes && <div><small>{item.place_type === "parking" ? "Posti / capienza" : "Capienza"}</small><strong>{item.capacity_notes}</strong></div>}
        {type === "event" && item.end_date && <div><small>Fino a</small><strong>{formatDate(item.end_date)}</strong></div>}
      </section>

      <section className={styles.detailGrid}>
        {(!compactPlace || paragraphs.length > 0) && (
          <article>
            <p className={styles.kicker}>{foodPlace ? "A tavola" : type === "place" ? "Conosci il territorio" : "Vivi Roncegno"}</p>
            <h2>{foodPlace ? item.title : type === "place" ? placeEditorialHeading(item) : "Tutto quello che c’è da sapere."}</h2>
            {paragraphs.length ? paragraphs.map((text, index) => <p key={index}>{text}</p>) : (
              <p>Le informazioni complete saranno disponibili a breve. Nel frattempo trovi qui posizione, contatti e indicazioni pratiche disponibili.</p>
            )}
          </article>
        )}

        <aside>
          {type === "event" && item.start_date && <div><small>Quando</small><strong>{eventDate}</strong></div>}
          <div><small>Dove</small><strong>{location}</strong></div>
          {item.opening_hours && <div><small>Orari</small><strong>{item.opening_hours}</strong></div>}
          {item.ticket_info && <div><small>Biglietti / accesso</small><strong>{item.ticket_info}</strong></div>}
          {item.visit_duration && <div><small>Durata consigliata</small><strong>{item.visit_duration}</strong></div>}
          {item.capacity_notes && <div><small>{item.place_type === "parking" ? "Posti / capienza" : "Capienza"}</small><strong>{item.capacity_notes}</strong></div>}
          {item.restrictions_notes && <div><small>Limitazioni</small><strong>{item.restrictions_notes}</strong></div>}
          {item.services_notes && <div><small>Servizi</small><strong>{item.services_notes}</strong></div>}
          {item.phone && <div><small>Telefono</small><a className={styles.inlineContact} href={`tel:${item.phone}`}>{item.phone}</a></div>}
          {item.email && <div><small>Email</small><a className={styles.inlineContact} href={`mailto:${item.email}`}>{item.email}</a></div>}
          {practicalInfo && (item.access_notes || item.parking_notes || item.public_transport_notes) && (
            <div className={styles.practicalNotes}>
              {item.access_notes && <p><small>Accesso / accessibilità</small><span>{item.access_notes}</span></p>}
              {item.parking_notes && item.place_type !== "parking" && <p><small>Parcheggio</small><span>{item.parking_notes}</span></p>}
              {item.public_transport_notes && <p><small>Trasporto pubblico</small><span>{item.public_transport_notes}</span></p>}
            </div>
          )}
          <div className={styles.detailActions}>
            {booking && <a href={booking} target="_blank" rel="noreferrer">Prenota / contatta ↗</a>}
            {website && <a href={website} target="_blank" rel="noreferrer">Sito ufficiale ↗</a>}
            {(hasCoordinates || item.address) && (
              <DirectionsLink latitude={item.latitude} longitude={item.longitude} address={item.address}>
                Ottieni indicazioni ↗
              </DirectionsLink>
            )}
          </div>
        </aside>
      </section>

      {hasCoordinates && (
        <section className={`${styles.locationSection}${foodPlace ? ` ${styles.foodLocationSection}` : ""}`}>
          {foodPlace ? (
            <div className={styles.foodLocationHeading}>
              <div>
                <p className={styles.kicker}>Dove si trova</p>
                <h2>{location}</h2>
              </div>
              <DirectionsLink latitude={item.latitude} longitude={item.longitude} address={item.address}>
                Ottieni indicazioni ↗
              </DirectionsLink>
            </div>
          ) : (
            <div className={styles.sectionHeading}>
              <div><p className={styles.kicker}>Dove si trova</p><h2>Trovalo sulla mappa.</h2></div>
              <DirectionsLink latitude={item.latitude} longitude={item.longitude} address={item.address}>
                Apri indicazioni ↗
              </DirectionsLink>
            </div>
          )}
          <div className={`${styles.detailMap}${foodPlace ? ` ${styles.foodDetailMap}` : ""}`}>
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

      {type === "place" && !compactPlace && !foodPlace && relatedRoutes.length > 0 && (
        <section className={styles.relatedEditorial}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Da qui puoi partire</p><h2>Percorsi collegati a questo luogo.</h2></div>
            <Link href="/percorsi">Vedi tutti i percorsi →</Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedRoutes.slice(0, 3).map((route) => {
              const routeImage = getDirectusAssetUrl(route.image) ?? FALLBACK_HERO;
              const routeMeta = [
                route.category?.name ?? "Percorso",
                route.distance_km !== null ? `${route.distance_km} km` : null,
              ].filter(Boolean).join(" · ");

              return (
                <Link className={styles.relatedCard} key={route.id} href={`/percorsi/${route.slug}`}>
                  <div className={styles.relatedImage} style={{ backgroundImage: `url('${routeImage}')` }} />
                  <div>
                    <small>{routeMeta}</small>
                    <strong>{route.title}</strong>
                    {route.summary && <p>{route.summary}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {!compactPlace && related.length > 0 && (
        <section className={`${styles.relatedEditorial}${foodPlace ? ` ${styles.foodRelated}` : ""}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>{foodPlace ? "Dove mangiare" : "Continua a esplorare"}</p>
              <h2>{foodPlace ? "Altri posti dove mangiare." : "Potrebbe interessarti anche."}</h2>
            </div>
            <Link href={foodPlace ? "/organizza-la-visita" : type === "place" ? "/luoghi" : "/eventi"}>
              {foodPlace ? "Vedi dove mangiare →" : "Vedi tutto →"}
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((relatedItem) => {
              const relatedImage = getDirectusAssetUrl(relatedItem.image) ?? FALLBACK_HERO;
              const href = type === "place" ? placeHref(relatedItem) : `/eventi/${relatedItem.slug}`;
              return (
                <Link className={styles.relatedCard} key={relatedItem.id} href={href}>
                  <div className={styles.relatedImage} style={{ backgroundImage: `url('${relatedImage}')` }} />
                  <div>
                    <small>{relatedItem.map_label ?? relatedItem.category?.name ?? (type === "place" ? "Luogo" : "Evento")}</small>
                    <strong>{relatedItem.title}</strong>
                    {relatedItem.summary && <p>{relatedItem.summary}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {foodPlace ? (
        <section className={styles.foodEndLink}>
          <Link href="/organizza-la-visita"><small>Organizza la visita</small><strong>Dormire, servizi e informazioni utili →</strong></Link>
        </section>
      ) : (
        <section className={styles.relatedLinks}>
          <Link href="/organizza-la-visita"><small>Organizza</small><strong>Dove mangiare e dormire →</strong></Link>
          <Link href={type === "place" ? "/eventi" : "/luoghi"}><small>Continua a esplorare</small><strong>{type === "place" ? "Vedi i prossimi eventi" : "Conosci i luoghi"} →</strong></Link>
        </section>
      )}
      <SiteFooter settings={settings} />
    </main>
  );
}
