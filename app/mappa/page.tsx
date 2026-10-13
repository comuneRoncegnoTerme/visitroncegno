import type { Metadata } from "next";
import { connection } from "next/server";
import HomeMap from "@/components/HomeMap";
import MapSwitch from "@/components/MapSwitch";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import { getHomeMapPlaces } from "@/lib/map-places";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mappa di Roncegno Terme",
  description: "Luoghi da vedere, dove mangiare, dove dormire e servizi di Roncegno Terme sulla mappa, con le indicazioni per arrivarci.",
  alternates: { canonical: "/mappa" },
};

export default async function MappaPage() {
  await connection();
  const [settings, places] = await Promise.all([getSiteSettings(), getHomeMapPlaces()]);

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />
      <div className={styles.bar}>
        <h1>Mappa</h1>
        <MapSwitch current="mappa" />
      </div>
      <div className={styles.mapArea}>
        <HomeMap places={places} fill />
      </div>
    </main>
  );
}
