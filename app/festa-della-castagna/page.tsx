import Link from "next/link";
import styles from "./page.module.css";

const stories = [
  ["01", "Il castagno nella storia", "/it/sentieri/il-castagno-nella-storia-3-1", "Una storia lunga secoli, intrecciata alla vita quotidiana e al paesaggio di Roncegno."],
  ["02", "Aspetti botanici", "/it/sentieri/aspetti-botanici-3-2", "Foglie, fiori, frutti e caratteristiche dell’albero che ha segnato questi versanti."],
  ["03", "Utilizzo delle castagne", "/it/sentieri/utilizzo-delle-castagne-3-3", "Raccolta, cucina, conservazione e saperi tramandati dalla comunità."],
  ["04", "Conservazione dei castagneti", "/it/sentieri/conservazione-castagneti-3-4", "Cura del paesaggio, biodiversità e futuro di un patrimonio ancora vivo."],
] as const;

const practical = [
  ["01", "Programma", "#programma"],
  ["02", "Come arrivare", "#come-arrivare"],
  ["03", "Dove mangiare", "#sapori"],
  ["04", "Castagneti", "#storie"],
] as const;

export default function FestaDellaCastagnaPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Visit Roncegno</Link>
        <nav><a href="#programma">Programma</a><a href="#sapori">Sapori</a><a href="#storie">Castagneti</a></nav>
        <Link href="/" className={styles.backLink}>Torna a Roncegno</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.smoke} />
        <div className={styles.ribbon}><span>Castagna</span><strong>Edition</strong><small>Roncegno Terme</small></div>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Autunno · Roncegno Terme · Comunità</p>
          <h1>Il profumo<br />della festa.</h1>
          <p className={styles.lead}>Caldarroste sul fuoco, il paese pieno di persone, sapori locali e sentieri che salgono verso i castagneti. La Festa della Castagna è Roncegno che si racconta dal vivo.</p>
          <div className={styles.heroActions}>
            <a href="#programma" className={styles.primaryButton}>Vivi la Festa →</a>
            <a href="#storie" className={styles.secondaryButton}>Scopri i castagneti →</a>
          </div>
        </div>
        <div className={styles.heroNote}><span>Festa della Castagna</span><strong>Tradizione viva</strong></div>
      </section>

      <section className={styles.practical}>
        <div className={styles.practicalIntro}><p className={styles.eyebrow}>Tutto a portata di mano</p><h2>Vivi la festa, senza perderti nulla.</h2></div>
        <div className={styles.practicalGrid}>{practical.map(([number, label, href]) => <a href={href} className={styles.practicalCard} key={label}><span>{number}</span><strong>{label}</strong><b>↗</b></a>)}</div>
      </section>

      <section className={styles.storyIntro}>
        <div className={styles.storyPhoto} />
        <div className={styles.storyIntroCopy}>
          <p className={styles.eyebrow}>Benvenuti a Roncegno</p>
          <h2>Una festa fatta di gesti semplici.</h2>
          <p>Le decorazioni nel paese, i volontari, il fuoco acceso, le castagne che scoppiettano e le persone che si fermano a parlare. È questa atmosfera concreta e autentica a rendere la Festa della Castagna diversa da un semplice evento gastronomico.</p>
          <p>Da qui parte anche il viaggio nel territorio: il castagno diventa una chiave per leggere paesaggio, memoria e comunità.</p>
        </div>
      </section>

      <section className={styles.program} id="programma">
        <div className={styles.programTitle}><p className={styles.eyebrowLight}>Programma</p><h2>Dal mattino alla sera, il paese cambia ritmo.</h2><p>Questa è la struttura editoriale della giornata: il programma definitivo potrà essere aggiornato senza cambiare la pagina.</p></div>
        <div className={styles.timeline}>
          <article><time>Mattina</time><div><h3>Il paese apre le porte</h3><p>Mercatino, produttori, associazioni e primi profumi di caldarroste nel centro di Roncegno.</p></div></article>
          <article><time>Pomeriggio</time><div><h3>Tra piazza e castagneti</h3><p>Passeggiate, racconti, attività e incontri per scoprire il territorio oltre la festa.</p></div></article>
          <article><time>Sera</time><div><h3>Fuoco, sapori e musica</h3><p>La giornata continua tra piatti locali, convivialità e il paese illuminato dall’atmosfera autunnale.</p></div></article>
        </div>
      </section>

      <section className={styles.flavours} id="sapori">
        <div className={styles.flavourImage} />
        <div className={styles.flavourCopy}><p className={styles.eyebrowLight}>Sapori di Roncegno</p><h2>Il fuoco è parte della festa.</h2><p>Le castagne arrostite davanti al pubblico sono uno dei gesti più riconoscibili della manifestazione: profumo, calore e attesa diventano parte dell’esperienza.</p><p>Accanto alle caldarroste trovano spazio prodotti locali, ricette della tradizione e occasioni per fermarsi a tavola.</p><a href="#storie" className={styles.lightButton}>Dai sapori alle storie →</a></div>
      </section>

      <section className={styles.stories} id="storie">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Circuito del Castagno</p><h2>La festa continua lungo i sentieri.</h2><p>La segnaletica già presente nei castagneti collega il paesaggio fisico a testi, audio e approfondimenti digitali. Gli stessi QR accompagnano il visitatore anche dopo la festa.</p></div>
        <div className={styles.storyGrid}>{stories.map(([number, title, href, text]) => <Link href={href} className={styles.storyCard} key={href}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>Apri la storia →</strong></Link>)}</div>
      </section>

      <section className={styles.info} id="come-arrivare">
        <div><p className={styles.eyebrow}>Organizza la visita</p><h2>Arriva, parcheggia, poi dimentica l’auto.</h2></div>
        <div className={styles.infoGrid}><article><span>01</span><h3>Come arrivare</h3><p>Indicazioni, trasporto pubblico e accessi principali raccolti in un unico punto.</p></article><article><span>02</span><h3>Parcheggi e centro</h3><p>Una lettura semplice dei punti di accesso per vivere il paese a piedi.</p></article><article><span>03</span><h3>Continua il viaggio</h3><p>Dal centro ai castagneti, dai sentieri ai luoghi di Roncegno: la festa è solo l’inizio.</p></article></div>
      </section>

      <section className={styles.cta}><div><p className={styles.eyebrowLight}>Visit Roncegno</p><h2>Portati a casa qualcosa di più di un sacchetto di castagne.</h2><p>Scopri i luoghi, i percorsi e le storie che fanno di Roncegno un territorio da vivere tutto l’anno.</p></div><Link href="/" className={styles.lightButton}>Esplora Roncegno →</Link></section>
    </main>
  );
}
