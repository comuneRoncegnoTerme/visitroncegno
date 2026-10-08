import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/directus";
import { getLegalPage, type LegalSlug } from "@/lib/legal-pages";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import styles from "./LegalPage.module.css";

export default async function LegalPage({ slug }: { slug: LegalSlug }) {
  const [settings, page] = await Promise.all([getSiteSettings(), getLegalPage(slug)]);
  if (!page) notFound();

  const updated = page.updated
    ? new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(new Date(page.updated))
    : null;

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />
      <article className={styles.article}>
        <h1>{page.title}</h1>
        {updated && <p className={styles.updated}>Ultimo aggiornamento: {updated}</p>}
        {page.paragraphs.map((text, index) => <p key={index}>{text}</p>)}
      </article>
      <SiteFooter settings={settings} />
    </main>
  );
}
