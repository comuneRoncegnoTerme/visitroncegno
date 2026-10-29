// "Da non perdere" delle pagine tema, dall'opuscolo InfoRoncegno 2026.
// Il collegamento è `href` oppure la scheda Directus indicata (luogo, percorso, storia): se la scheda non è
// pubblicata la card resta senza link. La foto è quella dell'opuscolo o, se manca, quella della scheda.
export type ThemeHighlight = {
  title: string;
  label: string;
  text: string;
  image?: string;
  href?: string;
  place?: string;
  route?: string;
  story?: string;
};

export const THEME_HIGHLIGHTS: Record<string, ThemeHighlight[]> = {
  "natura-e-montagna": [
    {
      title: "Panchina Gigante",
      label: "Trenca · 1.700 m",
      text: "Un ampio panorama sulla Valsugana, a dieci minuti a piedi da Malga Trenca.",
      image: "/images/inforoncegno/panchina-gigante.jpg",
      place: "panchina-gigante",
    },
    {
      title: "Malga Trenca",
      label: "Alpeggio",
      text: "La vita d’alpeggio e “Adotta una mucca”: 65 euro, 50 in formaggi della tua mucca e 15 per il territorio.",
      image: "/images/inforoncegno/segnavia-malga-trenca.jpg",
      place: "malga-trenca",
    },
    {
      title: "Lago delle Prese",
      label: "Sentiero 372B",
      text: "Dalla località Pozze verso il Rifugio Serot: a inizio giugno i rododendri tingono di rosso il lago.",
      place: "lago-delle-prese",
    },
    {
      title: "Biotopo Palude di Roncegno",
      label: "Fondovalle",
      text: "Uno degli ultimi boschi ripariali del Trentino, lungo la ciclabile: aironi cenerini, germani reali e merli acquaioli.",
      place: "biotopo-palude-di-roncegno",
    },
    {
      title: "Strada del Castagno",
      label: "Percorso",
      text: "Tra i castagneti del versante sud, da Roncegno a Castel Ivano, con le tabelle sulla storia dei masi.",
      image: "/images/inforoncegno/strada-del-castagno.jpg",
      route: "strada-del-castagno",
    },
    {
      title: "Le baite",
      label: "Sopra i 1.100 m",
      text: "Case d’estate, stalle e caseifici della monticazione, collegati da strade e sentieri. Alcune si affittano per le vacanze.",
      image: "/images/inforoncegno/baite.jpg",
      place: "associazione-vacanze-in-baita",
    },
  ],
  "cultura-e-memoria": [
    {
      title: "La pala del Guardi",
      label: "Chiesa dei Santi Pietro e Paolo",
      text: "La Santissima Trinità appare ai santi Pietro e Paolo, dipinta da Francesco Guardi per Roncegno nel 1779.",
      image: "/images/inforoncegno/chiesa-santi-pietro-e-paolo.jpg",
      place: "chiesa-santi-pietro-e-paolo",
    },
    {
      title: "Mulino Angeli",
      label: "Museo · Marter",
      text: "La Casa degli Spaventapasseri nell’ex mulino, con le macine mosse dall’acqua del Brenta.",
      image: "/images/inforoncegno/mulino-angeli.jpg",
      href: "/musei/mulino-angeli",
    },
    {
      title: "Museo degli Strumenti Musicali Popolari",
      label: "Museo · Santa Brigida",
      text: "Strumenti da tutti e cinque i continenti nell’ex canonica di Santa Brigida, con il parco musicale.",
      image: "/images/inforoncegno/santa-brigida.jpg",
      href: "/musei/museo-della-musica",
    },
    {
      title: "Le chiese",
      label: "Fede e tradizione",
      text: "Da San Silvestro a Marter a Santa Maria Assunta di Serot: chiese e capitelli di epoche diverse.",
      image: "/images/inforoncegno/chiesetta-di-montagna.jpg",
      story: "chiese-di-roncegno",
    },
    {
      title: "Centralina idroelettrica",
      label: "1893",
      text: "Una delle prime del Trentino: dava corrente alle terme e al paese. Restaurata, con immagini d’epoca.",
      place: "centralina-idroelettrica",
    },
    {
      title: "Scopri Roncegno",
      label: "La storia del paese",
      text: "Strade romane, miniere, masi, terme e arte: il racconto di Roncegno in cinque capitoli.",
      image: "/images/inforoncegno/centro-di-roncegno.jpg",
      href: "/scopri-roncegno",
    },
  ],
  "terme-e-benessere": [
    {
      title: "Casa Raphael e il parco",
      label: "Terme",
      text: "Bagni con l’acqua arsenicale-ferruginosa e medicina antroposofica nel palazzo delle terme, circondato dal parco secolare.",
      image: "/images/inforoncegno/parco-delle-terme.jpg",
      place: "casa-di-salute-raphael-parco-terme",
    },
    {
      title: "L’acqua ferruginosa arsenicale",
      label: "Storia",
      text: "Dal rigagnolo rossastro della Valle del Diavolo al turismo termale, fino al terremoto del 1976.",
      image: "/images/inforoncegno/le-fonti.jpg",
      story: "acqua-ferruginosa-arsenicale",
    },
    {
      title: "Storia delle terme di Roncegno",
      label: "Pannello 23",
      text: "Dalla scoperta delle acque minerali al Grand Hotel Terme e alla nascita di Casa Raphael.",
      href: "/it/sentieri/storia-terme-roncegno-6",
    },
  ],
  "sport-e-movimento": [
    {
      title: "Centro sportivo",
      label: "Fondovalle",
      text: "Tennis e padel, calcio, un campo da golf a 9 buche e uno da footgolf, accanto al Biotopo.",
      place: "centro-sportivo-roncegno-terme",
    },
    {
      title: "In e-bike",
      label: "Ciclabile e ricarica",
      text: "La ciclabile della Valsugana e cinque punti di ricarica, dal fondovalle a Malga Trenca.",
      image: "/images/inforoncegno/ciclabile-valsugana.jpg",
      href: "/e-bike",
    },
    {
      title: "Campetto di Via Roma",
      label: "Calcio a 5 e basket",
      text: "Un campo all’aperto con il fondo in materiale riciclato da vecchi pneumatici.",
    },
    {
      title: "Inverno nel Lagorai",
      label: "Ciaspole e scialpinismo",
      text: "Le valli dell’Ilba e della Portela per le ciaspolate e lo sci alpinismo.",
      image: "/images/inforoncegno/lagorai-tramonto.jpg",
    },
  ],
};

// Parole chiave per le storie da mostrare in ciascun tema.
export const THEME_STORY_KEYWORDS: Record<string, string[]> = {
  "natura-e-montagna": ["natura", "bosco", "fauna", "flora", "torbiera", "vaia", "bostrico", "castagn"],
  "cultura-e-memoria": ["chies", "arte", "guardi", "maso", "masi", "guerra", "camminamento", "miniera"],
  "terme-e-benessere": ["terme", "termal", "acqua", "fonti"],
  "sport-e-movimento": [],
};
