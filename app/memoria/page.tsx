import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import { memoriaArchiveUrl } from "@/lib/memoria-archive";
import styles from "./page.module.css";

// Rigenerata periodicamente: legge MEMORIA_ARCHIVE_URL dall'ambiente di esecuzione, non da quello di build.
export const revalidate = 300;

export const metadata = {
  title: "Memoria · Na vòlta a Ronzégno",
  description:
    "Fotografie, testimonianze e manoscritti del Progetto Memoria Na vòlta a Ronzégno.",
  alternates: { canonical: "/memoria" },
};

const archiveSections = [
  { number: "01", title: "Paesaggio", image: "/images/memoria/paesaggio.jpg", path: "/it/memoria/paesaggio" },
  { number: "02", title: "Edifici", image: "/images/memoria/edifici.jpg", path: "/it/memoria/edifici" },
  { number: "03", title: "Persone", image: "/images/memoria/persone.jpg", path: "/it/memoria/persone" },
  { number: "04", title: "Eventi e tradizioni", image: "/images/memoria/eventi-tradizioni.jpg", path: "/it/memoria/eventi-e-tradizioni" },
  { number: "05", title: "Attività tipiche", image: "/images/memoria/attivita-tipiche.jpg", path: "/it/memoria/tivor" },
  { number: "06", title: "Lettere e manoscritti", image: "/images/memoria/lettere-manoscritti.jpg", path: "/it/memoria/lettere-e-manoscritti" },
];

export default async function MemoryPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} overlay />

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Progetto Memoria · Roncegno Terme</p>
          <h1>Na vòlta<br />a Ronzégno</h1>
          <p>Fotografie, testimonianze e manoscritti raccolti dal Progetto Memoria, nato nel 2022.</p>
          <a className={styles.scrollLink} href="#progetto">Il progetto <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className={styles.intro} id="progetto">
        <div className={styles.introGrid}>
          <h2>Il progetto</h2>
          <div>
            <p>Il Progetto Memoria “Na vòlta a Ronzégno” nasce nel novembre 2022 dalla volontà di un gruppo di giovani di conservare la memoria collettiva e rafforzare il senso di comunità.</p>
            <p>Nel 2024, grazie al bando “Turismo delle Radici”, il progetto ha proposto 22 incontri dedicati alla condivisione di storie, informazioni, fotografie e manoscritti. Questa pagina apre una porta sul patrimonio raccolto.</p>
          </div>
        </div>
      </section>

      <section className={styles.archive} aria-labelledby="archivio-title">
        <div className={styles.archiveHeading}>
          <div><h2 id="archivio-title">L’archivio</h2></div>
          <p>Sei sezioni: paesaggi, volti, mestieri, edifici e parole. Ogni sezione si apre sul sito dell’archivio storico.</p>
        </div>
        <div className={styles.archiveGrid}>
          {archiveSections.map((section) => (
            <a className={styles.archiveCard} href={memoriaArchiveUrl(section.path)} key={section.title}>
              <span className={styles.cardImage} style={{ backgroundImage: `url('${section.image}')` }} />
              <span className={styles.cardShade} />
              <span className={styles.cardTitle}>{section.title}</span>
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <h2>Storia per immagini</h2>
        <div className={styles.closingActions}>
          <a href={memoriaArchiveUrl("/it/memoria/storia-per-immagini")}>Sfoglia la storia per immagini <span aria-hidden="true">→</span></a>
          <a href={memoriaArchiveUrl("/it/memoria/progetto-memoria-na-volt")}>Le pubblicazioni <span aria-hidden="true">→</span></a>
        </div>
        <Link className={styles.homeLink} href="/">Torna a Visit Roncegno</Link>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
