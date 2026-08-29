import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getUpcomingEvents,
} from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import { trailPanels } from "@/lib/trail-panels";
import { cinqueValliPanels } from "@/lib/cinque-valli-panels";
import HomepageEditor from "./HomepageEditor";
import styles from "./page.module.css";

export default async function ContentHubPage() {
  const session = await getContentHubSession();
  if (!session) redirect("/content-hub/login");

  const [homepage, events, places, experiences] = await Promise.all([
    getHomepage(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getExperiences(),
  ]);

  const panelCount = trailPanels.length + cinqueValliPanels.length;
  const secondarySections = [
    { title: "Percorsi", text: "Dati tecnici, accessibilità, punto di partenza e GPX", meta: "Gestione completa", href: "/content-hub/percorsi" },
    { title: "Pannelli e audioguide", text: "Immagini, audio e testi delle pagine collegate ai QR", meta: `${panelCount} URL legacy`, href: "/content-hub/pannelli" },
    { title: "Media", text: "Immagini, audio, documenti e tracce GPX", meta: "Libreria Directus", href: "/content-hub/media" },
    { title: "Qualità contenuti", text: "Controlla immagini, coordinate, GPX e dati mancanti", meta: "Controllo automatico", href: "/content-hub/qualita" },
    { title: "Impostazioni sito", text: "Contatti, footer, social, logo e SEO predefinito", meta: "Configurazione", href: "/content-hub/impostazioni" },
  ];

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div><p className={styles.logo}>Visit Roncegno</p><span className={styles.product}>Content Hub</span></div>
        <nav>
          <a href="#contenuti">Dashboard</a>
          <a href="#homepage-editor">Homepage</a>
          <Link href="/content-hub/eventi">Eventi</Link>
          <Link href="/content-hub/luoghi">Luoghi</Link>
          <Link href="/content-hub/percorsi">Percorsi</Link>
          <Link href="/content-hub/pannelli">Pannelli e audioguide</Link>
          <Link href="/content-hub/media">Media</Link>
          <Link href="/content-hub/qualita">Qualità</Link>
          <Link href="/content-hub/impostazioni">Impostazioni</Link>
        </nav>
        <div className={styles.sidebarActions}>
          <Link href="/" className={styles.previewLink}>Apri sito ↗</Link>
          <form action="/api/content-hub/logout" method="post"><button type="submit" className={styles.logoutButton}>Esci</button></form>
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Area redazione</p>
            <h1>Buon lavoro, {session.name}.</h1>
            <p className={styles.intro}>Aggiorna ciò che cambia oggi. Il resto può restare sullo sfondo.</p>
          </div>
          <div className={styles.userBadge}><strong>{session.name}</strong><span>{session.role}</span></div>
        </header>

        <section className={styles.dashboard} id="contenuti">
          <div className={styles.primaryColumn}>
            <p className={styles.sectionLabel}>Modifica subito</p>
            <Link href="#homepage-editor" className={styles.heroAction}>
              <div>
                <span>Homepage</span>
                <h2>La prima pagina del territorio.</h2>
                <p>Hero, messaggi principali, call to action e contenuti in evidenza.</p>
              </div>
              <strong>Modifica homepage →</strong>
            </Link>

            <div className={styles.quickGrid}>
              <Link href="/content-hub/eventi" className={styles.quickAction}>
                <span>{events.length} prossimi</span>
                <h3>Eventi</h3>
                <p>Aggiorna calendario e appuntamenti.</p>
                <strong>Gestisci →</strong>
              </Link>
              <Link href="/content-hub/luoghi" className={styles.quickAction}>
                <span>{places.length} in evidenza</span>
                <h3>Luoghi</h3>
                <p>Schede, contatti, coordinate e mappa.</p>
                <strong>Gestisci →</strong>
              </Link>
            </div>
          </div>

          <aside className={styles.statusColumn}>
            <p className={styles.sectionLabel}>Stato redazione</p>
            <div className={styles.statusList}>
              <div><strong>{events.length}</strong><span>eventi prossimi</span></div>
              <div><strong>{places.length}</strong><span>luoghi in evidenza</span></div>
              <div><strong>{panelCount}</strong><span>URL QR preservati</span></div>
              <div><strong>{experiences.length}</strong><span>esperienze attive</span></div>
            </div>
            <Link href="/content-hub/qualita" className={styles.qualityLink}>Controlla qualità contenuti →</Link>
          </aside>
        </section>

        <section className={styles.manageSection}>
          <div className={styles.manageHeading}>
            <div><p className={styles.sectionLabel}>Gestione</p><h2>Tutto il resto, senza rumore.</h2></div>
          </div>
          <div className={styles.manageList}>
            {secondarySections.map((section) => (
              <Link href={section.href} className={styles.manageRow} key={section.title}>
                <div><h3>{section.title}</h3><p>{section.text}</p></div>
                <span>{section.meta}</span>
                <strong>Apri →</strong>
              </Link>
            ))}
          </div>
        </section>

        <HomepageEditor homepage={homepage} />

        <section className={styles.panelSection} id="pannelli">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Segnaletica sul territorio</p><h2>Pannelli e audioguide legacy</h2></div><Link href="/content-hub/pannelli">Gestisci contenuti →</Link></div>
          <p className={styles.sectionIntro}>Gli URL già stampati sui QR restano invariati. Immagini e audioguide si possono aggiornare dal Content Hub senza cambiare gli indirizzi fisici.</p>
          <div className={styles.table}>
            {[...trailPanels, ...cinqueValliPanels].map((panel) => (
              <div className={styles.row} key={panel.slug}>
                <div className={styles.statusDot} />
                <div><strong>{panel.title}</strong><small>/it/sentieri/{panel.slug}</small></div>
                <span>Pannello {panel.panelNumber}</span><span>{panel.qrCodes.length} QR</span><Link href={`/it/sentieri/${panel.slug}`}>Apri ↗</Link>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.simpleSection} id="eventi">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Agenda</p><h2>Prossimi eventi in homepage</h2></div><Link href="/content-hub/eventi">Gestisci eventi →</Link></div>
          <div className={styles.list}>
            {events.map((event) => (
              <article key={event.id}><div><strong>{event.title}</strong><small>{event.location_name ?? event.place?.title ?? "Roncegno Terme"}</small></div><time>{new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", timeZone: "Europe/Rome" }).format(new Date(event.start_date))}</time></article>
            ))}
          </div>
        </section>

        <section className={styles.simpleSection} id="luoghi">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Territorio</p><h2>Luoghi in evidenza</h2></div><Link href="/content-hub/luoghi">Gestisci luoghi →</Link></div>
          <div className={styles.list}>
            {places.map((place) => (
              <article key={place.id}><div><strong>{place.title}</strong><small>{place.category?.name ?? place.map_label ?? "Luogo"}</small></div><span>{place.latitude != null && place.longitude != null ? "Coordinate presenti" : "Coordinate mancanti"}</span></article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
