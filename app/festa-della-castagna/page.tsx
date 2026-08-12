import Link from "next/link";
import styles from "./page.module.css";

const stories = [
  {
    title: "Il castagno nella storia",
    href: "/it/sentieri/il-castagno-nella-storia-3-1",
    text: "Una storia lunga secoli, intrecciata alla vita quotidiana e all’economia della comunità.",
  },
  {
    title: "Aspetti botanici",
    href: "/it/sentieri/aspetti-botanici-3-2",
    text: "Foglie, fiori, frutti e caratteristiche di una pianta che ha segnato il paesaggio di Roncegno.",
  },
  {
    title: "Utilizzo delle castagne",
    href: "/it/sentieri/utilizzo-delle-castagne-3-3",
    text: "Dalla cucina alla conservazione: usi, saperi e tradizioni legati alla castagna.",
  },
  {
    title: "Conservazione dei castagneti",
    href: "/it/sentieri/conservazione-castagneti-3-4",
    text: "Come si cura un castagneto e perché questo patrimonio merita di essere custodito.",
  },
];

export default function FestaDellaCastagnaPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Visit Roncegno
        </Link>
        <Link href="/" className={styles.backLink}>
          Torna alla home
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Roncegno Terme · Autunno</p>
          <h1>Festa della Castagna</h1>
          <p>
            Un’occasione per vivere Roncegno attraverso sapori, paesaggio,
            tradizioni e storie custodite nei castagneti.
          </p>
          <div className={styles.heroActions}>
            <a href="#programma" className={styles.primaryButton}>Scopri la festa</a>
            <a href="#storie" className={styles.secondaryButton}>Ascolta le storie del castagno</a>
          </div>
        </div>
      </section>

      <section className={styles.intro} id="programma">
        <div>
          <p className={styles.eyebrow}>Pagina di lancio</p>
          <h2>La festa diventa una porta d’ingresso al territorio.</h2>
        </div>
        <div className={styles.introCopy}>
          <p>
            Questa pagina raccoglie in un solo luogo il programma della Festa
            della Castagna, informazioni utili e contenuti digitali legati ai
            castagneti di Roncegno.
          </p>
          <p>
            Il programma definitivo verrà pubblicato qui e potrà essere
            aggiornato dal Content Hub senza modificare URL o materiali già
            distribuiti.
          </p>
        </div>
      </section>

      <section className={styles.programBlock}>
        <div className={styles.programHeading}>
          <p className={styles.eyebrowLight}>Programma</p>
          <h2>Festa della Castagna</h2>
          <p>Programma in aggiornamento.</p>
        </div>
        <div className={styles.programCards}>
          <article>
            <span>01</span>
            <h3>Incontri e tradizioni</h3>
            <p>Momenti dedicati alla comunità, alla cultura locale e alla storia dei castagneti.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Sapori del territorio</h3>
            <p>Castagne, prodotti locali e occasioni per conoscere le realtà del paese.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Passeggiate e scoperte</h3>
            <p>Esperienze per collegare il centro di Roncegno ai castagneti e alla nuova segnaletica.</p>
          </article>
        </div>
      </section>

      <section className={styles.stories} id="storie">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Audioguide e pannelli</p>
          <h2>Le storie del castagno</h2>
          <p>
            I QR già presenti sul territorio continuano a funzionare: cambiano
            i contenuti dietro al codice, non il codice stampato.
          </p>
        </div>
        <div className={styles.storyGrid}>
          {stories.map((story, index) => (
            <Link href={story.href} className={styles.storyCard} key={story.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{story.title}</h3>
              <p>{story.text}</p>
              <strong>Apri contenuto →</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <p className={styles.eyebrowLight}>Scopri Roncegno</p>
          <h2>La festa è l’inizio del viaggio.</h2>
          <p>
            Percorsi, luoghi, eventi, audioguide e storie del territorio in un’unica esperienza digitale.
          </p>
        </div>
        <Link href="/" className={styles.primaryButton}>Esplora Visit Roncegno</Link>
      </section>
    </main>
  );
}
