import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrailPanel, trailPanels } from "@/lib/trail-panels";
import styles from "./page.module.css";

interface LegacyTrailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return trailPanels.map((panel) => ({ slug: panel.slug }));
}

export default async function LegacyTrailPage({ params }: LegacyTrailPageProps) {
  const { slug } = await params;
  const panel = getTrailPanel(slug);

  if (!panel) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Visit Roncegno</Link>
        <Link href="/festa-della-castagna" className={styles.contextLink}>Festa della Castagna</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{panel.eyebrow}</p>
          <span className={styles.panelLabel}>Pannello {panel.panelNumber}</span>
          <h1>{panel.title}</h1>
          <p className={styles.summary}>{panel.summary}</p>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.article}>
          {panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>

        <aside className={styles.audioCard}>
          <span className={styles.audioIcon}>▶</span>
          <div>
            <p className={styles.audioKicker}>Audioguida</p>
            <h2>{panel.audioTitle}</h2>
            <p className={styles.audioNote}>
              Player predisposto per l’audio definitivo. Nel prototipo il contenuto mostra già l’esperienza prevista per i QR sul territorio.
            </p>
          </div>
          <button type="button" className={styles.audioButton} aria-label="Riproduci audioguida">Riproduci</button>
        </aside>
      </section>

      <section className={styles.metaSection}>
        <div>
          <p className={styles.metaLabel}>QR esistenti associati</p>
          <p>{panel.qrCodes.join(" · ")}</p>
        </div>
        {panel.relatedRouteLabel && (
          <div>
            <p className={styles.metaLabel}>Percorso</p>
            <p>{panel.relatedRouteLabel}</p>
          </div>
        )}
      </section>

      <section className={styles.footerCta}>
        <div>
          <p className={styles.eyebrowLight}>Continua a scoprire</p>
          <h2>Dal pannello al territorio.</h2>
          <p>Lo stesso QR può continuare a vivere negli anni, mentre testi, audio e collegamenti vengono aggiornati dal Content Hub.</p>
        </div>
        <Link href="/festa-della-castagna" className={styles.ctaButton}>Scopri le storie del castagno</Link>
      </section>
    </main>
  );
}
