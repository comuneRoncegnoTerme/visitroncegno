import type { Metadata } from "next";
import Link from "next/link";
import IllustratedMapViewer, { type IllustratedMapPoint } from "@/components/IllustratedMapViewer";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CARTINA_GROUPS, CARTINA_POINTS, type CartinaPoint } from "@/lib/cartina-points";
import { getDirectusImageUrl, getSiteSettings } from "@/lib/directus";
import { getEditorialList, type EditorialItem } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cartina illustrata di Roncegno Terme",
  description: "La cartina di Roncegno Terme disegnata da Fabio Vettori: rifugi, chiese, musei e cime del territorio, con il PDF da scaricare.",
  alternates: { canonical: "/cartina" },
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function findItem(point: CartinaPoint, items: EditorialItem[]) {
  if (!point.match?.length) return null;
  return items.find((item) => {
    const title = normalize(item.title ?? "");
    return point.match!.some((keyword) => title.includes(normalize(keyword)));
  }) ?? null;
}

function resolvePoints(places: EditorialItem[], routes: EditorialItem[]): IllustratedMapPoint[] {
  return CARTINA_POINTS.map((point) => {
    const place = findItem(point, places);
    const route = place ? null : findItem(point, routes);
    const item = place ?? route;
    const href = point.href ?? (place ? placeHref(place) : route ? `/percorsi/${route.slug}` : null);
    return {
      id: point.id,
      title: point.title,
      group: point.group,
      x: point.x,
      y: point.y,
      href,
      text: item?.summary ?? point.note ?? null,
      image: getDirectusImageUrl(item?.image, 800),
    };
  });
}

export default async function CartinaPage() {
  const [settings, places, routes] = await Promise.all([
    getSiteSettings(),
    getEditorialList("places"),
    getEditorialList("routes"),
  ]);
  const points = resolvePoints(places, routes);
  const groups = Object.entries(CARTINA_GROUPS).map(([id, label]) => ({ id, label }));

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.intro} aria-labelledby="cartina-page-title">
        <div className={styles.introCopy}>
          <h1 id="cartina-page-title">La cartina di Roncegno</h1>
          <p className={styles.lead}>
            Disegnata da Fabio Vettori con le sue formiche: il paese, i rifugi, le chiese,
            i musei e le cime intorno. Tocca un punto per aprire la scheda del luogo.
          </p>
        </div>
        <a className={styles.download} href="/downloads/cartina-ufficiale-roncegno-terme.pdf" download>
          Scarica il PDF
        </a>
      </section>

      <section className={styles.mapSection} aria-label="Cartina illustrata">
        <IllustratedMapViewer
          src="/images/cartina/cartina-roncegno-1.webp"
          alt="Cartina illustrata di Roncegno Terme e del suo territorio, disegnata da Fabio Vettori"
          aspect={3583 / 2560}
          points={points}
          groups={groups}
        />
        <p className={styles.attribution}>
          Illustrazione “Le Formiche” di Fabio Vettori, cartina ufficiale 2026. Il disegno è
          indicativo e non sostituisce le carte escursionistiche: per orientarti sul posto usa
          la <Link href="/organizza-la-visita#mappa-visita">mappa interattiva</Link>.
        </p>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
