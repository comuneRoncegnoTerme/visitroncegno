import Link from "next/link";
import { connection } from "next/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MuseumGallery from "@/components/museum/MuseumGallery";
import { MuseumEvents, MuseumGettingThere, MuseumVisit } from "@/components/museum/MuseumSections";
import { MuseumStatusBadge } from "@/components/museum/MuseumStatus";
import MuseumSubnav from "@/components/museum/MuseumSubnav";
import museum from "@/components/museum/Museum.module.css";
import { getSiteSettings } from "@/lib/directus";
import { getMuseum, getMuseumEvents, getMuseumNearby, museumJsonLd } from "@/lib/museums";
import { jsonLdString, pageMetadata, SITE_URL } from "@/lib/seo";
import GrainJourney from "./GrainJourney";
import styles from "./page.module.css";

const DESCRIPTION = "Il Mulino Angeli a Marter, Roncegno Terme: un mulino documentato dal 1909 con due sistemi molitori e la Casa Museo degli Spaventapasseri di Flavio Faganello. Orari, visite e come arrivare.";

export const metadata = pageMetadata({
  title: "Mulino Angeli e Casa Museo degli Spaventapasseri",
  description: DESCRIPTION,
  path: "/musei/mulino-angeli",
  image: "/images/musei/mulino-angeli/meccanismi.jpg",
});

const scarecrowPhotos = [
  { src: "/images/musei/mulino-angeli/spaventapasseri-1.jpg", alt: "Uno spaventapasseri seduto al tavolo nella cucina del mugnaio", caption: "Nella casa del mugnaio" },
  { src: "/images/musei/mulino-angeli/spaventapasser-3.jpg", alt: "Spaventapasseri esposti accanto alle fotografie dei campi trentini", caption: "Spaventapasseri e fotografie" },
  { src: "/images/musei/mulino-angeli/meccanismi.jpg", alt: "Le macchine in legno del mulino con uno spaventapasseri in primo piano", caption: "Tra le macchine del mulino" },
  { src: "/images/musei/mulino-angeli/spaventapasser-2.jpg", alt: "L’esterno del Mulino Angeli lungo il canale", caption: "Il mulino lungo il canale" },
  { src: "/images/musei/mulino-angeli/hero.jpg", alt: "Il Mulino Angeli a Marter visto dall’alto", caption: "Il Mulino Angeli a Marter" },
];

export default async function MulinoAngeliPage() {
  await connection();
  const [settings, mulino] = await Promise.all([getSiteSettings(), getMuseum("mulino-angeli")]);
  const [events, nearby] = await Promise.all([getMuseumEvents(mulino), getMuseumNearby(mulino)]);

  const sections = [
    { id: "scopri", label: "Il mulino" },
    { id: "percorso", label: "Il percorso del grano" },
    { id: "spaventapasseri", label: "Spaventapasseri" },
    { id: "visita", label: "Orari e visite" },
    ...(events.length ? [{ id: "eventi", label: "Eventi" }] : []),
    { id: "come-arrivare", label: "Come arrivare" },
  ];

  return (
    <main className={styles.page} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(museumJsonLd(mulino, DESCRIPTION, SITE_URL)) }} />
      <SiteHeader settings={settings} overlay />
      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Marter · Roncegno Terme</p>
          <h1>Mulino<br />Angeli</h1>
          <p>Casa Museo degli Spaventapasseri</p>
          <MuseumStatusBadge hours={mulino.openingHours} className={museum.heroStatus} />
          <div className={museum.heroActions}>
            <a href="#visita" className={museum.heroPrimary}>Orari e visite</a>
            <a href="#percorso" className={museum.heroSecondary}>Entra nel mulino ↓</a>
          </div>
        </div>
      </section>

      <MuseumSubnav title="Mulino Angeli" items={sections} />

      <section className={styles.manifesto} id="scopri">
        <div><h2>Un mulino documentato dal 1909</h2></div>
        <div className={styles.manifestoCopy}>
          <p>Il Mulino Angeli è documentato fin dal 1909 e conserva due sistemi molitori: quello tradizionale a palmenti, destinato al frumento, e un sistema più moderno a cilindri per il mais.</p>
          <p>Nastri convettori e saliscendi attraversano i piani dell’edificio, accompagnando granaglie e farina nelle diverse fasi di lavorazione: spulatura, macinazione, setacciatura e insaccatura.</p>
          <div className={museum.statsLight}>
            <div><strong>1909</strong><span>prime notizie documentate</span></div>
            <div><strong>2</strong><span>sistemi molitori conservati</span></div>
            <div><strong>4</strong><span>fasi della lavorazione</span></div>
          </div>
        </div>
      </section>

      <section className={styles.mechanics} id="percorso">
        <div className={styles.mechanicsImage}><span>Meccanismi del Mulino Angeli</span></div>
        <div className={styles.mechanicsCopy}>
          <h2>Il percorso del grano, piano per piano</h2>
          <p>Scegli il cereale e segui le fasi della lavorazione, dai piani di carico alla farina pronta per essere insaccata.</p>
          <GrainJourney />
        </div>
      </section>

      <section className={styles.scarecrows} id="spaventapasseri">
        <div className={styles.scareCopy}>
          <p className={styles.eyebrowDark}>Casa Museo degli Spaventapasseri</p>
          <h2>Gli spaventapasseri di Flavio Faganello</h2>
          <p>Negli ambienti dell’abitazione del mugnaio è ospitata la collezione di spaventapasseri di Flavio Faganello, fotografo reporter e giornalista trentino. Una raccolta che racconta la campagna trentina da un altro punto di vista.</p>
          <p className={museum.hint}>Tocca una foto per ingrandirla.</p>
        </div>
        <MuseumGallery images={scarecrowPhotos} label="Foto del Mulino Angeli e degli spaventapasseri" />
      </section>

      <MuseumVisit
        museum={mulino}
        intro="Il mulino apre in primavera, estate e autunno. Per gruppi, scuole e visite speciali conviene scrivere o telefonare prima: si concordano data e orario."
      />

      <MuseumEvents events={events} title="Al Mulino Angeli" />

      <MuseumGettingThere
        museum={mulino}
        nearby={nearby}
        lead="Il mulino è a Marter, la frazione di Roncegno Terme nel fondovalle della Valsugana."
      />

      <section className={styles.next}>
        <p>L’altro museo di Roncegno</p>
        <h2>Il Museo degli Strumenti Musicali Popolari</h2>
        <div className={styles.nextActions}>
          <Link href="/musei/museo-della-musica">Museo degli Strumenti Musicali →</Link>
          <Link href="/musei">Tutti e due i musei →</Link>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
