import type { Metadata } from "next";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import RoutesEditorialList from "@/components/RoutesEditorialList";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import styles from "@/components/RoutesIndex.module.css";

export const metadata: Metadata = {
  title: "Percorsi e sentieri",
  description: "Cammini, escursioni e itinerari tra castagneti, masi e panorami del Lagorai a Roncegno Terme.",
  alternates: { canonical: "/percorsi" },
};

export default async function RoutesPage() {
  const [items, settings] = await Promise.all([
    getEditorialList("routes"),
    getSiteSettings(),
  ]);

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Camminare</p>
            <h1>Percorsi e sentieri.</h1>
          </div>
          <p className={styles.heroIntro}>
            Itinerari tra castagneti, masi e panorami del Lagorai. Scegli il percorso in base al tempo, alla difficoltà e al tipo di uscita, poi preparati e parti con rispetto per la montagna.
          </p>
        </div>
      </section>

      <section className={styles.content} aria-label="Elenco dei percorsi">
        {items.length ? (
          <RoutesEditorialList items={items} />
        ) : (
          <p className={styles.empty}>I percorsi saranno pubblicati a breve.</p>
        )}
      </section>

      <nav className={styles.footerNav} aria-label="Continua a esplorare">
        <Link href="/cartina">
          <small>Orientati</small>
          <strong>Esplora la cartina illustrata →</strong>
        </Link>
        <Link href="/organizza-la-visita#mappa-visita">
          <small>Organizza</small>
          <strong>Apri la mappa del territorio →</strong>
        </Link>
      </nav>

      <SiteFooter settings={settings} />
    </main>
  );
}
