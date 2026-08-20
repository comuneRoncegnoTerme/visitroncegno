export interface TrailPanel {
  slug: string;
  panelNumber: string;
  qrCodes: string[];
  title: string;
  eyebrow: string;
  summary: string;
  body: string[];
  audioTitle: string;
  relatedRouteLabel?: string;
  relatedRouteHref?: string;
  sections?: { title: string; text: string[] }[];
  facts?: { value: string; label: string }[];
  relatedPanels?: { title: string; href: string; label: string }[];
}

const chestnutRelated = [
  { title: "Il castagno nella storia e nelle tradizioni locali", href: "/it/sentieri/il-castagno-nella-storia-3-1", label: "Storia" },
  { title: "Aspetti botanici ed ecosistema", href: "/it/sentieri/aspetti-botanici-3-2", label: "Natura" },
  { title: "Utilizzo delle castagne nell’alimentazione", href: "/it/sentieri/utilizzo-delle-castagne-3-3", label: "Sapori" },
  { title: "Problematiche legate alla conservazione dei castagneti", href: "/it/sentieri/conservazione-castagneti-3-4", label: "Paesaggio" },
];

export const trailPanels: TrailPanel[] = [
  {
    slug: "la-tempesta-vaia-11-1",
    panelNumber: "30",
    qrCodes: ["vr2r66eexekpahv3dmur"],
    title: "La tempesta Vaia",
    eyebrow: "Bosco · Memoria del territorio",
    summary:
      "Un evento estremo che ha cambiato il paesaggio alpino e il modo di osservare, curare e raccontare il bosco.",
    body: [
      "Tra il 28 e il 29 ottobre 2018 la tempesta Vaia colpì con eccezionale intensità vaste aree delle Alpi. Anche il territorio di Roncegno porta i segni di quell’evento.",
      "Questa tappa invita a leggere il bosco come un ambiente vivo: fragile, capace di rigenerarsi e profondamente legato alle comunità che lo abitano e lo curano.",
    ],
    audioTitle: "Ascolta la storia della tempesta Vaia",
    relatedRouteLabel: "Sentieri di Roncegno",
  },
  {
    slug: "il-castagno-nella-storia-3-1",
    panelNumber: "06–08",
    qrCodes: ["vr2c7hkppw9uag36fex3", "vr2ype6ec6a5ppyc3hvy", "vr2w87pugpu7qadbqp3r"],
    title: "Il castagno nella storia e nelle tradizioni locali",
    eyebrow: "Circuito del Castagno · Storia e tradizioni",
    summary:
      "Per secoli il castagno è stato una risorsa essenziale per le comunità di montagna: cibo, legno, lavoro, scambio e paesaggio. A Roncegno questa storia continua ancora oggi.",
    body: [
      "La castanicoltura in Trentino ha una storia antichissima ed un’elevata importanza, rappresentando fino al secondo dopoguerra una importante fonte di sostentamento per la gente di montagna. Durante le lunghe carestie la castagna rappresentava la fonte primaria di cibo per esseri umani, bestiame ed anche animali selvatici.",
      "Il frutto veniva consumato e non trasformato, parte della produzione veniva venduta o barattata con altri generi di prima necessità. Il legno era utilizzato per paleria in viticoltura, legna da ardere, legname da opera e nell’arredo. Il fogliame veniva raccolto ed era oggetto di compravendita in quanto costituiva la lettiera per gli animali, mentre il tannino era impiegato per la concia delle pelli.",
    ],
    sections: [
      {
        title: "Dalla crisi al recupero dei castagneti",
        text: [
          "Con l’industrializzazione e l’esodo dalle campagne la cura dei castagneti diminuì. Cambiarono le abitudini alimentari e molte superfici vennero destinate ad altre colture o ad altri usi del suolo. Alla fine degli anni Quaranta, inoltre, il cancro della corteccia contribuì a ridurre drasticamente le aree castanicole.",
          "Negli ultimi decenni il legame delle comunità con il territorio ha favorito un processo di recupero e valorizzazione dei vecchi castagneti, insieme alla nascita di associazioni di castanicoltori.",
        ],
      },
      {
        title: "Un patrimonio tutelato",
        text: [
          "Attualmente la situazione è migliorata grazie anche all’intervento finanziario dell’Ente pubblico, la Provincia Autonoma di Trento. Sin dagli anni ’80 l’Assessorato all’agricoltura della Provincia, affiancato dall’Istituto Agrario di San Michele all’Adige e dall’Ente per lo sviluppo dell’Agricoltura Trentina, ha impostato un programma volto a stimolare le operazioni di risanamento dei castagneti da frutto, contribuendo nel frattempo alla tutela paesaggistica ed ambientale del territorio.",
        ],
      },
      {
        title: "Roncegno e l’Associazione Produttori Castagne",
        text: [
          "A livello locale, nel 1980 è nata l’Associazione Produttori Castagne Roncegno, che aderisce al Consorzio Tutela del Castagno del Trentino e che dedica alla castagna una festa di importante valenza economica per il territorio.",
          "La coltivazione del castagno rappresenta oggi un’interessante integrazione al reddito delle famiglie contadine: rispetto ad altre colture richiede soprattutto la cura della pianta e del sottobosco, mantenendo nello stesso tempo vivo un paesaggio storico.",
        ],
      },
    ],
    facts: [
      { value: "1980", label: "Nasce l’Associazione Produttori Castagne Roncegno" },
      { value: "11 km", label: "Sviluppo complessivo del Circuito del Castagno" },
      { value: "3", label: "Anelli che compongono il circuito" },
    ],
    relatedPanels: chestnutRelated.filter((item) => item.href !== "/it/sentieri/il-castagno-nella-storia-3-1"),
    audioTitle: "Ascolta: il castagno nella storia",
    relatedRouteLabel: "Circuito del Castagno",
    relatedRouteHref: "/percorsi/circuito-del-castagno",
  },
  {
    slug: "aspetti-botanici-3-2",
    panelNumber: "09–10",
    qrCodes: ["vr2fjxepca7yeng8zd6a", "vr2pamdxb4vmwhrwhaeq"],
    title: "Aspetti botanici ed ecosistema",
    eyebrow: "Circuito del Castagno · Botanica ed ecosistema",
    summary:
      "Il castagno europeo, Castanea sativa, è un albero imponente e longevo. Conoscerne forma, fioritura, frutto e habitat aiuta a leggere il castagneto come un vero ecosistema.",
    body: [
      "Il castagno europeo è una latifoglia di notevoli dimensioni che può superare i 30 metri di altezza, con una chioma espansa e rotondeggiante. È una pianta molto longeva, capace di raggiungere anche quattro o cinque secoli di vita.",
      "L’apparato radicale è molto sviluppato, il fusto è eretto e robusto e la corteccia, liscia nelle piante giovani, diventa profondamente screpolata con l’età. Le foglie sono grandi, lanceolate e seghettate; i fiori compaiono verso la fine della primavera e il frutto, la castagna, è racchiuso nel riccio spinoso che si apre a maturazione.",
    ],
    sections: [
      {
        title: "Una specie che cerca luce",
        text: [
          "Il castagno è una specie eliofila: ama l’esposizione al sole. Tollera la siccità estiva e anche basse temperature invernali, ma teme le gelate precoci e tardive e le piogge abbondanti durante la fioritura.",
          "In Trentino la fascia di coltivazione si colloca indicativamente tra i 300 e i 900–1000 metri di quota.",
        ],
      },
      {
        title: "Il suolo giusto",
        text: [
          "Il castagno ha esigenze precise: non tollera bene i terreni calcarei e argillosi e predilige suoli acidi, prevalentemente silicei e sciolti. Per questo la sua distribuzione è strettamente legata alla geologia e alle condizioni locali dei versanti.",
        ],
      },
      {
        title: "Dal Mediterraneo alle Alpi",
        text: [
          "Originario dell’Asia Minore e strettamente legato all’area mediterranea, il castagno è oggi diffuso in gran parte dell’Europa meridionale. In Italia accompagna sia l’Appennino sia l’arco alpino, dove forma paesaggi storici riconoscibili.",
        ],
      },
    ],
    facts: [
      { value: ">30 m", label: "Altezza che può raggiungere un castagno adulto" },
      { value: "4–5 secoli", label: "Longevità possibile della pianta" },
      { value: "300–1000 m", label: "Fascia altitudinale indicativa in Trentino" },
    ],
    relatedPanels: chestnutRelated.filter((item) => item.href !== "/it/sentieri/aspetti-botanici-3-2"),
    audioTitle: "Ascolta: conoscere il castagno",
    relatedRouteLabel: "Circuito del Castagno",
    relatedRouteHref: "/percorsi/circuito-del-castagno",
  },
  {
    slug: "utilizzo-delle-castagne-3-3",
    panelNumber: "11–13",
    qrCodes: ["vr2jfhw3exe8hx5v9ndr", "vr2e35p93z2dxezna22n", "vr2vhcufvadq3r89jpar"],
    title: "Utilizzo delle castagne nell’alimentazione tradizionale e nella cucina attuale",
    eyebrow: "Circuito del Castagno · Alimentazione e cucina",
    summary:
      "Per secoli la castagna è stata un alimento fondamentale delle comunità rurali: nutriente, conservabile e disponibile nei mesi più difficili. Oggi torna protagonista nella cucina d’autunno.",
    body: [
      "Almeno fino all’inizio della seconda metà del Novecento la castagna ha rappresentato una risorsa alimentare fondamentale per gran parte della popolazione rurale. Poteva sostituire i cereali più pregiati e, nelle comunità di montagna, accompagnava l’alimentazione per molti mesi dell’anno.",
      "Per conservarla durante l’inverno veniva soprattutto essiccata. Una volta secca poteva essere reidratata, per esempio nel latte, oppure macinata e trasformata in farina.",
    ],
    sections: [
      {
        title: "Del castagno non si buttava nulla",
        text: [
          "Il legname serviva per riscaldare le case, per la paleria, per costruzioni e attrezzi; foglie e lettiera venivano impiegate per il bestiame e le castagne non adatte al consumo umano potevano diventare alimento per gli animali.",
        ],
      },
      {
        title: "Un frutto nutriente",
        text: [
          "La castagna contiene una quota importante di amidi, insieme a grassi, proteine, sali minerali e vitamine. È naturalmente priva di glutine e può essere utilizzata fresca, essiccata o trasformata in farina.",
        ],
      },
      {
        title: "Dalle caldarroste alla cucina contemporanea",
        text: [
          "Le castagne possono essere arrostite sul fuoco, cotte al forno oppure lessate. Oggi entrano in dolci, polente, zuppe, minestre e piatti salati, mantenendo un legame diretto con la cucina autunnale e con le feste del territorio.",
          "Le caratteristiche organolettiche e le dimensioni delle castagne prodotte a Roncegno e in Valsugana le rendono di fatto paragonabili ai marroni.",
        ],
      },
    ],
    facts: [
      { value: "4–5 mesi", label: "Periodo in cui un tempo molte famiglie di montagna vivevano anche di castagne" },
      { value: "30 min", label: "Tempo indicativo per forno o bollitura nelle preparazioni tradizionali" },
      { value: "0 glutine", label: "La castagna è naturalmente priva di glutine" },
    ],
    relatedPanels: chestnutRelated.filter((item) => item.href !== "/it/sentieri/utilizzo-delle-castagne-3-3"),
    audioTitle: "Ascolta: la castagna dalla dispensa alla tavola",
    relatedRouteLabel: "Circuito del Castagno",
    relatedRouteHref: "/percorsi/circuito-del-castagno",
  },
  {
    slug: "conservazione-castagneti-3-4",
    panelNumber: "14–15",
    qrCodes: ["vr2wr2erx3kkd8gyk4eh", "vr2gf28jzvmvxurv3kz5"],
    title: "Problematiche legate alla conservazione dei castagneti",
    eyebrow: "Circuito del Castagno · Cura del paesaggio",
    summary:
      "Dalla seconda metà del Novecento la castanicoltura ha attraversato una forte crisi. Conservare un castagneto oggi significa tenere insieme salute degli alberi, gestione del sottobosco, biodiversità e memoria del paesaggio.",
    body: [
      "La crisi della castanicoltura è stata legata a più fattori: l’abbandono delle campagne, il cambiamento delle attività agricole e delle abitudini alimentari e la diffusione di patologie che hanno colpito le piante e ridotto le superfici coltivate.",
      "Il recupero dei vecchi castagneti richiede una gestione continua. La cura degli alberi e del sottobosco non serve solo alla produzione: mantiene aperto e leggibile un paesaggio culturale costruito nei secoli.",
    ],
    sections: [
      {
        title: "Abbandono e perdita di paesaggio",
        text: [
          "Quando vengono meno manutenzione e raccolta, il castagneto tende progressivamente a trasformarsi. La perdita delle pratiche tradizionali modifica la struttura del bosco e rende meno riconoscibile il paesaggio storico legato alla coltivazione del castagno.",
        ],
      },
      {
        title: "Malattie e fragilità",
        text: [
          "Tra i problemi che hanno segnato la castanicoltura del Novecento c’è il cancro della corteccia, una patologia che ha contribuito alla drastica riduzione delle aree castanicole. La conservazione passa quindi anche dal controllo fitosanitario e dalla cura degli esemplari.",
        ],
      },
      {
        title: "Curare significa tramandare",
        text: [
          "Il recupero promosso negli ultimi decenni, anche con il sostegno pubblico e con il lavoro delle associazioni di castanicoltori, ha restituito valore produttivo e paesaggistico a molti castagneti. Mantenere vivo questo sistema significa conservare biodiversità, memoria e un rapporto ancora attuale tra comunità e montagna.",
        ],
      },
    ],
    facts: [
      { value: "Paesaggio", label: "Il castagneto è insieme coltura, ambiente e patrimonio culturale" },
      { value: "Cura", label: "Potatura, sottobosco e gestione sono essenziali per mantenerlo vivo" },
      { value: "Futuro", label: "Recuperare i castagneti significa trasmettere saperi e biodiversità" },
    ],
    relatedPanels: chestnutRelated.filter((item) => item.href !== "/it/sentieri/conservazione-castagneti-3-4"),
    audioTitle: "Ascolta: custodire i castagneti",
    relatedRouteLabel: "Circuito del Castagno",
    relatedRouteHref: "/percorsi/circuito-del-castagno",
  },
];

export function getTrailPanel(slug: string) {
  return trailPanels.find((panel) => panel.slug === slug) ?? null;
}
