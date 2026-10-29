import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import DirectionsLink from "@/components/DirectionsLink";
import HomeMap from "@/components/HomeMap";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/directus";
import { EBIKE_POINTS } from "@/lib/ebike";
import { getEditorialList } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import styles from "@/components/GuidePage.module.css";

export const metadata: Metadata = {
  title: "Roncegno in e-bike",
  description: "I cinque punti di ricarica per e-bike di Roncegno Terme, dalla ciclabile della Valsugana a Malga Trenca, con mappa e indicazioni.",
  alternates: { canonical: "/e-bike" },
};

export default async function EbikePage() {
  await connection();
  const [settings, places] = await Promise.all([getSiteSettings(), getEditorialList("places")]);
  const placesBySlug = new Map(places.map((place) => [place.slug, place]));

  // Ogni punto apre la sua scheda se è pubblicata, altrimenti resta sul punto in questa pagina.
  const points = EBIKE_POINTS.map((point) => {
    const place = placesBySlug.get(point.placeSlug);
    return { ...point, href: place ? placeHref(place) : null };
  });
  const mapPlaces = points.map((point) => ({
    id: -point.number,
    title: `${point.number} · ${point.title}`,
    slug: point.placeSlug,
    summary: point.note,
    imageUrl: null,
    latitude: point.latitude,
    longitude: point.longitude,
    mapLabel: "Ricarica e-bike",
    placeType: "service" as const,
    detailMode: "redirect" as const,
    canonicalPath: point.href?.startsWith("/") ? point.href : `/e-bike#punto-${point.number}`,
  }));
  const link = (slug: string) => {
    const place = placesBySlug.get(slug);
    return place ? placeHref(place) : null;
  };
  const cyclePathStops = [
    { label: "Biotopo Palude di Roncegno", href: link("biotopo-palude-di-roncegno") },
    { label: "Centro sportivo", href: link("centro-sportivo-roncegno-terme") },
    { label: "Mulino Angeli", href: "/musei/mulino-angeli" },
  ].filter((stop): stop is { label: string; href: string } => Boolean(stop.href));

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.hero}>
        <div>
          <h1>Roncegno in e-bike</h1>
          <p className={styles.lead}>
            Dal fondovalle ai pascoli in quota: la montagna di Roncegno si visita anche in mountain bike o in e-bike,
            con cinque punti di ricarica sul territorio.
          </p>
          <nav className={styles.jumpNav} aria-label="Sezioni della pagina">
            <a href="#ricarica">Punti di ricarica</a>
            <a href="#mappa">Mappa</a>
            <a href="#ciclabile">La ciclabile</a>
            <Link href="/percorsi">Percorsi</Link>
          </nav>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.heroImage} src="/images/inforoncegno/ciclabile-valsugana-2.jpg" alt="Due cicliste sulla ciclabile della Valsugana" />
      </section>

      <section className={styles.section} id="ricarica">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Punti di ricarica</p>
            <h2>Dove ricaricare la bici</h2>
          </div>
          <p>Due punti in paese e lungo la ciclabile, tre in montagna: si può salire fino a Malga Trenca e tornare con la batteria carica.</p>
        </div>

        <figure className={styles.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/inforoncegno/mappa-ricarica-e-bike.jpg"
            width={1600}
            height={845}
            alt="Veduta aerea del versante di Roncegno con i cinque punti di ricarica numerati: 1 Malga Trenca, 2 Ristorante Bar alle Pozze, 3 Rifugio Erterle, 4 Mulino Angeli, 5 Via San Giuseppe"
          />
          <figcaption>I punti di ricarica sul territorio, dall’opuscolo InfoRoncegno.</figcaption>
        </figure>

        <ol className={styles.points}>
          {points.map((point) => (
            <li className={styles.point} id={`punto-${point.number}`} key={point.number}>
              <span className={styles.pointNumber} aria-hidden="true">{point.number}</span>
              <h3>{point.href ? <Link href={point.href}>{point.title}</Link> : point.title}</h3>
              <p>{point.note}</p>
              <DirectionsLink className={`${styles.directions} ${styles.textLink}`} latitude={point.latitude} longitude={point.longitude}>
                Indicazioni ↗
              </DirectionsLink>
            </li>
          ))}
        </ol>

        <div className={styles.mapFrame} id="mappa">
          <HomeMap places={mapPlaces} compact showFilters={false} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.chapter}`} id="ciclabile">
        <div className={styles.chapterText}>
          <p className={styles.kicker}>In fondovalle</p>
          <h2>La ciclabile della Valsugana</h2>
          <p>
            La pista ciclabile della Valsugana collega il Lago di Caldonazzo con Bassano del Grappa: 80 km tra cultura,
            storia e paesaggi a cavallo tra Trentino e Veneto, lungo un sentiero d’acqua diventato un sentiero della cultura.
          </p>
          <p>
            A Roncegno la ciclabile porta al Biotopo e al Centro sportivo e passa per Marter, dove ci si può fermare a
            visitare il Mulino Angeli e ricaricare la bici.
          </p>
          {cyclePathStops.length > 0 && (
            <div className={styles.links}>
              {cyclePathStops.map((stop) => <Link className={styles.textLink} href={stop.href} key={stop.label}>{stop.label} →</Link>)}
            </div>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/ciclabile-valsugana.jpg" alt="Tre ciclisti sulla ciclabile della Valsugana" loading="lazy" />
      </section>

      <section className={`${styles.section} ${styles.chapter} ${styles.chapterReverse}`}>
        <div className={styles.chapterText}>
          <p className={styles.kicker}>In montagna</p>
          <h2>Strade forestali e sentieri</h2>
          <p>
            Sopra i 1100 metri la montagna di Roncegno è costellata di baite, collegate da strade e sentieri: con
            l’e-bike si sale ai masi, ai pascoli di Trenca e ai rifugi, dove fermarsi a mangiare e ricaricare.
          </p>
          <div className={styles.links}>
            <Link className={styles.textLink} href="/percorsi">Tutti i percorsi →</Link>
            <Link className={styles.textLink} href="/mappa">Apri la mappa →</Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.chapterImage} src="/images/inforoncegno/segnavia-malga-trenca.jpg" alt="Segnavia per il Rifugio Serot, il Lago delle Prese e Malga Trenca, 1660 m" loading="lazy" />
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
