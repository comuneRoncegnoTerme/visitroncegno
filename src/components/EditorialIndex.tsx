import Link from "next/link";
import { getDirectusAssetUrl } from "@/lib/directus";
import type { EditorialItem } from "@/lib/editorial";
import EditorialHeader from "./EditorialHeader";
import styles from "./Editorial.module.css";

type Props = {
  eyebrow: string;
  title: string;
  introduction: string;
  items: EditorialItem[];
  basePath: string;
  emptyMessage: string;
};

function meta(item: EditorialItem, basePath: string) {
  if (basePath === "/eventi" && item.start_date) {
    return new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(new Date(item.start_date));
  }
  if (basePath === "/percorsi") {
    return [item.distance_km ? `${item.distance_km} km` : null, item.difficulty].filter(Boolean).join(" · ");
  }
  return item.category?.name ?? "Roncegno Terme";
}

export default function EditorialIndex(props: Props) {
  return (
    <main className={styles.page}>
      <EditorialHeader />
      <section className={styles.indexHero}>
        <p>{props.eyebrow}</p>
        <h1>{props.title}</h1>
        <div className={styles.heroIntro}>{props.introduction}</div>
      </section>
      <section className={styles.indexContent}>
        <div className={styles.indexLead}>
          <span>{String(props.items.length).padStart(2, "0")}</span>
          <p>Proposte dal territorio, aggiornate attraverso il content hub.</p>
        </div>
        {props.items.length ? (
          <div className={styles.cardGrid}>
            {props.items.map((item) => {
              const image = getDirectusAssetUrl(item.image);
              return (
                <Link className={styles.card} href={`${props.basePath}/${item.slug}`} key={item.id}>
                  <div className={styles.cardImage} style={image ? { backgroundImage: `url('${image}')` } : undefined} />
                  <div className={styles.cardCopy}>
                    <small>{meta(item, props.basePath)}</small>
                    <h2>{item.title}</h2>
                    <p>{item.summary ?? item.route_highlight ?? "Scopri informazioni, dettagli e consigli utili."}</p>
                    <strong>Scopri →</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className={styles.empty}>{props.emptyMessage}</p>}
      </section>
      <section className={styles.visitCta}><div><small>Prepara la visita</small><h2>Lasciati guidare dal territorio.</h2></div><Link href="/#mappa">Esplora la mappa →</Link></section>
    </main>
  );
}
