import Link from "next/link";
import { getDirectusAssetUrl } from "@/lib/directus";
import { plainText, type EditorialItem } from "@/lib/editorial";
import EditorialHeader from "./EditorialHeader";
import SiteFooter from "./SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./Editorial.module.css";

type Props = { item: EditorialItem; type: "place" | "event" };

export default async function EditorialDetail({ item, type }: Props) {
  const settings = await getSiteSettings();
  const image = getDirectusAssetUrl(item.image);
  const paragraphs = plainText(item.content ?? item.description ?? item.summary);
  const location = item.location_name ?? item.place?.title ?? "Roncegno Terme";
  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />
      <section className={styles.detailHero} style={image ? { backgroundImage: `linear-gradient(90deg,rgba(8,35,28,.82),rgba(8,35,28,.18)),url('${image}')` } : undefined}>
        <Link href={type === "place" ? "/luoghi" : "/eventi"}>← {type === "place" ? "Tutti i luoghi" : "Tutti gli eventi"}</Link>
        <p>{item.category?.name ?? (type === "place" ? "Luogo da conoscere" : "Agenda")}</p>
        <h1>{item.title}</h1>
        {item.summary && <div>{item.summary}</div>}
      </section>
      <section className={styles.detailGrid}>
        <article>
          <p className={styles.kicker}>Conosci il territorio</p>
          <h2>{type === "place" ? "Una storia da incontrare." : "Tutto quello che c’è da sapere."}</h2>
          {paragraphs.length ? paragraphs.map((text, index) => <p key={index}>{text}</p>) : <p>Le informazioni complete saranno disponibili a breve.</p>}
        </article>
        <aside>
          {type === "event" && item.start_date && <div><small>Quando</small><strong>{new Intl.DateTimeFormat("it-IT", { dateStyle: "full", timeZone: "Europe/Rome" }).format(new Date(item.start_date))}</strong></div>}
          <div><small>Dove</small><strong>{location}</strong></div>
          {item.latitude && item.longitude && <a href={`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`} target="_blank" rel="noreferrer">Apri sulla mappa ↗</a>}
          <p>Verifica sempre eventuali aggiornamenti prima della partenza.</p>
        </aside>
      </section>
      <section className={styles.relatedLinks}>
        <Link href="/percorsi"><small>Muoversi</small><strong>Scopri percorsi e sentieri →</strong></Link>
        <Link href={type === "place" ? "/eventi" : "/luoghi"}><small>Continua a esplorare</small><strong>{type === "place" ? "Vedi i prossimi eventi" : "Conosci i luoghi"} →</strong></Link>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
