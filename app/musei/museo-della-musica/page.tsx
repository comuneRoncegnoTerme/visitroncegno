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
import VisitChooser from "./VisitChooser";
import styles from "./page.module.css";

const DESCRIPTION = "Il Museo degli Strumenti Musicali Popolari di Roncegno Terme: circa mille strumenti da tutto il mondo, visite guidate in cui si possono provare e il Parco Musicale. Orari, visite e come arrivare.";

export const metadata = pageMetadata({
  title: "Museo degli Strumenti Musicali Popolari",
  description: DESCRIPTION,
  path: "/musei/museo-della-musica",
  image: "/images/musei/museo-della-musica/strumenti.jpg",
});

const collectionPhotos = [
  { src: "/images/musei/museo-della-musica/strumenti.jpg", alt: "Mandolini, cetre e tamburelli esposti su una credenza e alle pareti", caption: "Una sala della collezione" },
  { src: "/images/musei/museo-della-musica/gioiello-1.jpg", alt: "Uno strumento a corde dalla cassa decorata a intarsio", caption: "Corde e intarsi" },
  { src: "/images/musei/museo-della-musica/gioiello-2.jpg", alt: "Un pianoforte a coda e un contrabbasso nella sala con le pareti dipinte", caption: "La sala del pianoforte" },
  { src: "/images/musei/museo-della-musica/parco-musicale.jpg", alt: "Uno strumento a vento appeso a un albero del parco, con vista su Roncegno", caption: "Nel Parco Musicale" },
  { src: "/images/musei/museo-della-musica/hero.jpg", alt: "La chiesetta di Santa Brigida e l’edificio del museo sopra Roncegno", caption: "Santa Brigida" },
];

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default async function MusicMuseumPage() {
  await connection();
  const [settings, musica] = await Promise.all([getSiteSettings(), getMuseum("museo-della-musica")]);
  const [events, nearby] = await Promise.all([getMuseumEvents(musica), getMuseumNearby(musica)]);
  const bookingHref = musica.bookingUrl ?? (musica.phones[0] ? telHref(musica.phones[0]) : musica.email ? `mailto:${musica.email}` : null);

  const sections = [
    { id: "scopri", label: "Il museo" },
    { id: "collezione", label: "La collezione" },
    { id: "parco", label: "Parco Musicale" },
    { id: "visita", label: "Orari e visite" },
    ...(events.length ? [{ id: "eventi", label: "Eventi" }] : []),
    { id: "come-arrivare", label: "Come arrivare" },
  ];

  return (
    <main className={styles.page} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(museumJsonLd(musica, DESCRIPTION, SITE_URL)) }} />
      <SiteHeader settings={settings} overlay />

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Santa Brigida · Roncegno Terme</p>
          <h1>Museo degli Strumenti<br />Musicali Popolari</h1>
          <p className={styles.heroLead}>Un museo da vedere e da suonare.</p>
          <MuseumStatusBadge hours={musica.openingHours} className={museum.heroStatus} />
          <div className={museum.heroActions}>
            <a href="#visita" className={museum.heroPrimary}>Orari e visite</a>
            <a href="#scopri" className={museum.heroSecondary}>Entra nel museo ↓</a>
          </div>
        </div>
      </section>

      <MuseumSubnav title="Museo degli Strumenti Musicali" items={sections} />

      <section className={styles.manifesto} id="scopri">
        <div>
          <p className={styles.eyebrowDark}>Un giro del mondo attraverso il suono</p>
          <h2>Circa mille strumenti<br />da cinque continenti</h2>
        </div>
        <div className={styles.manifestoCopy}>
          <p>Il Museo degli Strumenti Musicali Popolari raccoglie strumenti provenienti da culture diverse e costruisce un itinerario che unisce musica, arte, storia e geografia dei popoli.</p>
          <p>La visita può essere autonoma oppure guidata. Su prenotazione, il percorso diventa interattivo: alcuni strumenti possono essere provati direttamente dai visitatori.</p>
        </div>
      </section>

      <section className={styles.experience}>
        <div className={styles.experienceVisual}><span>La collezione degli strumenti</span></div>
        <div className={styles.experienceCopy}>
          <h2>Come vuoi visitarlo?</h2>
          <p>Il valore distintivo del percorso è il contatto diretto con il suono: con la guida ci si avvicina agli strumenti, se ne capisce la funzione e se ne provano alcuni in prima persona.</p>
          <VisitChooser bookingHref={bookingHref} />
          <div className={styles.stats}>
            <div><strong>~1000</strong><span>strumenti musicali popolari esposti</span></div>
            <div><strong>5</strong><span>continenti raccontati</span></div>
            <div><strong>1</strong><span>percorso pensato anche per famiglie e scuole</span></div>
          </div>
        </div>
      </section>

      <section className={styles.jewels} id="collezione">
        <div className={styles.jewelsCopy}>
          <h2>Alcuni pezzi della collezione</h2>
          <p>Tra gli strumenti segnalati dal museo figurano un harmonium francese della metà dell’Ottocento, un setar dell’Azerbaijan e un fortepiano del 1848. La collezione comprende anche un nucleo librario musicale con testi sacri dell’Ottocento e del primo Novecento.</p>
          <p className={museum.hint}>Tocca una foto per ingrandirla.</p>
        </div>
        <MuseumGallery images={collectionPhotos} label="Foto del Museo degli Strumenti Musicali Popolari" />
      </section>

      <section className={styles.park} id="parco">
        <div className={styles.parkCopy}>
          <h2>Il Parco Musicale</h2>
          <p>Accanto al museo, cinque aree verdi compongono un itinerario tra suoni della natura, strumenti e paesaggio: frutteto, giardino musicale, giardino fiorito, erbe aromatiche e roseto.</p>
        </div>
        <div className={styles.parkSide}>
          <div className={styles.parkVisual} aria-hidden="true" />
          <ol className={styles.parkList} aria-label="Le cinque aree del parco">
            <li>Frutteto</li><li>Giardino musicale</li><li>Giardino fiorito</li><li>Erbe aromatiche</li><li>Roseto</li>
          </ol>
        </div>
      </section>

      <MuseumVisit
        museum={musica}
        intro="Il museo pubblica calendari periodici e in inverno apre su prenotazione. Per le visite guidate, i gruppi e le scuole conviene contattarlo prima."
      />

      <MuseumEvents events={events} title="Al Museo degli Strumenti Musicali" />

      <MuseumGettingThere
        museum={musica}
        nearby={nearby}
        lead="Il museo è a Santa Brigida, accanto alla chiesetta, poco sopra il centro di Roncegno Terme."
      />

      <section className={styles.next}>
        <p>L’altro museo di Roncegno</p>
        <h2>Il Mulino Angeli, a Marter</h2>
        <div className={styles.nextActions}>
          <Link href="/musei/mulino-angeli">Mulino Angeli →</Link>
          <Link href="/musei">Tutti e due i musei →</Link>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
