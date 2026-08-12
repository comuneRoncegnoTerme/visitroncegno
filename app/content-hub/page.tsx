import Link from "next/link";
import {
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getUpcomingEvents,
} from "@/lib/directus";
import { trailPanels } from "@/lib/trail-panels";
import HomepageEditor from "./HomepageEditor";
import styles from "./page.module.css";

export default async function ContentHubPage() {
  const [homepage, events, places, experiences] = await Promise.all([
    getHomepage(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getExperiences(),
  ]);

  const sections = [
    {
      title: "Homepage",
      text: "Hero, contenuti in evidenza e messaggi di lancio",
      count: "Modifica reale",
      href: "#homepage-editor",
    },
    {
      title: "Eventi",
      text: "Appuntamenti, date, luoghi e pubblicazione",
      count: `${events.length} in evidenza`,
      href: "#eventi",
    },
    {
      title: "Percorsi",
      text: "Schede, GPX, difficoltà e punti di interesse",
      count: "Percorsi",
      href: "/percorsi/passeggiata-biotopo-palude-roncegno",
    },
    {
      title: "Pannelli e audioguide",
      text: "QR esistenti, testi, audio e trascrizioni",
      count: `${trailPanels.length} prototipi`,
      href: "#pannelli",
    },
    {
      title: "Luoghi",
      text: "Luoghi da visitare, mappa e informazioni utili",
      count: `${places.length} in evidenza`,
      href: "#luoghi",
    },
    {
      title: "Esperienze",
      text: "Natura, benessere, cultura e movimento",
      count: `${experiences.length} attive`,
      href: "/lancio#scopri",
    },
  ];

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.logo}>Visit Roncegno</p>
          <span className={styles.product}>Content Hub</span>
        </div>
        <nav>
          <a href="#contenuti">Contenuti</a>
          <a href="#homepage-editor">Homepage</a>
          <a href="#pannelli">Pannelli e audio</a>
          <a href="#eventi">Eventi</a>
          <a href="#luoghi">Luoghi</a>
        </nav>
        <Link href="/lancio" className={styles.previewLink}>
          Apri anteprima sito ↗
        </Link>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Prototipo editoriale</p>
            <h1>Buongiorno, cosa vuoi aggiornare?</h1>
          </div>
          <div className={styles.userBadge}>Redazione turismo</div>
        </header>

        <section className={styles.cards} id="contenuti">
          {sections.map((section) => (
            <Link href={section.href} className={styles.card} key={section.title}>
              <span>{section.count}</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              <strong>Apri →</strong>
            </Link>
          ))}
        </section>

        <HomepageEditor homepage={homepage} />

        <section className={styles.panelSection} id="pannelli">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Segnaletica sul territorio</p>
              <h2>Pannelli e audioguide</h2>
            </div>
            <button type="button">+ Nuovo contenuto</button>
          </div>

          <div className={styles.table}>
            {trailPanels.map((panel) => (
              <div className={styles.row} key={panel.slug}>
                <div className={styles.statusDot} />
                <div>
                  <strong>{panel.title}</strong>
                  <small>/it/sentieri/{panel.slug}</small>
                </div>
                <span>Pannello {panel.panelNumber}</span>
                <span>{panel.qrCodes.length} QR</span>
                <Link href={`/it/sentieri/${panel.slug}`}>Apri ↗</Link>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.simpleSection} id="eventi">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Agenda</p>
              <h2>Prossimi eventi</h2>
            </div>
          </div>
          <div className={styles.list}>
            {events.map((event) => (
              <article key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <small>
                    {event.location_name ?? event.place?.title ?? "Roncegno Terme"}
                  </small>
                </div>
                <time>
                  {new Intl.DateTimeFormat("it-IT", {
                    day: "2-digit",
                    month: "long",
                    timeZone: "Europe/Rome",
                  }).format(new Date(event.start_date))}
                </time>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.simpleSection} id="luoghi">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Territorio</p>
              <h2>Luoghi in evidenza</h2>
            </div>
          </div>
          <div className={styles.list}>
            {places.map((place) => (
              <article key={place.id}>
                <div>
                  <strong>{place.title}</strong>
                  <small>{place.category?.name ?? place.map_label ?? "Luogo"}</small>
                </div>
                <span>Pubblicato</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
