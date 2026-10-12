import { redirect } from "next/navigation";
import { getHomepage } from "@/lib/directus";
import { getContentHubSession } from "@/lib/content-hub-auth";
import HomepageEditor from "../HomepageEditor";
import PageHeader from "../PageHeader";
import styles from "../editor.module.css";

export default async function ContentHubHomepagePage() {
  if (!(await getContentHubSession())) redirect("/content-hub/login");

  const homepage = await getHomepage();

  return (
    <main className={styles.page}>
      <PageHeader
        title="Homepage"
        intro="Le sezioni sono nello stesso ordine in cui compaiono sul sito. Eventi, luoghi e percorsi si aggiornano da soli dalle rispettive raccolte: qui cambi solo titoli, testi e pulsanti."
        actions={<a href="/" target="_blank" rel="noreferrer">Apri la homepage</a>}
      />
      <HomepageEditor homepage={homepage} />
    </main>
  );
}
