import Link from "next/link";
import styles from "./MapSwitch.module.css";

// Passa dalla cartina disegnata alla mappa stradale e viceversa.
export default function MapSwitch({ current }: { current: "cartina" | "mappa" }) {
  return (
    <nav className={styles.switch} aria-label="Tipo di mappa">
      <Link href="/cartina" aria-current={current === "cartina" ? "page" : undefined}>
        Cartina disegnata
      </Link>
      <Link href="/mappa" aria-current={current === "mappa" ? "page" : undefined}>
        Mappa stradale
      </Link>
    </nav>
  );
}
