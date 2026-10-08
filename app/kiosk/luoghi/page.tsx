import type { Metadata } from "next";
import Link from "next/link";
import { getDirectusAssetUrl, getDirectusImageUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import KioskChrome from "../KioskChrome";
import styles from "../KioskList.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Luoghi | Infopoint Visit Roncegno" };

export default async function KioskPlacesPage() {
  const [settings, items] = await Promise.all([
    getSiteSettings(),
    getEditorialList("places"),
  ]);

  const logo = getDirectusAssetUrl(settings.logo);

  return (
    <main className={styles.page}>
      <KioskChrome logo={logo} siteName={settings.site_name} section="Scopri Roncegno" />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Territorio</p>
          <h1>Luoghi da conoscere.</h1>
        </div>
        <p>Centro storico, natura, cultura e punti di interesse: una selezione di luoghi da cui iniziare a esplorare Roncegno.</p>
      </section>

      {items.length ? (
        <section className={styles.grid} aria-label="Luoghi da scoprire">
          {items.slice(0, 12).map((item) => {
            const image = getDirectusImageUrl(item.image);
            return (
              <Link className={styles.card} href={`/kiosk/luoghi/${item.slug}`} key={item.id}>
                <div className={styles.image} style={image ? { backgroundImage: `url('${image}')` } : undefined} />
                <div className={styles.copy}>
                  <small>{item.map_label ?? item.category?.name ?? "Roncegno Terme"}</small>
                  <h2>{item.title}</h2>
                  <p>{item.summary ?? "Scopri questo luogo e le informazioni utili per la visita."}</p>
                  <span className={styles.open}>Apri il luogo <b aria-hidden="true">→</b></span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <p className={styles.empty}>I luoghi saranno disponibili a breve.</p>
      )}
</main>
  );
}
