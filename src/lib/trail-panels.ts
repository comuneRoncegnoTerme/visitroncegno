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
  sections?: { title: string; text: string[] }[];
  facts?: { value: string; label: string }[];
  relatedPanels?: { title: string; href: string; label: string }[];
}

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
    relatedPanels: [
      { title: "Aspetti botanici ed ecosistema", href: "/it/sentieri/aspetti-botanici-3-2", label: "Natura" },
      { title: "Utilizzo delle castagne", href: "/it/sentieri/utilizzo-delle-castagne-3-3", label: "Tradizioni" },
      { title: "Conservazione dei castagneti", href: "/it/sentieri/conservazione-castagneti-3-4", label: "Paesaggio" },
    ],
    audioTitle: "Ascolta: il castagno nella storia",
    relatedRouteLabel: "Circuito del Castagno",
  },
  {
    slug: "aspetti-botanici-3-2",
    panelNumber: "09–10",
    qrCodes: ["vr2fjxepca7yeng8zd6a", "vr2pamdxb4vmwhrwhaeq"],
    title: "Aspetti botanici",
    eyebrow: "Castagneti · Natura",
    summary:
      "Foglie, fiori, frutti e struttura dell’albero: imparare a riconoscere il castagno è il primo passo per comprenderne il valore.",
    body: [
      "Il castagno è una specie longeva, capace di caratterizzare interi versanti. La sua biologia è strettamente legata alle condizioni del suolo, all’esposizione e alla gestione del bosco.",
      "Osservarne corteccia, chioma, foglie e ricci permette di riconoscere le diverse fasi stagionali e comprendere meglio l’ecosistema del castagneto.",
    ],
    audioTitle: "Ascolta: conoscere il castagno",
    relatedRouteLabel: "Le storie del castagno",
  },
  {
    slug: "utilizzo-delle-castagne-3-3",
    panelNumber: "11–13",
    qrCodes: ["vr2jfhw3exe8hx5v9ndr", "vr2e35p93z2dxezna22n", "vr2vhcufvadq3r89jpar"],
    title: "Utilizzo delle castagne",
    eyebrow: "Castagneti · Tradizioni",
    summary:
      "La castagna è stata cibo quotidiano, ingrediente, riserva per l’inverno e parte di una cultura materiale ancora viva.",
    body: [
      "Raccolta, essiccazione, conservazione e trasformazione hanno dato origine a pratiche condivise e ricette locali.",
      "Oggi queste tradizioni diventano anche un modo per raccontare il territorio, valorizzare i prodotti e trasmettere conoscenze alle nuove generazioni.",
    ],
    audioTitle: "Ascolta: usi e tradizioni della castagna",
    relatedRouteLabel: "Le storie del castagno",
  },
  {
    slug: "conservazione-castagneti-3-4",
    panelNumber: "14–15",
    qrCodes: ["vr2wr2erx3kkd8gyk4eh", "vr2gf28jzvmvxurv3kz5"],
    title: "Conservazione dei castagneti",
    eyebrow: "Castagneti · Paesaggio",
    summary:
      "Un castagneto curato è insieme ambiente naturale, paesaggio culturale e patrimonio da tramandare.",
    body: [
      "La conservazione passa dalla manutenzione del sottobosco, dalla cura degli alberi e dal rinnovo delle pratiche di gestione.",
      "Mantenere vivo un castagneto significa preservare biodiversità, memoria e un paesaggio che continua a raccontare il rapporto tra comunità e montagna.",
    ],
    audioTitle: "Ascolta: custodire i castagneti",
    relatedRouteLabel: "Le storie del castagno",
  },
];

export function getTrailPanel(slug: string) {
  return trailPanels.find((panel) => panel.slug === slug) ?? null;
}
