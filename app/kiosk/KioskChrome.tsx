import Link from "next/link";
import styles from "./KioskChrome.module.css";

type Props = {
  logo?: string | null;
  siteName?: string | null;
  section?: string;
  backHref?: string;
};

export default function KioskChrome({
  logo,
  siteName = "Visit Roncegno",
  section,
  backHref = "/kiosk",
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/kiosk" className={styles.brand} aria-label="Torna alla home dell’infopoint">
          {logo ? <img src={logo} alt={siteName ?? "Visit Roncegno"} /> : <strong>{siteName}</strong>}
        </Link>
        {section && <span className={styles.section}>{section}</span>}
      </div>

      <div className={styles.actions}>
        {backHref !== "/kiosk" && (
          <Link href={backHref} className={styles.back}>← Indietro</Link>
        )}
        <Link href="/kiosk" className={styles.home}>Home</Link>
        <div className={styles.clockBlock}>
          <span data-kiosk-clock>--:--</span>
          <small data-kiosk-date>Roncegno Terme</small>
        </div>
      </div>
    </header>
  );
}
