import type { TrailPanel } from "@/lib/trail-panels";

export const cinqueValliPanels: TrailPanel[] = [
  {
    slug: "torbiera-di-cinque-valli-4",
    panelNumber: "16",
    qrCodes: ["vr2p6j4h6vppgehyp8yw"],
    title: "La torbiera di Cinque Valli",
    eyebrow: "Sentiero Cinque Valli · Natura",
    summary:
      "Un habitat alpino raro e delicato, nato attraverso processi millenari di accumulo e sedimentazione in un ambiente freddo e saturo d’acqua.",
    body: [
      "La torba è il risultato di processi millenari di deposito e di progressiva sedimentazione di materiali naturali, in aree a clima freddo, dove l’acqua ristagna a causa del fondo impermeabile e ne impedisce la decomposizione.",
      "La torbiera di Cinque Valli rappresenta un habitat prioritario di eccezionale importanza naturalistica per il territorio alpino: si tratta di un lembo di torbiera alta boscata, identificata dal codice 91D0 nella Direttiva europea Habitat.",
    ],
    sections: [
      {
        title: "Un ambiente costruito dagli sfagni",
        text: [
          "La vegetazione, formata da piante perenni, è dominata da cuscinetti colorati di sfagni che consentono la crescita della torbiera.",
          "Il lento accumulo di materiale organico in condizioni fredde e sature d’acqua rende questo ecosistema particolarmente fragile e prezioso.",
        ],
      },
      {
        title: "Le specie della torbiera",
        text: [
          "Nel sito è stata riscontrata la presenza di alcune specie tipiche di torbiera come la Scirpus sylvaticus, una pianta di grossa taglia nei pressi della pedana, l’Eriophorum vaginatum, con la tipica infruttescenza a batuffolo bianco, e la Carex stellulata.",
          "Lungo il bordo della torbiera a sfagno sono presenti dei tratti di prateria umida a Molinia coerulea.",
        ],
      },
      {
        title: "Conservare un habitat delicato",
        text: [
          "Nell’ottica della conservazione dell’habitat sono state asportate le piante di abete rosso al margine della torbiera per contrastare il processo d’imboschimento naturale.",
          "Sono state create anche due piccole pozze aggiuntive al margine della torbiera con funzione naturalistica e faunistica.",
        ],
      },
    ],
    facts: [
      { value: "91D0", label: "Codice dell’habitat prioritario nella Direttiva europea Habitat" },
      { value: "Sfagni", label: "I muschi che contribuiscono alla crescita della torbiera" },
      { value: "2 pozze", label: "Piccoli ambienti creati a supporto della biodiversità" },
    ],
    audioTitle: "Ascolta: la torbiera di Cinque Valli",
    relatedRouteLabel: "Sentiero Cinque Valli",
    relatedRouteHref: "/percorsi/sentiero-cinque-valli",
  },
];

export function getCinqueValliPanel(slug: string) {
  return cinqueValliPanels.find((panel) => panel.slug === slug) ?? null;
}
