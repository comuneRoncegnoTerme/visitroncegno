import Link from "next/link";
import {
  getDirectusAssetUrl,
  getFeaturedPlaces,
  getHomepage,
  getUpcomingEvents,
} from "@/lib/directus";
import styles from "./page.module.css";

export default async function LaunchPage() {
  const [homepage, events, places] = await Promise.all([
    getHomepage(),
    getUpcomingEvents(),
    getFeaturedPlaces(),
  ]);

  const heroImage = getDirectusAssetUrl(homepage.hero_image) ?? "/images/hero/roncegno-hero.jpg";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/lancio" className={styles.brand}>Visit Roncegno</Link>
        <nav>
          <a href="#scopri">Scopri</a>
          <a href="#eventi">Eventi</a>
          <Link href="/festa-della-castagna">Festa della Castagna</Link>
        </nav>
      </header>

      <section className={styles.hero} style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p>Trentino · Valsugana</p>
          <h1>Roncegno Terme, da vivere.</h1>
          <span>Natura, storie, benessere e sapori. Un territorio da esplorare con il proprio ritmo.</span>
          <div className={styles.actions}>
            <a href="#scopri" className={styles.primary}>Scopri Roncegno</a>
            <Link href="/festa-della-castagna" className={styles.secondary}>Festa della Castagna</Link>
          </div>
        </div>
      </section>

      <section className={styles.launchFeature}>
        <div className={styles.featureLabel}>In evidenza · lancio</div>
        <div>
          <p className={styles.eyebrow}>Autunno a Roncegno</p>
          <h2>Festa della Castagna</h2>
          <p>La festa diventa il primo ingresso al nuovo ecosistema Visit Roncegno: programma, territorio, castagneti, pannelli e audioguide nello stesso percorso digitale.</p>
          <Link href="/festa-della-castagna" className={styles.darkButton}>Scopri la pagina di lancio →</Link>
        </div>
      </section>

      <section className={styles.discover} id="scopri">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Vivi Roncegno</p>
          <h2>Tre modi per entrare nel territorio.</h2>
        </div>
        <div className={styles.cards}>
          <article><span>01</span><h3>Sentieri e natura</h3><p>Percorsi, mappe GPX e punti di interesse per vivere il territorio passo dopo passo.</p><Link href="/percorsi/passeggiata-biotopo-palude-roncegno">Apri il percorso →</Link></article>
          <article><span>02</span><h3>Storie e audioguide</h3><p>I QR della segnaletica diventano porte d’accesso a contenuti aggiornabili, audio e approfondimenti.</p><Link href="/it/sentieri/la-tempesta-vaia-11-1">Apri un pannello →</Link></article>
          <article><span>03</span><h3>Eventi e comunità</h3><p>Appuntamenti, feste e iniziative del paese raccolti in un’unica agenda.</p><a href="#eventi">Guarda gli eventi →</a></article>
        </div>
      </section>

      <section className={styles.events} id="eventi">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Agenda</p>
          <h2>Cosa succede a Roncegno</h2>
        </div>
        <div className={styles.eventList}>
          {events.map((event) => (
            <article key={event.id}>
              <div>
                <span>{new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", timeZone: "Europe/Rome" }).format(new Date(event.start_date))}</span>
                <h3>{event.title}</h3>
              </div>
              <span>{event.location_name ?? event.place?.title ?? "Roncegno Terme"}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.places}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Luoghi</p>
          <h2>Da non perdere.</h2>
        </div>
        <div className={styles.placeGrid}>
          {places.map((place) => (
            <article key={place.id}>
              <div className={styles.placeImage} style={{ backgroundImage: `url('${getDirectusAssetUrl(place.image) ?? "/images/hero/roncegno-hero.jpg"}')` }} />
              <div><small>{place.category?.name ?? place.map_label ?? "Roncegno Terme"}</small><h3>{place.title}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.hubCta}>
        <div><p className={styles.eyebrowLight}>Dietro le quinte</p><h2>Contenuti semplici da gestire.</h2><p>La versione friendly del Content Hub mostra come aggiornare sito, eventi, percorsi e pannelli senza entrare nella complessità tecnica di Directus.</p></div>
        <Link href="/content-hub" className={styles.lightButton}>Apri Content Hub</Link>
      </section>
    </main>
  );
}
