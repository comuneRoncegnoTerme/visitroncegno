import Link from "next/link";
import DirectionsLink from "@/components/DirectionsLink";
import HomeMap from "@/components/HomeMap";
import type { EventItem } from "@/lib/directus";
import { eventDayBadge, eventTimeLabel, isEventOngoing } from "@/lib/event-dates";
import type { getMuseumNearby, Museum } from "@/lib/museums";
import { MuseumHours } from "./MuseumStatus";
import styles from "./Museum.module.css";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Orari, ingresso e contatti: tutto quello che serve per decidere quando andare. */
export function MuseumVisit({ museum, intro, children }: { museum: Museum; intro: string; children?: React.ReactNode }) {
  const facts = [
    ["Ingresso", museum.ticketInfo],
    ["Durata della visita", museum.visitDuration],
    ["Servizi", museum.servicesNotes],
    ["Da sapere", museum.restrictionsNotes],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <section className={styles.visit} id="visita" aria-labelledby={`${museum.id}-visita`}>
      <div className={styles.visitIntro}>
        <p className={styles.kicker}>Pianifica la visita</p>
        <h2 id={`${museum.id}-visita`}>Orari e visite</h2>
        <p>{intro}</p>
        {children}
      </div>
      <div className={styles.visitCard}>
        <MuseumHours hours={museum.openingHours} />
        {facts.length > 0 && (
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        )}
        <div className={styles.contacts}>
          {museum.bookingUrl && <a className={styles.contactPrimary} href={museum.bookingUrl} target="_blank" rel="noreferrer">Prenota la visita ↗</a>}
          {museum.phones.map((phone) => <a key={phone} href={telHref(phone)}>☎ {phone}</a>)}
          {museum.email && <a href={`mailto:${museum.email}`}>✉ {museum.email}</a>}
          {museum.website && <a href={museum.website} target="_blank" rel="noreferrer">Sito ufficiale del museo ↗</a>}
        </div>
      </div>
    </section>
  );
}

type NearbyPlaces = Awaited<ReturnType<typeof getMuseumNearby>>;

/** Indirizzo, indicazioni stradali, note di accesso e mappa dei dintorni (se il museo ha le coordinate). */
export function MuseumGettingThere({ museum, nearby, lead }: { museum: Museum; nearby: NearbyPlaces; lead: string }) {
  const notes = [
    ["Accesso", museum.accessNotes],
    ["Parcheggio", museum.parkingNotes],
    ["Con i mezzi pubblici", museum.publicTransportNotes],
  ].filter((note): note is [string, string] => Boolean(note[1]));

  return (
    <section className={styles.arrive} id="come-arrivare" aria-labelledby={`${museum.id}-arrivare`}>
      <div className={styles.arriveCopy}>
        <p className={styles.kicker}>{museum.area} · Roncegno Terme</p>
        <h2 id={`${museum.id}-arrivare`}>Come arrivare</h2>
        <p>{lead}</p>
        <p className={styles.address}>{museum.address}</p>
        <DirectionsLink
          className={styles.directions}
          latitude={museum.latitude}
          longitude={museum.longitude}
          address={`${museum.title}, ${museum.address}`}
        >
          Indicazioni stradali ↗
        </DirectionsLink>
        {notes.length > 0 && (
          <dl className={styles.arriveNotes}>
            {notes.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        )}
        <Link className={styles.textLink} href="/organizza-la-visita">Dormire, mangiare e servizi a Roncegno →</Link>
      </div>
      {nearby.length > 0 && (
        <div className={styles.arriveMap}>
          <HomeMap places={nearby} compact showFilters={false} />
          <p className={styles.mapCaption}>Il museo e i luoghi a meno di un chilometro e mezzo. Tocca un punto per la scheda.</p>
        </div>
      )}
    </section>
  );
}

/** Prossimi appuntamenti al museo, presi dagli eventi di Directus. */
export function MuseumEvents({ events, title }: { events: EventItem[]; title: string }) {
  if (!events.length) return null;
  return (
    <section className={styles.events} id="eventi" aria-labelledby="museum-events-title">
      <div className={styles.eventsHead}>
        <p className={styles.kicker}>In programma</p>
        <h2 id="museum-events-title">{title}</h2>
      </div>
      <ul className={styles.eventList}>
        {events.map((event) => {
          const badge = eventDayBadge(event.start_date);
          const time = eventTimeLabel(event);
          return (
            <li key={event.id}>
              <Link href={`/eventi/${event.slug}`}>
                {badge && <span className={styles.eventDate}><strong>{badge.day}</strong>{badge.month}</span>}
                <span className={styles.eventCopy}>
                  {isEventOngoing(event) && <em>In corso</em>}
                  <strong>{event.title}</strong>
                  {(time || event.summary) && <small>{[time ? `Ore ${time}` : null, event.summary].filter(Boolean).join(" · ")}</small>}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link className={styles.textLink} href="/eventi">Tutti gli eventi a Roncegno →</Link>
    </section>
  );
}
