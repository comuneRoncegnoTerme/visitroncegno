import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

export default async function ContentHubLoginPage() {
  const session = await getContentHubSession();
  if (session) redirect("/content-hub");

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <p>Visit Roncegno</p>
          <span>Content Hub</span>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Area redazione</p>
          <h1>Accedi ai contenuti del territorio.</h1>
          <p>
            Usa le credenziali della tua utenza Directus. L’accesso è riservato agli utenti autorizzati alla redazione.
          </p>
        </div>
        <LoginForm />
        <p className={styles.note}>Sessione protetta da cookie HttpOnly e scadenza automatica dopo 8 ore.</p>
      </section>
      <aside className={styles.visual} aria-hidden="true">
        <div>
          <span>Roncegno Terme · Valsugana</span>
          <strong>Un solo punto per aggiornare sito, luoghi, eventi e percorsi.</strong>
        </div>
      </aside>
    </main>
  );
}
