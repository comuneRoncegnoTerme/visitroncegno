import Link from "next/link";
import { getDirectusAssetUrl } from "@/lib/directus";
import { plainText, type EditorialItem } from "@/lib/editorial";
import { placeCategory } from "@/lib/place-taxonomy";
import EditorialHeader from "./EditorialHeader";
import SiteFooter from "./SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import styles from "./Editorial.module.css";

type Props = { item: EditorialItem; type: "place" | "event" };

function normalizeUrl(value?: string | null) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function placeHeading(item: EditorialItem) {
  const category = placeCategory({ map_icon: item.map_icon, map_label: item.map_label });
  if (category === "food") return "Sapori da scoprire.";
  if (category === "sleep") return "Un posto dove fermarsi.";
  if (category === "services") return "Informazioni utili sul territorio.";
  return "Una storia da incontrare.";
}

export default async function EditorialDetail({ item, type }: Props) {
  const settings = await getSiteSettings();
  const image = getDirectusAssetUrl(item.image);
  const paragraphs = plainText(item.content ?? item.description ?? item.summary);
  const location = item.address ?? item.location_name ?? item.place?.title ?? "Roncegno Terme";
  const website = normalizeUrl(item.website_url);
  const booking = normalizeUrl(item.booking_url);
  const practicalInfo = type === "place" && Boolean(
    item.address || item.phone || item.email || website || booking ||
    item.access_notes || item.parking_notes || item.public_transport_notes
  );

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />
      <section className={styles.detailHero} style={image ? { backgroundImage: `linear-gradient(90deg,rgba(8,35,28,.82),rgba(8,35,28,.18)),url('${image}')` } : undefined}>
        <Link href={type === "place" ? "/luoghi" : "/eventi"}>← {type === "place" ? "Tutti i luoghi" : "Tutti gli eventi"}</Link>
        <p>{item.map_label ?? item.category?.name ?? (type === "place" ? "Luogo da conoscere" : "Agenda")}</p>
        <h1>{item.title}</h1>
        {item.summary && <div>{item.summary}</div>}
      </section>
      <section className={styles.detailGrid}>
        <article>
          <p className={styles.kicker}>Conosci il territorio</p>
          <h2>{type === "place" ? placeHeading(item) : "Tutto quello che c’è da sapere."}</h2>
          {paragraphs.length ? paragraphs.map((text, index) => <p key={index}>{text}</p>) : <p>Le informazioni complete saranno disponibili a breve.</p>}
        </article>
        <aside>
          {type === "event" && item.start_date && <div><small>Quando</small><strong>{new Intl.DateTimeFormat("it-IT", { dateStyle: "full", timeZone: "Europe/Rome" }).format(new Date(item.start_date))}</strong></div>}
          <div><small>Dove</small><strong>{location}</strong></div>
          {item.phone && <div><small>Telefono</small><a className={styles.inlineContact} href={`tel:${item.phone}`}>{item.phone}</a></div>}
          {item.email && <div><small>Email</small><a className={styles.inlineContact} href={`mailto:${item.email}`}>{item.email}</a></div>}
          {practicalInfo && (item.access_notes || item.parking_notes || item.public_transport_notes) && (
            <div className={styles.practicalNotes}>
              {item.access_notes && <p><small>Accesso</small><span>{item.access_notes}</span></p>}
              {item.parking_notes && <p><small>Parcheggio</small><span>{item.parking_notes}</span></p>}
              {item.public_transport_notes && <p><small>Trasporto pubblico</small><span>{item.public_transport_notes}</span></p>}
            </div>
          )}
          <div className={styles.detailActions}>
            {booking && <a href={booking} target="_blank" rel="noreferrer">Prenota / contatta ↗</a>}
            {website && <a href={website} target="_blank" rel="noreferrer">Sito ufficiale ↗</a>}
            {item.latitude && item.longitude && <a href={`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`} target="_blank" rel="noreferrer">Apri sulla mappa ↗</a>}
          </div>
          <p>Verifica sempre eventuali aggiornamenti prima della partenza.</p>
        </aside>
      </section>
      <section className={styles.relatedLinks}>
        <Link href="/organizza-la-visita"><small>Organizza</small><strong>Dove mangiare e dormire →</strong></Link>
        <Link href={type === "place" ? "/eventi" : "/luoghi"}><small>Continua a esplorare</small><strong>{type === "place" ? "Vedi i prossimi eventi" : "Conosci i luoghi"} →</strong></Link>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
