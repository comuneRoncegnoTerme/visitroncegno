import Link from "next/link";
import styles from "./FestaHomepageBanner.module.css";

type Props = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  noteSmall?: string | null;
  noteStrong?: string | null;
};

export default function FestaHomepageBanner({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  noteSmall,
  noteStrong,
}: Props) {
  return (
    <section className={styles.wrapper} aria-labelledby="festa-home-title">
      <div className={styles.image} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow ?? "23–25 ottobre 2026 · Roncegno Terme"}</p>
        <h2 id="festa-home-title">{title ?? "Festa della Castagna 2026"}</h2>
        <p className={styles.lead}>
          {description ?? "Tre giorni di castagne, cucina, musica, passeggiate e vita di paese."}
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={primaryUrl ?? "/festa-della-castagna"}>
            {primaryLabel ?? "Scopri il programma"} →
          </Link>
          <Link className={styles.secondary} href={secondaryUrl ?? "/eventi"}>
            {secondaryLabel ?? "Tutti gli appuntamenti"}
          </Link>
        </div>
      </div>

      <div className={styles.identity}>
        <img
          className={styles.logo}
          src="/images/festa-castagna/logo-festa-ufficiale.webp"
          width={1200}
          height={614}
          alt="Festa della Castagna – Roncegno Terme"
        />
      </div>

      <div className={styles.note}>
        <span>{noteSmall ?? "Festa: sabato 24 e domenica 25"}</span>
        <strong>{noteStrong ?? "Aspettando la Festa: venerdì 23"}</strong>
      </div>
    </section>
  );
}
