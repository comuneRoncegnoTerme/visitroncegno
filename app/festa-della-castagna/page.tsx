import Link from "next/link";
import styles from "./page.module.css";

const stories = [
  ["01", "Il castagno nella storia", "/it/sentieri/il-castagno-nella-storia-3-1", "Una storia lunga secoli, intrecciata alla vita quotidiana e al paesaggio di Roncegno."],
  ["02", "Aspetti botanici", "/it/sentieri/aspetti-botanici-3-2", "Foglie, fiori, frutti e caratteristiche dell’albero che ha segnato questi versanti."],
  ["03", "Utilizzo delle castagne", "/it/sentieri/utilizzo-delle-castagne-3-3", "Raccolta, cucina, conservazione e saperi tramandati dalla comunità."],
  ["04", "Conservazione dei castagneti", "/it/sentieri/conservazione-castagneti-3-4", "Cura del paesaggio, biodiversità e futuro di un patrimonio ancora vivo."],
] as const;

const practical = [
  ["📅", "Programma", "#programma"],
  ["📍", "Mappa", "#mappa"],
  ["🚌", "Come arrivare", "#come-arrivare"],
  ["🍴", "Dove mangiare", "#sapori"],
  ["📷", "Cosa vedere", "#storie"],
  ["🎟", "Eventi", "#programma"],
] as const;

export default function FestaDellaCastagnaPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Visit Roncegno</Link>
        <nav><Link href="/">Home</Link><a href="#programma">Programma</a><a href="#storie">Castagneti</a></nav>
        <Link href="/" className={styles.backLink}>Esplora Roncegno</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.ribbon}>Castagna<br /><strong>Edition</strong><br />Autunno 2026</div>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Roncegno Terme · Sapori · Comunità</p>
          <h1>Festa della<br />Castagna</h1>
          <p className={styles.lead}>Due giorni per incontrare Roncegno attraverso caldarroste, sapori, musica, passeggiate e le storie custodite nei castagneti.</p>
          <div className={styles.heroActions}>
            <a href="#programma" className={styles.primaryButton}>Scopri il programma →</a>
            <a href="#storie" className={styles.secondaryButton}>Esplora i castagneti →</a>
          </div>
        </div>
      </section>

      <section className={styles.practical}>
        <h2>Vivi la Festa della Castagna</h2>
        <div className={styles.practicalGrid}>
          {practical.map(([icon, label, href]) => <a href={href} className={styles.practicalCard} key={label}><span>{icon}</span><strong>{label}</strong><b>›</b></a>)}
        </div>
      </section>

      <section className={styles.intro}>
        <div><p className={styles.eyebrow}>Un paese in festa</p><h2>La castagna racconta Roncegno.</h2></div>
        <div className={styles.introCopy}><p>La festa non è soltanto un appuntamento gastronomico. È un modo per entrare nella storia del territorio, incontrare la comunità e scoprire un paesaggio costruito nel tempo attorno ai castagneti.</p><p>Questa pagina riunisce programma, informazioni pratiche, percorsi e contenuti digitali legati ai pannelli già presenti sul territorio.</p></div>
      </section>

      <section className={styles.program} id="programma">
        <div className={styles.programTitle}><p className={styles.eyebrowLight}>Programma</p><h2>La festa, momento per momento.</h2><p>Il programma definitivo sarà aggiornabile dal Content Hub. Per la demo mostriamo già la struttura editoriale finale.</p></div>
        <div className={styles.timeline}>
          <article><time>Mattina</time><div><h3>Il paese si apre alla festa</h3><p>Mercatino, produttori, associazioni e primi assaggi nel centro di Roncegno.</p></div></article>
          <article><time>Pomeriggio</time><div><h3>Castagneti, passeggiate e racconti</h3><p>Esperienze guidate, incontri e attività per conoscere il territorio oltre la piazza.</p></div></article>
          <article><time>Sera</time><div><h3>Sapori, musica e comunità</h3><p>La festa continua tra piatti locali, caldarroste e momenti di convivialità.</p></div></article>
        </div>
      </section>

      <section className={styles.flavours} id="sapori">
        <div className={styles.flavourImage} />
        <div className={styles.flavourCopy}><p className={styles.eyebrowLight}>Sapori di Roncegno</p><h2>Dal bosco alla tavola.</h2><p>Castagne, ricette della tradizione e prodotti locali diventano una porta d’ingresso alla cultura gastronomica del paese.</p><a href="#programma" className={styles.lightButton}>Scopri cosa succede →</a></div>
      </section>

      <section className={styles.stories} id="storie">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Circuito del Castagno</p><h2>Quattro storie da portare con te.</h2><p>I QR della segnaletica collegano il paesaggio fisico a contenuti digitali aggiornabili: testi, audio e approfondimenti restano accessibili dagli stessi codici già installati.</p></div>
        <div className={styles.storyGrid}>
          {stories.map(([number, title, href, text]) => <Link href={href} className={styles.storyCard} key={href}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>Apri la storia →</strong></Link>)}
        </div>
      </section>

      <section className={styles.info} id="come-arrivare">
        <div><p className={styles.eyebrow}>Organizza la visita</p><h2>Arriva, parcheggia, vivi il paese.</h2></div>
        <div className={styles.infoGrid}>
          <article><span>01</span><h3>Come arrivare</h3><p>Indicazioni e trasporto pubblico saranno raccolti qui in modo semplice e mobile-first.</p></article>
          <article id="mappa"><span>02</span><h3>Parcheggi e mappa</h3><p>Punti utili, accessi e collegamenti con i luoghi della festa e con i percorsi.</p></article>
          <article><span>03</span><h3>Scopri Roncegno</h3><p>La Festa è il punto di partenza per conoscere sentieri, luoghi e storie del territorio.</p></article>
        </div>
      </section>

      <section className={styles.cta}><div><p className={styles.eyebrowLight}>Visit Roncegno</p><h2>Dalla Festa al territorio.</h2><p>Continua il viaggio tra natura, sapori, percorsi e memoria.</p></div><Link href="/" className={styles.lightButton}>Esplora Roncegno →</Link></section>
    </main>
  );
}
