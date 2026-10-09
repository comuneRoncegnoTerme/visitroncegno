import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./page.module.css";
import FestaAtmosphereVideo from "./FestaAtmosphereVideo";
import FestaProgramme, { type ProgrammeDay } from "./FestaProgramme";
import { jsonLdString, pageMetadata, SITE_URL } from "@/lib/seo";

const FESTA_DESCRIPTION = "Programma, sapori, musica e informazioni utili per la Festa della Castagna di Roncegno Terme, dal 23 al 25 ottobre 2026.";
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
  ["01", "Programma", "#programma"],
  ["02", "Come arrivare", "#come-arrivare"],
  ["03", "Dove mangiare", "#sapori"],
  ["04", "Castagneti", "#storie"],
] as const;

const programme = [
  {
    date: "2026-10-23",
    day: "Venerdì 23 ottobre",
    label: "Aspettando la Festa",
    events: [
      ["18:00", "Presentazione GSD Calcio", "Presentazione delle squadre presso il piazzale dei pompieri. Cucina aperta con panini, patatine e castagne. DJ set a cura di Erickloud DJ."],
      ["18:00", "Apericoro", "Cicchetti e musica anni ’70 e ’80. Punto ristoro con arrosticini, patatine e crêpes a cura del Coro S. Osvaldo presso la sede del coro, nella piazzetta sotto il Municipio."],
      ["20:30", "Presentazione del libro", "Presentazione di “Le maestre: piccole storie scolastiche d’altri tempi” di Rosanna Cavallini presso la sala riunioni del Comune di Roncegno Terme."],
    ],
  },
  {
    date: "2026-10-24",
    day: "Sabato 24 ottobre",
    label: "La Festa entra nel vivo",
    events: [
      ["09:00", "Passeggiata sul Sentiero del Castagno", "Escursione con accompagnatori forestali. Prenotazione APT Valsugana: 0461 727700 · info@visitvalsugana.it. Quota €5 adulti, €3 ragazzi fino a 12 anni."],
      ["10:00", "Gli alberi del parco: facciamo l’erbario", "Attività per bambini dai 7 anni a cura di Gabriele Bertacchini, con ritrovo presso la Biblioteca Comunale Vitaliano Modena. Prenotazione obbligatoria: 0461 764387 · biblioteca@comune.roncegnoterme.tn.it."],
      ["10:00–19:00", "Mercatino della Castagna e degli hobbisti", "Bancarelle, prodotti dell’artigianato e dell’agricoltura locale nel centro di Roncegno."],
      ["14:00", "Inaugurazione ufficiale", "Apertura della Festa della Castagna 2026 e taglio della tradizionale Torta Gigante in Piazza A. De Giovanni."],
      ["15:00", "Pentolina pentoletta pentolaccia", "Spettacolo di burattini per famiglie a cura di Luciano Gottardi presso il parco giochi in Piazza Montebello. In caso di maltempo, in teatro."],
      ["16:30", "Forno di comunità", "Inaugurazione del forno di comunità presso il parco giochi di Piazza Montebello."],
      ["18:00", "Apericoro", "Cicchetti e musica anni ’70 e ’80 a cura del Coro S. Osvaldo presso la sede del coro, piazzetta sotto il Municipio."],
      ["20:30", "The Capston", "Concerto rock anni ’70 e ’80 presso il piazzale dei pompieri."],
      ["21:00", "DJ Set Stefano Cenci", "Musica e serata in Piazza Montebello."],
    ],
  },
  {
    date: "2026-10-25",
    day: "Domenica 25 ottobre",
    label: "La domenica della Castagna",
    events: [
      ["09:00", "Passeggiata sul Sentiero del Castagno", "Escursione con accompagnatori forestali. Prenotazione APT Valsugana: 0461 727700 · info@visitvalsugana.it. Quota €5 adulti, €3 ragazzi fino a 12 anni."],
      ["10:00–19:00", "Mercatino della Castagna e degli hobbisti", "Bancarelle, prodotti dell’artigianato e dell’agricoltura locale nel centro di Roncegno."],
      ["13:00", "Musica con i Trifisa", "Musica dal vivo presso il piazzale dei pompieri."],
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
          <p className={styles.kicker}>23–25 ottobre 2026 · Roncegno Terme</p>
          <h1 className={styles.title}>
            <img className={styles.officialLogo} src="/images/festa-castagna/logo-festa-ufficiale.webp" width={1200} height={614} alt="Festa della Castagna 2026 a Roncegno Terme" />
          </h1>
          <p className={styles.lead}>Caldarroste sul fuoco, bancarelle tra gli alberi, musica, famiglie e un paese intero che si ritrova. Tre giorni per vivere l’autunno di Roncegno.</p>
          <div className={styles.heroActions}>
            <a href="#programma" className={styles.primaryButton}>Scopri il programma →</a>
            <a href="#come-arrivare" className={styles.secondaryButton}>Come arrivare →</a>
          </div>
        </div>
        <div className={styles.heroNote}><span>Festa: sabato 24 e domenica 25</span><strong>Aspettando la Festa: venerdì 23</strong></div>
      </section>

      <section className={styles.practical}>
        <div className={styles.practicalIntro}><p className={styles.eyebrow}>Tutto a portata di mano</p><h2>Vivi la festa, senza perderti nulla.</h2></div>
        <div className={styles.practicalGrid}>{practical.map(([number, label, href]) => <a href={href} className={styles.practicalCard} key={label}><span>{number}</span><strong>{label}</strong><b>↗</b></a>)}</div>
      </section>

      <section className={styles.storyIntro} id="atmosfera">
        <div className={styles.storyPhoto} />
        <div className={styles.storyIntroCopy}>
          <p className={styles.eyebrow}>Benvenuti a Roncegno</p>
          <h2>Qui la castagna è una festa di paese, davvero.</h2>
          <p>Sabato 24 e domenica 25 ottobre, dalle 10:00 alle 19:00, il centro si riempie del tradizionale mercatino della castagna e degli hobbisti, con artigianato e prodotti dell’agricoltura locale.</p>
          <p>Per tutto il fine settimana ci saranno intrattenimenti per bambini, gonfiabili, laboratori creativi, musica itinerante, un giardino con animali e punti ristoro con piatti tipici, dolci alla castagna e prodotti locali.</p>
          <p>Ristoranti e agritur del paese proporranno menù a tema e torna anche lo stand gastronomico degli amici di Praga 6, distretto della città ceca gemellato con Roncegno Terme.</p>
        </div>
      </section>

      <FestaAtmosphereVideo />

      <section className={styles.moments}>
        <div className={styles.momentsHeading}>
          <div className={styles.momentsTitle}>
            <p className={styles.eyebrow}>Dentro la Festa</p>
            <h2>Una giornata fatta di piazze, profumi e incontri.</h2>
          </div>
          <p>Le immagini della Festa raccontano meglio di qualsiasi slogan ciò che succede a Roncegno: il paese diventa spazio pubblico, mercato, tavola e luogo d’incontro.</p>
        </div>
        <div className={styles.photoGrid}>
          <figure className={styles.photoTall}>
            <img src="/images/festa-castagna/caldarroste-fuoco-piazza.webp" width={1066} height={1600} loading="lazy" alt="Il fuoco sotto il tamburo delle caldarroste, con la piazza piena di gente sullo sfondo" />
            <figcaption><span>Il fuoco</span><strong>Caldarroste cotte in piazza</strong></figcaption>
          </figure>
          <figure className={styles.photoWide}>
            <img src="/images/festa-castagna/caldarroste-fuoco-cesto.webp" width={1600} height={1066} loading="lazy" alt="Due uomini con il grembiule verde girano le castagne sul fuoco accanto a un cesto di vimini" />
            <figcaption><span>Al braciere</span><strong>Castagne girate a mano, una tostatura dopo l’altra</strong></figcaption>
          </figure>
          <figure className={styles.photoCake}>
            <img src="/images/festa-castagna/festa-casette-albergo-vittoria.webp" width={1600} height={1200} loading="lazy" alt="Le casette di legno delle caldarroste davanti all’Albergo Vittoria, con la piazza affollata" />
            <figcaption><span>In piazza</span><strong>Le casette delle caldarroste e la gente del paese</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.highlights}>
        <div><span>01</span><strong>Mercatino</strong><p>Sabato e domenica, 10:00–19:00.</p></div>
        <div><span>02</span><strong>Torta Gigante</strong><p>Sabato alle 14:00 in Piazza A. De Giovanni.</p></div>
        <div><span>03</span><strong>Sentiero del Castagno</strong><p>Passeggiata guidata sabato e domenica alle 9:00.</p></div>
        <div><span>04</span><strong>Sapori e Praga 6</strong><p>Punti ristoro, menù a tema e lo stand degli amici cechi.</p></div>
      </section>

      <section className={styles.program} id="programma">
        <div className={styles.programTitle}>
          <p className={styles.eyebrowLight}>Programma 2026</p>
          <h2>Tre giorni, un paese intero in festa.</h2>
          <p>Da venerdì sera a domenica, il programma alterna comunità, passeggiate, spettacoli, musica, gastronomia e attività per famiglie.</p>
          <div className={styles.alwaysOn}><strong>Tutti i giorni</strong><p>Servizio navetta gratuito, intrattenimento e laboratori per bambini, giardino con animali, gonfiabili, dolci di castagne, bancarelle e musica itinerante.</p></div>
        </div>
        <FestaProgramme days={programme} />
      </section>

      <section className={styles.flavours} id="sapori">
        <div className={styles.flavourImage} />
        <div className={styles.flavourCopy}>
          <p className={styles.eyebrowLight}>Sapori di Roncegno</p>
          <h2>Il fuoco è parte della festa.</h2>
          <p>Durante la manifestazione saranno disponibili punti di ristoro con piatti tipici, dolci alla castagna e prodotti locali. Ristoranti e agritur di Roncegno Terme proporranno menù a tema per tutto il fine settimana.</p>
          <p>Tra i sapori della festa torna anche lo stand gastronomico degli amici di Praga 6, nel segno del gemellaggio con il Comune di Roncegno Terme.</p>
          <a href="#storie" className={styles.lightButton}>Dai sapori alle storie →</a>
        </div>
      </section>

      <section className={styles.stories} id="storie">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Circuito del Castagno</p><h2>La festa continua lungo i sentieri.</h2><p>La segnaletica già presente nei castagneti collega il paesaggio fisico a testi, audio e approfondimenti digitali. Gli stessi QR accompagnano il visitatore anche dopo la festa.</p></div>
        <div className={styles.storyGrid}>{stories.map(([number, title, href, text]) => <Link href={href} className={styles.storyCard} key={href}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>Apri la storia →</strong></Link>)}</div>
      </section>

      <section className={styles.info} id="come-arrivare">
        <div><p className={styles.eyebrow}>Organizza la visita</p><h2>Arriva, parcheggia, poi dimentica l’auto.</h2></div>
        <div className={styles.infoGrid}>
          <article>
            <span>01</span><h3>Dove</h3>
            <p>Nel centro di Roncegno Terme. Inaugurazione e Torta Gigante in Piazza A. De Giovanni; burattini, forno di comunità e DJ set in Piazza Montebello.</p>
            <div className={styles.mapLinks}>
              <a href={mapsSearch("Piazza A. De Giovanni, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Piazza A. De Giovanni su Maps ↗</a>
              <a href={mapsSearch("Piazza Montebello, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Piazza Montebello su Maps ↗</a>
            </div>
          </article>
          <article>
            <span>02</span><h3>Parcheggi</h3>
            <p>Parcheggi disponibili nei pressi della festa, presso l’oratorio parrocchiale di Roncegno e in via Ferme, arrivando da Borgo Valsugana.</p>
            <div className={styles.mapLinks}>
              <a href={mapsSearch("Oratorio parrocchiale, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Oratorio su Maps ↗</a>
              <a href={mapsSearch("Via Ferme, Roncegno Terme")} target="_blank" rel="noopener noreferrer">Via Ferme su Maps ↗</a>
            </div>
          </article>
          <article><span>03</span><h3>Navetta domenicale</h3><p>Domenica 25 saranno disponibili parcheggi organizzati a 600–800 metri in direzione Marter e Borgo Valsugana, con bus navetta gratuito verso il centro dalle 11:00 alle 18:30.</p></article>
          <article><span>04</span><h3>Accessibilità</h3><p>Parcheggio riservato alle persone con disabilità in prossimità del centro della manifestazione.</p></article>
        </div>
        <div className={styles.contactBox}><span>Informazioni</span><strong>Comune di Roncegno Terme</strong><a href="tel:+390461764061">0461 764061</a><a href="mailto:comunicazione@comune.roncegnoterme.tn.it">comunicazione@comune.roncegnoterme.tn.it</a></div>
      </section>

      <section className={styles.cta}><div><p className={styles.eyebrowLight}>Visit Roncegno</p><h2>Portati a casa qualcosa di più di un sacchetto di castagne.</h2><p>Scopri i luoghi, i percorsi e le storie che fanno di Roncegno un territorio da vivere tutto l’anno.</p></div><Link href="/" className={styles.lightButton}>Esplora Roncegno →</Link></section>
      <SiteFooter settings={siteSettings} />
    </main>
  );
}
