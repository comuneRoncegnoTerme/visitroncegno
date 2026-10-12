import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getFeaturedPlaces,
  getHomepageRoutes,
  getUpcomingEvents,
} from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { trailPanels } from "@/lib/trail-panels";
import { cinqueValliPanels } from "@/lib/cinque-valli-panels";
import PageHeader from "./PageHeader";
import styles from "./page.module.css";

const TIME_ZONE = "Europe/Rome";

function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("it-IT", { hour: "numeric", hour12: false, timeZone: TIME_ZONE }).format(now)
  );
  if (hour < 13) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function formatEventDate(start: string, end: string | null) {
  const day = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", timeZone: TIME_ZONE });
  const from = day.format(new Date(start));
  if (!end) return from;
  const to = day.format(new Date(end));
  return to === from ? from : `${from} – ${to}`;
}

export default async function ContentHubPage() {
  const session = await getContentHubSession();
  if (!session) redirect("/content-hub/login");

  const [events, places, routes] = await Promise.all([
    getUpcomingEvents(6),
    getFeaturedPlaces(),
    getHomepageRoutes(),
  ]);

  const now = new Date();
  const firstName = session.name.split(" ")[0] || session.name;
  const today = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(now);
  const panelCount = trailPanels.length + cinqueValliPanels.length;

  return (
    <main className={styles.page}>
      <PageHeader
        title={`${greeting(now)}, ${firstName}`}
        intro={`Oggi è ${today}.`}
        actions={
          <>
            <Link href="/content-hub/eventi">Nuovo evento</Link>
            <Link href="/content-hub/media">Carica immagini</Link>
          </>
        }
      />

      <div className={styles.columns}>
        <div className={styles.mainColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2>Prossimi eventi</h2>
              <Link href="/content-hub/eventi">Tutti gli eventi</Link>
            </div>
            {events.length === 0 ? (
              <p className={styles.empty}>
                Non ci sono eventi pubblicati in programma.{" "}
                <Link href="/content-hub/eventi">Aggiungine uno</Link>.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    <th scope="col">Evento</th>
                    <th scope="col"><span className={styles.srOnly}>Azioni</span></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className={styles.date}>{formatEventDate(event.start_date, event.end_date)}</td>
                      <td>
                        <strong>{event.title}</strong>
                        <small>{event.location_name ?? event.place?.title ?? "Luogo da indicare"}</small>
                      </td>
                      <td className={styles.rowAction}>
                        <Link href={`/content-hub/eventi?id=${event.id}`}>Modifica</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2>In homepage adesso</h2>
              <Link href="/content-hub/homepage">Modifica la homepage</Link>
            </div>
            <div className={styles.homeGrid}>
              <div>
                <h3>Luoghi in evidenza</h3>
                {places.length === 0 ? (
                  <p className={styles.empty}>Nessun luogo segnato come “in evidenza”.</p>
                ) : (
                  <ul className={styles.simpleList}>
                    {places.map((place) => (
                      <li key={place.id}>
                        <Link href={`/content-hub/luoghi?id=${place.id}`}>{place.title}</Link>
                        {(place.latitude == null || place.longitude == null) && (
                          <span className={styles.warning}>senza coordinate</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3>Percorsi consigliati</h3>
                {routes.length === 0 ? (
                  <p className={styles.empty}>Nessun percorso consigliato.</p>
                ) : (
                  <ul className={styles.simpleList}>
                    {routes.map((route) => (
                      <li key={route.id}>
                        <Link href={`/content-hub/percorsi?id=${route.id}`}>{route.title}</Link>
                        {route.distance_km != null && <span>{route.distance_km.toLocaleString("it-IT")} km</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <h2 className={styles.sideTitle}>Vai a</h2>
            <ul className={styles.linkList}>
              <li><Link href="/content-hub/luoghi">Luoghi, mangiare e dormire</Link></li>
              <li><Link href="/content-hub/percorsi">Percorsi e GPX</Link></li>
              <li><Link href="/content-hub/storie">Storie e memoria</Link></li>
              <li><Link href="/content-hub/pannelli">Pannelli e audioguide</Link></li>
              <li><Link href="/content-hub/impostazioni">Contatti e impostazioni del sito</Link></li>
            </ul>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.sideTitle}>Prima di pubblicare</h2>
            <p className={styles.note}>
              Il controllo automatico segnala i contenuti pubblicati senza foto,
              coordinate, GPX o testo breve, e gli eventi già finiti.
            </p>
            <Link href="/content-hub/qualita" className={styles.sideLink}>Vedi cosa manca</Link>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.sideTitle}>Pannelli con QR</h2>
            <p className={styles.note}>
              {panelCount} pagine sono collegate a QR già stampati sui sentieri.
              Testi, foto e audio si possono cambiare, l’indirizzo no.
            </p>
            <Link href="/content-hub/pannelli" className={styles.sideLink}>Gestisci i pannelli</Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
