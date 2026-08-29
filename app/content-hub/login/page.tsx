import Link from "next/link";
import { redirect } from "next/navigation";
import { getContentHubSession } from "@/lib/content-hub-auth";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

export default async function ContentHubLoginPage() {
  const session = await getContentHubSession();
  if (session) redirect("/content-hub");

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <span>Visit Roncegno</span>
            <small>Content Hub</small>
          </Link>
          <Link href="/" className={styles.siteLink}>← Torna al sito</Link>
        </header>

        <section className={styles.loginArea}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Area redazione</p>
            <h1>Content Hub</h1>
            <p>Gestisci contenuti, pannelli, luoghi, eventi e percorsi del sito Visit Roncegno.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeading}>
              <span>Accesso riservato</span>
              <h2>Entra nell’area di gestione</h2>
              <p>Usa le credenziali della tua utenza Directus.</p>
            </div>
            <LoginForm />
            <p className={styles.note}>La sessione scade automaticamente dopo 8 ore.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
