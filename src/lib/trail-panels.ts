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
    title: "Il castagno nella storia",
    eyebrow: "Castagneti · Cultura",
    summary:
      "Per secoli il castagno ha accompagnato la vita delle comunità: alimento, risorsa economica e presenza familiare nel paesaggio.",
    body: [
      "I castagneti raccontano un rapporto antico tra uomo e territorio. La loro presenza ha contribuito all’alimentazione, alla gestione dei versanti e alla costruzione di un paesaggio riconoscibile.",
      "Riscoprire questa storia significa leggere il territorio attraverso le pratiche, i saperi e le stagioni che hanno accompagnato generazioni di abitanti.",
    ],
    audioTitle: "Ascolta: il castagno nella storia",
    relatedRouteLabel: "Le storie del castagno",
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
