import type { Metadata } from "next";
import Link from "next/link";
import { getDirectusAssetUrl, getDirectusImageUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import KioskChrome from "../KioskChrome";
import styles from "../KioskList.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Percorsi | Infopoint Visit Roncegno" };

function durationLabel(minutes?: number | null) {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours} h` : null, rest ? `${rest} min` : null].filter(Boolean).join(" ");
}

export default async function KioskRoutesPage() {
  const [settings, items] = await Promise.all([
    getSiteSettings(),
    getEditorialList("routes"),
  ]);

  const logo = getDirectusAssetUrl(settings.logo);

  return (
    <main className={styles.page}>
      <KioskChrome logo={logo} siteName={settings.site_name} section="Percorsi" />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Camminare</p>
          <h1>Percorsi e sentieri.</h1>
        </div>
        <p>Scegli un itinerario in base alla distanza, al tempo e alla difficoltà. Tocca una scheda per approfondire.</p>
      </section>

      {items.length ? (
        <section className={styles.grid} aria-label="Percorsi">
          {items.slice(0, 12).map((item) => {
            const image = getDirectusImageUrl(item.image);
            const meta = [
              item.distance_km ? `${item.distance_km} km` : null,
              durationLabel(item.duration_minutes),
              item.elevation_gain_m ? `+${item.elevation_gain_m} m` : null,
            ].filter(Boolean);
            return (
              <Link className={styles.card} href={`/kiosk/percorsi/${item.slug}`} key={item.id}>
                <div className={styles.image} style={image ? { backgroundImage: `url('${image}')` } : undefined} />
                <div className={styles.copy}>
                  <small>{item.difficulty ?? item.category?.name ?? "Percorso"}</small>
                  <h2>{item.title}</h2>
                  <p>{item.summary ?? item.route_highlight ?? "Scopri il percorso e i suoi punti di interesse."}</p>
                  {meta.length > 0 && <div className={styles.meta}>{meta.map((value) => <span key={value}>{value}</span>)}</div>}
                  <span className={styles.open}>Apri il percorso <b aria-hidden="true">→</b></span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <p className={styles.empty}>I percorsi saranno disponibili a breve.</p>
      )}
</main>
  );
}
