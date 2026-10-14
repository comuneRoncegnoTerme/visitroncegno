import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";
import FestaAtmosphereVideo from "./FestaAtmosphereVideo";
import FestaProgramme, { type ProgrammeDay } from "./FestaProgramme";
import FestaMap, { type FestaPoint } from "./FestaMap";
import FestaNow from "./FestaNow";
import FestaWeather from "./FestaWeather";
import FestaThenNow from "./FestaThenNow";
import festaMap from "@/data/festa-mappa.json";
import { jsonLdString, pageMetadata, SITE_URL } from "@/lib/seo";

const FESTA_DESCRIPTION = "Programma, musica, laboratori e informazioni utili per la 46ª Festa della Castagna di Roncegno Terme: sabato 24 e domenica 25 ottobre 2026, con le anteprime di venerdì 23.";
const FESTA_OG_IMAGE = "/images/og/festa-della-castagna.jpg";

export const metadata: Metadata = pageMetadata({
  title: "Festa della Castagna 2026",
  description: FESTA_DESCRIPTION,
  path: "/festa-della-castagna",
  image: FESTA_OG_IMAGE,
});

// Dati strutturati schema.org/Event: solo informazioni già presenti nella pagina.
const festaJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Festa della Castagna 2026",
  description: FESTA_DESCRIPTION,
  startDate: "2026-10-23",
  endDate: "2026-10-25",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: `${SITE_URL}/festa-della-castagna`,
  image: [`${SITE_URL}${FESTA_OG_IMAGE}`],
  location: {
    "@type": "Place",
    name: "Roncegno Terme",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Roncegno Terme",
      addressRegion: "TN",
      addressCountry: "IT",
    },
  },
};

const stories = [
  ["01", "Il castagno nella storia", "/it/sentieri/il-castagno-nella-storia-3-1", "Una storia lunga secoli, intrecciata alla vita quotidiana e al paesaggio di Roncegno."],
  ["02", "Aspetti botanici", "/it/sentieri/aspetti-botanici-3-2", "Foglie, fiori, frutti e caratteristiche dell’albero che ha segnato questi versanti."],
  ["03", "Utilizzo delle castagne", "/it/sentieri/utilizzo-delle-castagne-3-3", "Raccolta, cucina, conservazione e saperi tramandati dalla comunità."],
  ["04", "Conservazione dei castagneti", "/it/sentieri/conservazione-castagneti-3-4", "Cura del paesaggio, biodiversità e futuro di un patrimonio ancora vivo."],
] as const;

const practical = [
  ["Programma", "#programma"],
  ["Mappa", "#mappa"],
  ["Cosa si mangia", "#sapori"],
  ["Castagneti", "#storie"],
  ["Come arrivare", "#come-arrivare"],
] as const;

