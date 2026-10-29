import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import { getStoryBySlug } from "@/lib/stories";
import styles from "@/components/GuidePage.module.css";

export const metadata: Metadata = {
  title: "Scopri Roncegno",
  description: "La storia di Roncegno Terme: la Via Claudia Augusta, le miniere e i masi, l’acqua ferruginosa e le terme, la pala del Guardi, le chiese e i luoghi da non perdere.",
  alternates: { canonical: "/scopri-roncegno" },
};

type Href = string | null;
type ChapterLink = { label: string; href: Href };

function Links({ items }: { items: ChapterLink[] }) {
  const available = items.filter((item): item is { label: string; href: string } => Boolean(item.href));
  if (!available.length) return null;
  return (
    <div className={styles.links}>
      {available.map((item) => <Link className={styles.textLink} href={item.href} key={item.label}>{item.label} →</Link>)}
    </div>
  );
}

// Testi dall'opuscolo InfoRoncegno 2026 ("Alla scoperta di Roncegno"), accorciati per il web.
export default async function ScopriRoncegnoPage() {
  await connection();
  const [settings, places, routes, waterStory, artStory, churchesStory] = await Promise.all([
    getSiteSettings(),
    getEditorialList("places"),
    getEditorialList("routes"),
    getStoryBySlug("acqua-ferruginosa-arsenicale").catch(() => null),
    getStoryBySlug("arte-guardi-soffici").catch(() => null),
    getStoryBySlug("chiese-di-roncegno").catch(() => null),
  ]);
  // Collegamenti solo verso schede pubblicate in Directus.
  const placesBySlug = new Map(places.map((place) => [place.slug, place]));
  const place = (slug: string): Href => {
    const item = placesBySlug.get(slug);
    return item ? placeHref(item) : null;
  };
  const route = (slug: string): Href => (routes.some((item) => item.slug === slug) ? `/percorsi/${slug}` : null);
  const story = (item: { slug: string } | null): Href => (item ? `/storie/${item.slug}` : null);

  const mustSee = [
    {
      title: "Mulino Angeli",
      label: "Museo · Marter",
      text: "La Casa degli Spaventapasseri nell’ex mulino: gli spaventapasseri raccolti da Flavio Faganello e le macine mosse dall’acqua del Brenta.",
      image: "/images/inforoncegno/mulino-angeli.jpg",
      href: "/musei/mulino-angeli",
    },
    {
      title: "Museo degli Strumenti Musicali Popolari",
      label: "Museo · Santa Brigida",
      text: "Nell’ex canonica di Santa Brigida, strumenti da tutti e cinque i continenti e un parco musicale in cinque aree tematiche.",
      image: "/images/inforoncegno/santa-brigida.jpg",
      href: "/musei/museo-della-musica",
    },
    {
      title: "Panchina Gigante",
      label: "Natura · Trenca, 1.700 m",
      text: "A dieci minuti a piedi da Malga Trenca, con un ampio panorama sulla Valsugana.",
      image: "/images/inforoncegno/panchina-gigante.jpg",
      href: place("panchina-gigante"),
    },
    {
      title: "Casa Raphael e il parco",
      label: "Terme",
      text: "Il palazzo delle terme, dove oggi si pratica la medicina antroposofica, e il parco secolare di fine Ottocento.",
      image: "/images/inforoncegno/parco-delle-terme.jpg",
      href: place("casa-di-salute-raphael-parco-terme"),
    },
    {
      title: "Centralina idroelettrica",
      label: "Storia · 1893",
      text: "Una delle prime centraline del Trentino: dava corrente alle terme e al paese con l’acqua del Larganza e del Larganzola.",
      image: null,
      href: place("centralina-idroelettrica"),
    },
    {
      title: "Strada del Castagno",
      label: "Percorso",
      text: "Tra i castagneti del versante sud, da Roncegno a Castel Ivano, con le tabelle sulla storia dei masi.",
      image: "/images/inforoncegno/strada-del-castagno.jpg",
      href: route("strada-del-castagno"),
    },
  ];

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.hero}>
        <div>
          <h1>Scopri Roncegno</h1>
          <p className={styles.lead}>
            Nel cuore della Valsugana, ai piedi del monte Fravort: il centro termale che per oltre un secolo ospitò
            l’aristocrazia europea, la frazione di Marter e la montagna dei masi.
          </p>
          <nav className={styles.jumpNav} aria-label="Capitoli">
            <a href="#radici">Le radici</a>
            <a href="#acqua">L’acqua e le terme</a>
            <a href="#arte">Arte</a>
            <a href="#chiese">Le chiese</a>
            <a href="#da-non-perdere">Da non perdere</a>
          </nav>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.heroImage} src="/images/inforoncegno/roncegno-dall-alto.jpg" alt="Roncegno Terme dall’alto, con la Valsugana e le montagne" />
      </section>

      <section className={`${styles.section} ${styles.chapter}`} id="radici">
        <div className={styles.chapterText}>
          <p className={styles.kicker}>Le radici della storia</p>
          <h2>Strade romane, miniere e masi</h2>
          <p>
            Di qui passava la Via Claudia Augusta Altinate, la grande strada romana tra nord e sud Europa: a Marter se ne
            calpestano ancora i resti, accanto alla Tor Tonda.
          </p>
          <p>
            Dal XII secolo la montagna è terra di miniere: a Cinque Valli e lungo il Rio Argento affiorano ancora i resti
            di forni e le scorie di fusione. Nel tardo Medioevo minatori e contadini dall’Alta Baviera hanno disegnato il
            paesaggio di masi sparsi e vie selciate, come la Strada del Castagno che porta a Castel Ivano.
          </p>
          <Links items={[
            { label: "Marter", href: place("marter") },
            { label: "Cinque Valli", href: place("cinque-valli") },
            { label: "Strada del Castagno", href: route("strada-del-castagno") },
            { label: "I pannelli dei masi", href: "/it/sentieri/maso-roneri-5-1" },
          ]} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/centro-di-roncegno.jpg" alt="Una via del centro di Roncegno con le case colorate" loading="lazy" />
      </section>

      <section className={`${styles.section} ${styles.chapter} ${styles.chapterReverse}`} id="acqua">
        <div className={styles.chapterText}>
          <p className={styles.kicker}>L’acqua e le terme</p>
          <h2>L’acqua ferruginosa arsenicale</h2>
          <p>
            Tutto comincia nel 1857 nella Valle del Diavolo, sul monte Tesobbo: un contadino nota un rigagnolo d’acqua
            rossastra, amara come l’arsenico. Il dottor Achille De Giovanni, oggi ricordato in piazza, ne studia le
            proprietà curative e pensa a un albergo dove bere quell’acqua e fare bagni terapeutici.
          </p>
          <p>
            Dal 1873, con i fratelli Waiz, Roncegno diventa un celebre centro di cura frequentato da tutta Europa. La Grande
            Guerra distrugge quasi tutto; la sorgente, già in esaurimento, si perde con il terremoto del Friuli del 1976.
            L’eredità vive oggi a Casa Raphael, con la medicina antroposofica.
          </p>
          <Links items={[
            { label: "La storia completa", href: story(waterStory) },
            { label: "Le Fonti", href: "/it/sentieri/le-fonti-2-1" },
            { label: "Storia delle terme", href: "/it/sentieri/storia-terme-roncegno-6" },
            { label: "Casa Raphael e il parco", href: place("casa-di-salute-raphael-parco-terme") },
          ]} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/le-fonti.jpg" alt="Gli edifici in pietra della località Fonti nel bosco" loading="lazy" />
      </section>

      <section className={`${styles.section} ${styles.chapter}`} id="arte">
        <div className={styles.chapterText}>
          <p className={styles.kicker}>Arte</p>
          <h2>Il Guardi e Soffici</h2>
          <p>
            Nella chiesa dei Santi Pietro e Paolo si conserva <em>La Santissima Trinità appare ai santi Pietro e Paolo</em>,
            dipinta nel 1779 per Roncegno da Francesco Guardi, le cui vedute sono esposte dalla National Gallery di
            Washington all’Alte Pinakothek di Monaco.
          </p>
          <p>
            Di Ardengo Soffici è l’<em>Incontro di Dante e Beatrice</em> (1906): faceva parte di un ciclo commissionato dai
            fratelli Waiz, quasi interamente distrutto nella Grande Guerra.
          </p>
          <Links items={[
            { label: "Chiesa dei Santi Pietro e Paolo", href: place("chiesa-santi-pietro-e-paolo") },
            { label: "Le opere", href: story(artStory) },
          ]} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/chiesa-santi-pietro-e-paolo.jpg" alt="Il campanile della chiesa dei Santi Pietro e Paolo sopra le case di Roncegno" loading="lazy" />
      </section>

      <section className={`${styles.section} ${styles.chapter} ${styles.chapterReverse}`} id="chiese">
        <div className={styles.chapterText}>
          <p className={styles.kicker}>Fede e tradizione</p>
          <h2>Le chiese</h2>
          <p>
            Chiese e capitelli di epoche diverse: a Marter San Silvestro e Santa Margherita, in paese i Santi Pietro e
            Paolo e San Giuseppe. Sulla montagna Santa Brigida, citata già nel 1576 e oggi sede del Museo degli Strumenti
            Musicali, la Madonna del Carmelo, la Sacra Famiglia, San Nicolò, Sant’Anna, San Biagio, Sant’Osvaldo e Santa
            Maria Assunta di Serot.
          </p>
          <Links items={[
            { label: "Santa Brigida", href: place("chiesetta-santa-brigida") },
            { label: "San Nicolò", href: place("chiesetta-san-nicolo") },
            { label: "Sant’Osvaldo", href: place("chiesetta-sant-osvaldo") },
            { label: "Tutte le chiese", href: story(churchesStory) },
          ]} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/chiesetta-di-montagna.jpg" alt="Una chiesetta in pietra sulla montagna di Roncegno" loading="lazy" />
      </section>

      <section className={styles.section} id="da-non-perdere">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Luoghi</p>
            <h2>Da non perdere</h2>
          </div>
          <p>Musei, terme, panorami e storia: i luoghi che l’opuscolo InfoRoncegno consiglia di vedere.</p>
        </div>
        <div className={styles.cards}>
          {mustSee.map((item) => {
            const body = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.image && <img className={styles.cardImage} src={item.image} alt="" loading="lazy" />}
                <div className={styles.cardCopy}>
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </>
            );
            return item.href
              ? <Link className={styles.card} href={item.href} key={item.title}>{body}</Link>
              : <article className={styles.card} key={item.title}>{body}</article>;
          })}
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
