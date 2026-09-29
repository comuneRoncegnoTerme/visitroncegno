import type { Metadata } from "next";
import Link from "next/link";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList } from "@/lib/editorial";
import KioskChrome from "../KioskChrome";
import styles from "../KioskList.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Eventi | Infopoint Visit Roncegno" };

function isVisibleEvent(start?: string | null, end?: string | null) {
  if (!start) return false;
  const now = Date.now();
  if (end) return new Date(end).getTime() >= now;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const startDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(start));
  return startDay >= today;
}

function dateLabel(value?: string | null) {
  if (!value) return "Data da definire";
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

export default async function KioskEventsPage() {
  const [settings, items] = await Promise.all([
    getSiteSettings(),
    getEditorialList("events"),
  ]);

  const logo = getDirectusAssetUrl(settings.logo);
  const visible = items
    .filter((item) => isVisibleEvent(item.start_date, item.end_date))
    .sort((a, b) => new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime())
    .slice(0, 12);

  return (
    <main className={styles.page}>
      <KioskChrome logo={logo} siteName={settings.site_name} section="Eventi" />

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Agenda</p>
          <h1>Cosa succede a Roncegno.</h1>
        </div>
        <p>Gli appuntamenti in corso e quelli già programmati. Tocca una scheda per leggere i dettagli.</p>
      </section>

      {visible.length ? (
        <section className={styles.grid} aria-label="Eventi in programma">
          {visible.map((item) => {
            const image = getDirectusAssetUrl(item.image);
            return (
              <Link className={styles.card} href={`/kiosk/eventi/${item.slug}`} key={item.id}>
                <div className={styles.image} style={image ? { backgroundImage: `url('${image}')` } : undefined} />
                <div className={styles.copy}>
                  <small>{dateLabel(item.start_date)} · {item.location_name ?? item.place?.title ?? "Roncegno Terme"}</small>
                  <h2>{item.title}</h2>
                  <p>{item.summary ?? "Scopri tutti i dettagli dell’appuntamento."}</p>
                  <span className={styles.open}>Apri l’evento <b aria-hidden="true">→</b></span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <p className={styles.empty}>Non ci sono appuntamenti pubblicati in questo momento.</p>
      )}
    </main>
  );
}
