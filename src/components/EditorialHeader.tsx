import Link from "next/link";
import styles from "./Editorial.module.css";

export default function EditorialHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/">Visit Roncegno</Link>
      <nav aria-label="Navigazione principale">
        <Link href="/luoghi">Luoghi</Link>
        <Link href="/percorsi">Percorsi</Link>
        <Link href="/eventi">Eventi</Link>
      </nav>
      <Link className={styles.homeLink} href="/">Torna alla home</Link>
    </header>
  );
}