const programme = [
  {
    date: "2026-10-23",
    day: "Venerdì 23 ottobre",
    label: "Aspettando la Festa",
    events: [
      ["10:00–17:00", "Scultori del legno: le leggende di Roncegno", "Piazzale di Villa Waiz."],
      ["18:00", "Presentazione del libro", "“Vocabolario della parlata dialettale di Stivor”, a cura dell’associazione Stivor ETS. Sala Camino, Casa Raphael."],
      ["18:00", "Apericoro", "Cicchetti in compagnia di Juri e della sua musica nella piazzetta del coro. Punto ristoro con arrosticini, patatine e crêpes a cura del Coro S. Osvaldo nel piazzale del Municipio.", "events-31"],
      ["18:30", "Presentazione delle squadre del GSD Roncegno", "Le squadre e lo staff tecnico del GSD Roncegno calcio.", "events-30"],
      ["20:30", "GlockenThurm in concerto", "Piazzale dei Vigili del Fuoco."],
      ["20:30", "Concerto dei Valsugana Singers", "Salone delle Feste, Casa Raphael."],
    ],
  },
  {
    date: "2026-10-24",
    day: "Sabato 24 ottobre",
    label: "La Festa entra nel vivo",
    events: [
      ["09:30", "Passeggiata tra i castagni", "Partenza dal Municipio. Percorso accompagnato dai custodi forestali e dagli accompagnatori di media montagna. Durata 2 ore.", "events-33"],
      ["10:00–17:00", "Scultori del legno: le leggende di Roncegno", "Piazzale di Villa Waiz."],
      ["10:00–18:30", "Il Bosco Incantato", "Laboratorio e caccia al tesoro a cura di Studio Irydea. Parco delle Terme."],
      ["13:30–17:30", "Musica con i Trifisa", "Piazzale dei Vigili del Fuoco.", "events-29"],
      ["14:00", "Inaugurazione della Festa", "Taglio della Torta Gigante al Parco delle Terme."],
      ["14:00–18:00", "Animazione e spettacoli per bambini", "Con AniMacri. Parco delle Terme."],
      ["14:30", "Il bambino amico dei ricci", "Una favola sulle castagne per famiglie, con Giuliano e Dante Libero Comin. Parco giochi sopra Piazza Montebello."],
      ["15:00", "Prova lo strumento", "A cura della Banda Civica Lagorai. Parco giochi sopra Piazza Montebello."],
      ["18:00", "Apericoro", "Cicchetti in compagnia del Duo Euphonia nella piazzetta del coro. Punto ristoro con arrosticini, patatine e crêpes a cura del Coro S. Osvaldo nel piazzale del Municipio.", "events-31"],
      ["20:30", "The Capston", "Rock anni ’70 e ’80. Piazzale dei Vigili del Fuoco.", "events-36"],
      ["21:00", "DJ set Stefano Cenci", "Piazza Montebello.", "events-37"],
      ["22:30", "DJ set ErickLoud", "Piazzale dei Vigili del Fuoco."],
    ],
  },
  {
    date: "2026-10-25",
    day: "Domenica 25 ottobre",
    label: "La domenica della Castagna",
    events: [
      ["09:30", "Passeggiata tra i castagni", "Partenza dal Municipio. Percorso accompagnato dai custodi forestali e dagli accompagnatori di media montagna. Durata 2 ore.", "events-33"],
      ["10:00–17:00", "Scultori del legno: le leggende di Roncegno", "Piazzale di Villa Waiz."],
      ["10:00–18:30", "Il Bosco Incantato", "Laboratorio e caccia al tesoro a cura di Studio Irydea. Parco delle Terme."],
      ["11:30–13:00", "Scorribanda dei Piccoli Grandi Violinisti", "Musica classica e folk per tutte le età, itinerante per le vie del centro e nel Parco delle Terme."],
      ["12:00–17:00", "Giro in elicottero", "Nella zona del piazzale dei Vigili del Fuoco."],
      ["13:00–17:30", "Musica con i Trifisa", "Piazzale dei Vigili del Fuoco.", "events-29"],
      ["14:00–18:00", "Animazione e spettacoli per bambini", "Con AniMacri. Parco delle Terme."],
    ],
  },
] as const satisfies readonly ProgrammeDay[];

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default async function FestaDellaCastagnaPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={siteSettings} overlay />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(festaJsonLd) }} />

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>46ª edizione · 24 e 25 ottobre 2026 · Roncegno Terme</p>
          <h1 className={styles.title}>
            <img className={styles.officialLogo} src="/images/festa-castagna/logo-festa-ufficiale.webp" width={1200} height={614} alt="Festa della Castagna 2026 a Roncegno Terme" />
          </h1>
          <p className={styles.lead}>Caldarroste sul fuoco, bancarelle, musica e il paese che si ritrova in piazza. Sabato e domenica dalle 9:00, con le anteprime di venerdì.</p>
          <div className={styles.heroActions}>
            <a href="#programma" className={styles.primaryButton}>Il programma</a>
            <a href="#come-arrivare" className={styles.secondaryButton}>Come arrivare</a>
          </div>
          <FestaNow days={programme} />
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="In questa pagina">
        {practical.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
      </nav>

      <FestaWeather />

      <section className={styles.storyIntro} id="atmosfera">
        <div className={styles.storyPhoto} />
        <div className={styles.storyIntroCopy}>
          <h2>Una festa di paese</h2>
          <p>Sabato 24 e domenica 25 ottobre, dalle 9:00, Roncegno si riempie di bancarelle, dolci di castagne e stand gastronomici. La novità di quest’anno: lo spazio famiglie e il mercatino si spostano al Parco delle Terme.</p>
          <p>Per tutto il fine settimana ci sono il Bosco Incantato, con laboratorio e caccia al tesoro, l’animazione per bambini al Parco delle Terme, gli scultori del legno a Villa Waiz e la musica dei Trifisa.</p>
          <p>Ci sono le escursioni tra i castagni con i custodi forestali, la musica nei piazzali e, la domenica, anche il giro in elicottero.</p>
        </div>
      </section>

      <FestaAtmosphereVideo />

      <section className={styles.moments}>
        <div className={styles.momentsHeading}>
          <div className={styles.momentsTitle}>
            <h2>Com’è la festa</h2>
          </div>
          <p>Sabato e domenica il centro del paese diventa mercato, cucina e luogo d’incontro.</p>
        </div>
        <div className={styles.photoGrid}>
          <figure className={styles.photoTall}>
            <img src="/images/festa-castagna/caldarroste-fuoco-piazza.webp" width={1066} height={1600} loading="lazy" alt="Il fuoco sotto il tamburo delle caldarroste, con la piazza piena di gente sullo sfondo" />
            <figcaption><span>Il fuoco</span><strong>Caldarroste cotte in piazza</strong></figcaption>
          </figure>
          <figure className={styles.photoWide}>
            <img src="/images/festa-castagna/festa-folla-centro.webp" width={1600} height={1066} loading="lazy" alt="La folla della Festa nel centro di Roncegno, davanti all’Hotel Semiramis" />
            <figcaption><span>In centro</span><strong>Il centro del paese pieno di gente</strong></figcaption>
          </figure>
          <figure className={styles.photoCake}>
            <img src="/images/festa-castagna/festa-casette-albergo-vittoria.webp" width={1600} height={1200} loading="lazy" alt="Le casette di legno delle caldarroste davanti all’Albergo Vittoria, con la piazza affollata" />
            <figcaption><span>In piazza</span><strong>Le casette delle caldarroste e la gente del paese</strong></figcaption>
          </figure>
        </div>
        <figure className={styles.photoBanner}>
          <img src="/images/festa-castagna/caldarroste-pronte.webp" width={1197} height={1600} loading="lazy" alt="Le caldarroste appena cotte scendono dal bordo del tamburo" />
          <figcaption><span>Pronte</span><strong>Le caldarroste appena tolte dal fuoco</strong></figcaption>
        </figure>
      </section>

      <section className={styles.program} id="programma">
        <div className={styles.programTitle}>
          <p className={styles.eyebrowLight}>Programma 2026</p>
          <h2>Il programma, giorno per giorno</h2>
          <p>Da venerdì sera a domenica: passeggiate, spettacoli, musica, cucina e attività per bambini.</p>
          <div className={styles.alwaysOn}><strong>Sabato e domenica, dalle 9:00</strong><p>Spazio famiglie e mercatino al Parco delle Terme, escursione tra i castagni, bancarelle, dolci di castagne, laboratori per bambini e stand gastronomici.</p></div>
        </div>
        <FestaProgramme days={programme} />
      </section>

      <section className={styles.festaMap} id="mappa" aria-labelledby="mappa-title">
        <div className={styles.festaMapHeading}>
          <h2 id="mappa-title">Mappa della festa</h2>
          <p>Scegli una categoria per vedere dove mangiare, dove si suona, dove parcheggiare e dove prendere la navetta. Ogni stand ha il suo menù.</p>
        </div>
        <FestaMap points={festaMap.points as FestaPoint[]} />
      </section>

      <section className={styles.flavours} id="sapori">
        <div className={styles.flavourImage} />
        <div className={styles.flavourCopy}>
          <h2>Cosa si mangia</h2>
          <p>Caldarroste, dolci di castagne e stand gastronomici per tutto il fine settimana. Venerdì e sabato sera c’è anche il punto ristoro del Coro S. Osvaldo, con arrosticini, patatine e crêpes nel piazzale del Municipio.</p>
          <a href="#storie" className={styles.lightButton}>Il Circuito del Castagno</a>
        </div>
      </section>

      <section className={styles.stories} id="storie">
        <div className={styles.storiesHeading}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>Circuito del Castagno</p><h2>I castagneti intorno al paese</h2><p>Prima delle caldarroste in piazza ci sono i castagneti: un paesaggio curato da generazioni, che il Circuito del Castagno racconta in quattro tappe.</p></div>
          <div className={styles.vintagePhoto}><FestaThenNow /></div>
        </div>
        <div className={styles.storyGrid}>{stories.map(([number, title, href, text]) => <Link href={href} className={styles.storyCard} key={href}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>Apri la storia →</strong></Link>)}</div>
      </section>

      <section className={styles.info} id="come-arrivare">
        <div><h2>Come arrivare e dove parcheggiare</h2></div>
        <div className={styles.infoGrid}>
          <article>
            <h3>Dove</h3>
            <p>Nel centro di Roncegno Terme e al Parco delle Terme, dove ci sono lo spazio famiglie, il mercatino e l’inaugurazione con la Torta Gigante. Concerti al piazzale dei Vigili del Fuoco, DJ set in Piazza Montebello.</p>
            <div className={styles.mapLinks}>
              <a href={mapsSearch("Parco delle Terme, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Parco delle Terme su Maps ↗</a>
              <a href={mapsSearch("Piazza Montebello, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Piazza Montebello su Maps ↗</a>
            </div>
          </article>
          <article>
            <h3>Parcheggi</h3>
            <p>Parcheggi disponibili nei pressi della festa, presso l’oratorio parrocchiale di Roncegno e in via Ferme, arrivando da Borgo Valsugana.</p>
            <div className={styles.mapLinks}>
              <a href={mapsSearch("Oratorio parrocchiale, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Oratorio su Maps ↗</a>
              <a href={mapsSearch("Via Ferme, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Via Ferme su Maps ↗</a>
            </div>
          </article>
          <article><h3>Navetta domenicale</h3><p>Domenica 25 saranno disponibili parcheggi organizzati a 600–800 metri in direzione Marter e Borgo Valsugana, con bus navetta gratuito verso il centro dalle 11:00 alle 18:30.</p></article>
          <article><h3>Accessibilità</h3><p>Parcheggio riservato alle persone con disabilità in prossimità del centro della manifestazione.</p></article>
        </div>
        <div className={styles.contactBox}><span>Informazioni</span><strong>Comune di Roncegno Terme</strong><a href="tel:+390461764061">0461 764061</a><a href="mailto:comunicazione@comune.roncegnoterme.tn.it">comunicazione@comune.roncegnoterme.tn.it</a></div>
      </section>

      <section className={styles.cta}><div><h2>Roncegno tutto l’anno</h2><p>Sentieri, musei, terme e i posti dove mangiare e dormire, tutto l’anno.</p></div><Link href="/" className={styles.lightButton}>Torna alla home</Link></section>
      <SiteFooter settings={siteSettings} />
    </main>
  );
}
