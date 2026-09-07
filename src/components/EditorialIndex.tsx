import Link from "next/link";
import { getDirectusAssetUrl, getSiteSettings } from "@/lib/directus";
import type { EditorialItem } from "@/lib/editorial";
import { placeHref } from "@/lib/place-detail";
import EditorialHeader from "./EditorialHeader";
import SiteFooter from "./SiteFooter";
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
  return item.map_label ?? item.category?.name ?? "Roncegno Terme";
}

function itemHref(item: EditorialItem, basePath: string) {
  if (basePath === "/luoghi") return placeHref(item);
  return `${basePath}/${item.slug}`;
}

export default async function EditorialIndex(props: Props) {
  const settings = await getSiteSettings();
  const isEvents = props.basePath === "/eventi";

  return (
    <main className={styles.page}>
      <EditorialHeader settings={settings} />

      <section className={styles.indexHero}>
        <div className={styles.indexHeroInner}>
          <div>
            <p className={styles.indexEyebrow}>{props.eyebrow}</p>
            <h1>{props.title}</h1>
          </div>
          <p className={styles.heroIntro}>{props.introduction}</p>
        </div>
      </section>

      <section className={styles.indexContent}>
        <div className={styles.indexLead}>
          <p><strong>{props.items.length}</strong> {isEvents ? "appuntamenti" : "luoghi"}</p>
          <span>{isEvents ? "Scopri cosa succede sul territorio." : "Esplora il territorio attraverso i suoi luoghi."}</span>
        </div>

        {props.items.length ? (
          <div className={`${styles.cardGrid} ${isEvents ? styles.eventGrid : styles.placeGrid}`}>
            {props.items.map((item, index) => {
              const image = getDirectusAssetUrl(item.image);
              return (
                <Link
                  className={`${styles.card}${index === 0 ? ` ${styles.featuredIndexCard}` : ""}`}
                  href={itemHref(item, props.basePath)}
                  key={item.id}
                >
                  <div className={styles.cardImage} style={image ? { backgroundImage: `url('${image}')` } : undefined} />
                  <div className={styles.cardCopy}>
                    <small>{meta(item, props.basePath)}</small>
                    <h2>{item.title}</h2>
                    <p>{item.summary ?? item.route_highlight ?? "Scopri informazioni, dettagli e consigli utili."}</p>
                    <strong>{isEvents ? "Scopri l’evento" : "Scopri il luogo"} →</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className={styles.empty}>{props.emptyMessage}</p>}
      </section>

      <nav className={styles.indexFooterNav} aria-label="Continua a esplorare">
        <Link href="/cartina"><small>Orientati</small><strong>Esplora la cartina illustrata →</strong></Link>
        <Link href="/organizza-la-visita"><small>Organizza</small><strong>Prepara la tua visita →</strong></Link>
      </nav>

      <SiteFooter settings={settings} />
    </main>
  );
}
