import Link from "next/link";
import KioskChrome from "./KioskChrome";
import styles from "./KioskDetail.module.css";

type Fact = { label: string; value: string };

type Props = {
  logo?: string | null;
  siteName?: string | null;
  section: string;
  backHref: string;
  eyebrow: string;
  title: string;
  image?: string | null;
  intro?: string | null;
  paragraphs?: string[];
  facts?: Fact[];
};

export default function KioskDetail({
  logo,
  siteName,
  section,
  backHref,
  eyebrow,
  title,
  image,
  intro,
  paragraphs = [],
  facts = [],
}: Props) {
  return (
    <main className={styles.page}>
      <KioskChrome logo={logo} siteName={siteName} section={section} backHref={backHref} />

      <section className={styles.hero} style={image ? { backgroundImage: `url('${image}')` } : undefined}>
        <div className={styles.shade} />
        <div className={styles.heroCopy}>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          {intro && <div>{intro}</div>}
        </div>
      </section>

      <section className={styles.content}>
        {facts.length > 0 && (
          <div className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <small>{fact.label}</small>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
        )}

        <div className={styles.text}>
          {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : (
            <p>Per maggiori informazioni consulta la versione completa del contenuto sul portale Visit Roncegno.</p>
          )}
        </div>

        <div className={styles.bottomActions}>
          <Link href={backHref} className={styles.back}>← Torna alla sezione</Link>
        </div>
      </section>
    </main>
  );
}
