import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import {
  getDirectusAssetUrl,
  getExperiences,
  getFeaturedPlaces,
  getHomepage,
  getMapPlaces,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/directus";
import styles from "./home.module.css";

const quickLinks = [
  ["📅", "Programma", "/festa-della-castagna#programma"],
  ["📍", "Mappa", "#mappa"],
  ["🚌", "Come arrivare", "/festa-della-castagna#come-arrivare"],
  ["🍴", "Dove mangiare", "/festa-della-castagna#sapori"],
  ["📷", "Cosa vedere", "#esperienze"],
  ["🎟", "Eventi", "#eventi"],
] as const;

const castagnaStories = [
  ["Pannelli e audioguide", "Il castagno nella storia", "/it/sentieri/il-castagno-nella-storia-3-1"],
  ["Natura", "Aspetti botanici", "/it/sentieri/aspetti-botanici-3-2"],
  ["Tradizioni", "Utilizzo delle castagne", "/it/sentieri/utilizzo-delle-castagne-3-3"],
  ["Paesaggio", "Conservazione dei castagneti", "/it/sentieri/conservazione-castagneti-3-4"],
] as const;

export default async function Home() {
  const [homepage, experiences, mapPlaces, events, featuredPlaces, siteSettings] = await Promise.all([
    getHomepage(),
    getExperiences(),
    getMapPlaces(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
    getSiteSettings(),
  ]);

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";
  const siteName = siteSettings.site_name ?? "Visit Roncegno";
  const homeMapPlaces = mapPlaces
    .filter((place) => place.latitude !== null && place.longitude !== null)
    .map((place) => ({
      id: place.id,
      title: place.title,
      slug: place.slug,
      summary: place.summary,
      imageUrl: getDirectusAssetUrl(place.image),
      latitude: place.latitude as number,
      longitude: place.longitude as number,
      mapLabel: place.map_label,
    }));

  const featureImage = getDirectusAssetUrl(experiences[0]?.image) ?? heroImage;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>{siteName}</Link>
        <nav className={styles.nav} aria-label="Navigazione principale">
          <a href="#esperienze">Scopri Roncegno</a>
          <a href="#esperienze">Cosa fare</a>
          <Link href="/festa-della-castagna">Sapori</Link>
          <a href="#luoghi">Ospitalità</a>
          <a href="#mappa">Info utili</a>
        </nav>
        <div className={styles.tools}><span>♡ Preferiti</span><span>⌕ Cerca</span><span>IT</span></div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className={styles.heroOverlay} />
        <div className={styles.badge}><span>Castagna</span><strong>Edition</strong><span>Autunno<br />2026</span></div>
        <div className={styles.heroContent}>
          <span className={styles.edition}>Edizione speciale · Festa della Castagna</span>
          <h1>Roncegno<br />è in festa</h1>
          <p className={styles.heroLead}>Scopri la Festa della Castagna e il nuovo Visit Roncegno.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/festa-della-castagna">Scopri la Festa →</Link>
            <a className={styles.secondary} href="#esperienze">Esplora Roncegno →</a>
          </div>
        </div>
      </section>

      <section className={styles.quick} aria-label="Accessi rapidi Festa della Castagna">
        <h2>Vivi la Festa della Castagna</h2>
        <div className={styles.quickGrid}>
          {quickLinks.map(([icon, label, href]) => (
            <Link href={href} className={styles.quickCard} key={label}>
              <span className={styles.quickIcon}>{icon}</span><strong>{label}</strong><span>›</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} id="esperienze">
        <div className={styles.sectionHead}>
          <div><p className={styles.eyebrow}>Roncegno, tutto l’anno</p><h2>Quattro modi di vivere il territorio.</h2></div>
          <a href="#mappa">Esplora sulla mappa →</a>
        </div>
        <div className={styles.experienceGrid}>
          {experiences.slice(0, 4).map((experience, index) => {
            const image = getDirectusAssetUrl(experience.image) ?? heroImage;
            return (
              <Link href={experience.link ?? `/esperienze/${experience.slug}`} className={styles.experienceCard} key={experience.id}>
                <div className={styles.experienceImage} style={{ backgroundImage: `url('${image}')` }} />
                <div className={styles.experienceShade} />
                <div className={styles.experienceContent}>
                  <small>{String(index + 1).padStart(2, "0")} · Esperienza</small>
                  <h3>{experience.title}</h3>
                  {experience.description && <p>{experience.description}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.feature}>
        <div className={styles.featureImage} style={{ backgroundImage: `url('${featureImage}')` }} />
        <div className={styles.featureCopy}>
          <p className={styles.eyebrow}>Percorso in evidenza</p>
          <h2>Passeggiata al Biotopo La palude di Roncegno</h2>
          <p>Un itinerario accessibile per entrare nel paesaggio con lentezza, seguendo il tracciato GPX e i punti di interesse lungo il percorso.</p>
          <div className={styles.metricGrid}>
            <div className={styles.metric}><strong>1,3 km</strong><span>Distanza</span></div>
            <div className={styles.metric}><strong>60 min</strong><span>Durata</span></div>
            <div className={styles.metric}><strong>GPX</strong><span>Mappa interattiva</span></div>
          </div>
          <Link className={styles.primary} href="/percorsi/passeggiata-biotopo-palude-roncegno">Apri il percorso →</Link>
        </div>
      </section>

      <section className={styles.storyBand}>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>Storie del territorio</p>
          <h2>Il castagno si ascolta, si legge, si percorre.</h2>
          <p>I pannelli già presenti sul territorio diventano un racconto digitale continuo: QR, testi e audioguide accompagnano la visita senza cambiare i codici già stampati.</p>
          <Link className={styles.secondary} href="/festa-della-castagna#storie">Scopri le storie →</Link>
        </div>
        <div className={styles.storyLinks}>
          {castagnaStories.map(([eyebrow, title, href]) => (
            <Link className={styles.storyLink} href={href} key={href}><span>{eyebrow}</span><strong>{title} →</strong></Link>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.events}`} id="eventi">
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Agenda</p><h2>Cosa succede a Roncegno.</h2></div></div>
        <div className={styles.eventList}>
          {events.map((event) => {
            const date = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", timeZone: "Europe/Rome" }).format(new Date(event.start_date));
            return <article className={styles.event} key={event.id}><span className={styles.date}>{date}</span><div><h3>{event.title}</h3><small>{event.location_name ?? event.place?.title ?? "Roncegno Terme"}</small></div><Link href={`/eventi/${event.slug}`}>Scopri →</Link></article>;
          })}
        </div>
      </section>

      <section className={styles.section} id="luoghi">
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Luoghi da conoscere</p><h2>Roncegno, tra paese e montagna.</h2></div></div>
        <div className={styles.experienceGrid}>
          {featuredPlaces.map((place) => (
            <Link href={`/luoghi/${place.slug}`} className={styles.experienceCard} key={place.id}>
              <div className={styles.experienceImage} style={{ backgroundImage: `url('${getDirectusAssetUrl(place.image) ?? heroImage}')` }} />
              <div className={styles.experienceShade} />
              <div className={styles.experienceContent}><small>{place.category?.name ?? place.map_label ?? "Luogo"}</small><h3>{place.title}</h3></div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.mapSection} id="mappa">
        <div className={styles.mapPanel}><HomeMap places={homeMapPlaces} /></div>
        <div className={styles.mapCopy}><p className={styles.eyebrow}>Esplora la mappa</p><h2>Tutto il territorio, in un luogo.</h2><p>Sentieri, luoghi di interesse, parcheggi, strutture e servizi utili per organizzare la visita.</p></div>
      </section>

      <section className={styles.footerCta}><h2>Roncegno Terme, da vivere.</h2><p>Una destinazione fatta di paesaggio, comunità, sapori e storie. La Castagna Edition è solo l’inizio.</p></section>
    </main>
  );
}
