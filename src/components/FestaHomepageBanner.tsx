import Link from "next/link";
import EventCountdown from "./EventCountdown";
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
  /** Date della festa prese dall'evento in Directus: abilitano il conto alla rovescia. */
  eventStart?: string | null;
  eventEnd?: string | null;
  /** Festa conclusa: il banner ringrazia e dà appuntamento alla prossima edizione. */
  ended?: boolean;
};

// Testi del dopo-Festa: quelli in Directus parlano della Festa in arrivo, quindi qui non si usano.
const AFTER_FESTA = {
  eyebrow: "23–25 ottobre 2026 · Grazie a tutti",
  title: "Ci vediamo nel 2027",
  description:
    "Grazie a chi ha cucinato, suonato e allestito, e a chi è venuto a trovarci. La Festa della Castagna torna il prossimo autunno; i castagneti di Roncegno si possono visitare tutto l’anno.",
  primaryLabel: "Rivivi la Festa",
  primaryUrl: "/festa-della-castagna",
  secondaryLabel: "Il circuito del Castagno",
  secondaryUrl: "/percorsi/circuito-del-castagno",
  noteSmall: "46ª Festa della Castagna",
  noteStrong: "Arrivederci all’autunno 2027",
};

export default function FestaHomepageBanner(props: Props) {
  const { eventStart, eventEnd, ended } = props;
  const { eyebrow, title, description, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, noteSmall, noteStrong } =
    ended ? AFTER_FESTA : props;
  return (
    <section className={styles.wrapper} aria-labelledby="festa-home-title">
      <div className={styles.image} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        {!ended && eventStart && <EventCountdown start={eventStart} end={eventEnd ?? null} className={styles.countdown} />}
        <p className={styles.eyebrow}>{eyebrow ?? "23–25 ottobre 2026 · Roncegno Terme"}</p>
        <h2 id="festa-home-title">{title ?? "Festa della Castagna 2026"}</h2>
        <p className={styles.lead}>
          {description ?? "Tre giorni di castagne, cucina, musica, passeggiate e vita di paese."}
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={primaryUrl ?? "/festa-della-castagna"}>
            {primaryLabel ?? "Il programma"}
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
