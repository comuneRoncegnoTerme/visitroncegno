import type { TrailPanel } from "@/lib/trail-panels";

// Pannelli 17–21 del Circuito del Castagno: i testi sono quelli delle pagine del sito precedente
// (/it/sentieri/maso-*-5-x), raggiunte dai QR sui pannelli.
const masi = [
  { title: "Maso Ròneri", href: "/it/sentieri/maso-roneri-5-1", label: "Pannello 17" },
  { title: "Maso Bèbberi", href: "/it/sentieri/maso-bebberi-5-2", label: "Pannello 18" },
  { title: "Maso Rozza", href: "/it/sentieri/maso-rozza-5-3", label: "Pannello 19" },
  { title: "Maso Postai", href: "/it/sentieri/maso-postai-5-4", label: "Pannello 20" },
  { title: "Maso Montibèlleri", href: "/it/sentieri/maso-montibelleri-5-5", label: "Pannello 21" },
];

const otherMasi = (slug: string) => masi.filter((maso) => !maso.href.endsWith(`/${slug}`));

const masoPanel = (panel: Omit<TrailPanel, "eyebrow" | "relatedRouteLabel" | "relatedRouteHref" | "relatedPanels">): TrailPanel => ({
  ...panel,
  eyebrow: "Circuito del Castagno · I masi",
  relatedRouteLabel: "Circuito del Castagno",
  relatedRouteHref: "/percorsi/circuito-del-castagno",
  relatedPanels: otherMasi(panel.slug),
});

export const masiPanels: TrailPanel[] = [
  masoPanel({
    slug: "maso-roneri-5-1",
    panelNumber: "17",
    qrCodes: ["vr2uumc52ykpkr4acpe3"],
    title: "Maso Ròneri",
    summary:
      "La montagna di Roncegno è costellata da più di 40 masi, frutto dell’attività dei roncadori bavarotirolesi, che colonizzarono il versante a partire dal XII secolo, e dei minatori provenienti principalmente dall’Alto Adige, che arrivarono in ondate migratorie temporalmente sparse.",
    body: [
      "Il termine roncadòri deriva da roncàr, che significa “dissodare il terreno”: loro compito era infatti proprio quello di strappare terra al bosco per coltivarla. I toponimi “Roncegno” e “Ronchi” derivano da questi termini, e ci fanno capire l’origine del territorio e del paesaggio di cui oggi possiamo godere. Il toponimo “Ròneri” sembra derivare da “Roner”, dal medio alto tedesco RON(E) “tronco d’albero”. In Europa, durante il medioevo, le popolazioni colonizzarono aree fino ad allora disabitate: Roncegno rappresenta solo un esempio di una tendenza ben più ampia.",
      "Il maso costituiva un’isola autosufficiente e per questo comprendeva, oltre agli edifici abitativi, una stalla, arativi resi pianeggianti con la costruzione di muretti a secco, pascoli e boschi. Possiamo immaginare il “mansus”, da cui deriva “maso”, come un’azienda agricola, abbastanza grande per garantire il sostentamento del concessionario e della sua famiglia, oltre che un surplus per pagare l’affitto. A seguito dell’epoca napoleonica in queste zone cadde il diritto dei primi figli maschi di ereditare l’intero maso. La proprietà venne così frammentata tra gli aventi diritto di eredità, e nel maso sorsero numerosi edifici che ospitavano famiglie tra loro imparentate. Questo portò alla formazione dei masi come li conosciamo oggi a Roncegno, ben diversi dal modello a edificio unico che invece si trova in Alto Adige.",
      "Elemento che contraddistingue la montagna di Roncegno è la presenza costante dell’acqua: fino al secondo dopoguerra non esistevano acquedotti, e gli stabilimenti dipendevano dalla presenza di una sorgente. Il territorio di Roncegno, e più in generale quello valsuganotto, è caratterizzato da un’elevata differenza di quota tra il fondovalle e le aree montane, e le strade costruite dai roncadòri sono molto ripide: esse permettevano il passaggio dalla valle alla fascia dei masi sino ai pascoli di alta quota. Le strade più ripide, utilizzate per il trasporto su slitte o per scivolamento diretto del fieno o del legname, sono chiamate fòi o corèi (vocali chiuse).",
    ],
    audioTitle: "Ascolta: Maso Ròneri",
  }),
  masoPanel({
    slug: "maso-bebberi-5-2",
    panelNumber: "18",
    qrCodes: ["vr2bqbbpadpqdegbdq5u"],
    title: "Maso Bèbberi",
    summary:
      "I masi di Roncegno nascono dall’attività di coloni di lingua germanofona e questo emerge, oltre che per il caratteristico tipo di urbanizzazione, anche dalla toponomastica.",
    body: [
      "I masi prendono infatti i nomi delle famiglie che li fondarono: il maso dove ci troviamo ora, Maso Bèbberi (vocali chiuse), deriva da Weber (tessitore). Nel 1585 i masi tedeschi identificati sono: Egger, Erlacher, Glavereiner, Gonner, Hainzel, Keller, Kofler, Lehen, Leytter, Maur, May, Mendl, Pacher, Pader, Parner, Pentz, Pirchach, Puessen, Purgstaleller, Ringgler, Roaner, Schmider, Stricker, Stubel, Thaler, Tschunter, Tumbler, Waal, Wahlen, Wald, Wucker. Molti di questi esistono ancora oggi come nomi di masi o cognomi e soprannomi di famiglia (Kofler-Còverli, Ringgler-Rìncheri, Stricker-Strìccheri).",
      "Come in altre vallate del Trentino, i casi di omonimia erano molteplici e ancora oggi molte famiglie che portano lo stesso cognome vengono distinte grazie ad un soprannome. Questa impronta di lingua tedesca si rileva anche in altri termini di uso comune nel dialetto qui parlato, ad esempio i nomi della fauna locale: il ciuffolotto (Pyrrhula pyrrhula), viene qui chiamato ghimplo (in tedesco Gimpel), oppure il fringuello (Fringilla coelebs) è il finco (Fink in tedesco).",
      "Lo stretto rapporto con il bosco e la montagna, eredità degli antichi pionieri, è evidenziato anche dalla forte tradizione venatoria, che un tempo rappresentava un’attività importante per integrare la carne nella dieta. Attività tradizionale, volta all’integrazione della dieta, era la macellazione dei maiali che avveniva durante l’inverno, in modo che le basse temperature potessero conservare la carne. Rappresentava uno dei momenti più gioiosi della vita nel maso. La carne subiva delle lavorazioni per poterla conservare e consumare anche durante l’anno, come le tipiche “luganeghe”, un salume affumicato, e gli “ossi”, ossa sulle quali rimanevano brandelli di carne che venivano messi in salamoia, affumicati e cotti insieme ai crauti, altra preparazione che permetteva il consumo di verdura durante l’inverno. Ogni pasto veniva accompagnato dalla polenta, che costituiva il fondamento della dieta: il pane si faceva solo una volta l’anno.",
    ],
    audioTitle: "Ascolta: Maso Bèbberi",
  }),
  masoPanel({
    slug: "maso-rozza-5-3",
    panelNumber: "19",
    qrCodes: ["vr23p45hhmcvpcahx7en"],
    title: "Maso Rozza",
    summary:
      "Di sera, attorno al fuoco, non c’era nulla di più affascinante per i bambini che ascoltare i racconti di esseri fantastici e delle loro avventure.",
    body: [
      "A sud-ovest del maso Rozza, si trovano i Crozzi de l’orco, un bosco di latifoglie con numerose emergenze rocciose. Erano uomini grandi, mezzi selvatici e scarsi di senno, però non erano per niente cattivi. Gli Orchi venivano fuori qualche volta per un ritrovo nei masi là vicini, alla sera, e gli versavano un bicchiere di vino da bere in compagnia. E allora gli orchi chiedevano: “Cos’è questa roba? Da dove viene? Date anche a noi le piante da mettere a dimora, vogliamo berne anche noi”. Allora la gente di quassù, che non è stata tanto brava, anziché dare le piante delle viti, ha dato loro piantine di roveri e di castagni selvatici. E loro sono andati dentro ed hanno piantato quelle piante. E dopo tanto aspettare, dopo diversi anni, son cresciute piante grandi che non facevano né uva né niente. E da allora, nei Crozzi del’Orco, ci sono quelle piante; ci sono ancora roveri e castagni selvatici. Tra gli altri personaggi che popolavano i boschi vi erano il salvanèlo, una sorta di dispettoso folletto con le gambe di capra ed un cappellaccio grande, e l’aspio, un mostro con ali di pipistrello e testa e corpo di serpente.",
      "Vi erano anche le aguàne, donne a metà tra fate e streghe che vivevano presso i Crozzi dele aguàne: figure simili si trovano in Trentino, Alto Adige, Val Camonica, Veneto, Friuli Venezia-Giulia. Infine, le strie della Ilba, streghe confinate in alta montagna dopo il Concilio di Trento, e la “barbantàna... co i denti de fero e la barba de lana”.",
      "Maso Rozza (dal latino arrugia, galleria, con il significato dialettale di “piccolo corso d’acqua”) è probabilmente il maso a cui fanno riferimento alcune pergamene di un archivio familiare conservate presso il Tiroler Landesarchiv di Innsbruck e datate tra il XIII e il XIV secolo. Il maso descritto è chiamato Antràque, ovvero “tra le acque”, e potrebbe essere identificato proprio con l’attuale maso Rozza. Un dettagliato ed esteso approfondimento si può trovare nell’opera “Un mondo in salita: il maso di Antràque sul monte di Roncegno (XIII-XIV secolo)” / Sandra Boccher, Emanuele Curzel, Italo Franceschini; con la collaborazione di Marco Stenico, Marco Berlanda, Matteo Rapanà.- [Trento]: Società di Studi Trentini di Scienze Storiche, 2017.",
    ],
    audioTitle: "Ascolta: Maso Rozza",
  }),
  masoPanel({
    slug: "maso-postai-5-4",
    panelNumber: "20",
    qrCodes: ["vr2vadkqbxv5hvnaec92"],
    title: "Maso Postai",
    summary:
      "La vita nei masi era certamente faticosa, ma non mancavano i momenti di festa: la prima era il carnevale.",
    body: [
      "Il “capomaschere” era in capo alla comitiva di bambini, armato di un bastone decorato, e guidava i piccoli di maso in maso. Non mancava mai la musica e la gente che sempre ballava. L’ultimo giorno di febbraio veniva poi “’Ncontramarzo”: i bambini correvano per i prati scuotendo i campanacci delle vacche, in modo da fare un gran baccano e svegliare l’erba perché ricrescesse. Questo è infatti il momento in cui il fieno nelle stalle inizia a scarseggiare, per questo si cantava “erba su, che fen no ghe n’è pù!”.",
      "Veniva poi il periodo del gran lavorare nei campi, e del transito del bestiame dalle quote più basse alle più elevate. Non v’erano ancora malghe, la gente portava gli animali nelle proprie baite, lavorando il latte da sé. A una quota intermedia tra i masi e le baite v’erano le “stalète”, piccole stalle in cui si facevano sostare gli animali per qualche settimana, in modo da poter sfruttare appieno la crescita dell’erba. In estate, al 15 di agosto, si festeggiava “la Madona” e in generale la fine dei lavori di fienagione.",
      "In questa occasione i Mocheni (la gente della Val dei Mocheni) veniva a festeggiare insieme ai ronzegnari: il passaggio di persone tra Roncegno e la valle del Fersina è attestato anche in epoca molto più antica, attraverso i passi della Portèla (vocale aperta) e della Bassa, che costituirono probabilmente vie di colonizzazione del versante sud del Lagorai.",
      "Veniva poi l’autunno, con la raccolta dei prodotti come castagne e mais. In particolare, al mais è legata la tradizione dello “sfoiò”: alla sera le famiglie del maso si ritrovavano insieme per sfogliare le pannocchie. Variante dello sfoiò, è il “filò”: durante il periodo invernale, alla sera, la gente si ritrovava al caldo delle stalle: le donne filavano e nel contempo i giovani corteggiavano le amate, tanto che “far filò” significa anche corteggiare, se non proprio l’andare in casa, dai genitori, della fidanzata. Con l’avvicinarsi del Natale, i bambini rimanevano in trepidante attesa di San Nicolò e di Santa Lucia, i quali avrebbero lasciato qualche dono in cambio di un piattino con della farina per l’affaticato asinello. Il toponimo “Postai” deriva da Purgstaller, dal medio alto tedesco BURC-STALL “posto ove sorgeva un castello”. Purgstaller sarebbe quindi chi abita vicino ad un castello.",
    ],
    audioTitle: "Ascolta: Maso Postai",
  }),
  masoPanel({
    slug: "maso-montibelleri-5-5",
    panelNumber: "21",
    qrCodes: ["vr2gnkdwc2gd9d8kgcxq"],
    title: "Maso Montibèlleri",
    summary:
      "Le sorgenti e i corsi d’acqua, numerosi a Roncegno, garantirono lo sviluppo di attività agricole, estrattive e manifatturiere.",
    body: [
      "La fontana rappresentava il punto centrale del maso, dove si andava a prendere l’acqua per l’uso domestico, si abbeveravano gli animali e venivano lavati i panni: ancora oggi ogni maso ha la sua fontana. Lungo il corso dei torrenti maggiori, Chiavòna e Larganza, sorsero alcune attività legate all’acqua. Sul torrente Chiavòna, che scorre ad ovest del maso in cui ci troviamo, erano presenti un mulino, che macinava principalmente mais e castagne (utilizzate poi per l’alimentazione animale) ed una sega veneziana presso maso Cràneri, oltre che la “fucina del Cròzzer”, al di sotto dell’attuale “Ponte dela Maria”.",
      "La particolare conformazione geolitologica non ha soltanto permesso la grande disponibilità idrica, ma anche il formarsi di giacimenti minerari che furono sfruttati attraverso le miniere. Ad ovest di maso Montibèlleri, lungo il torrente Chiavòna, era localizzata la miniera della Pàmera, da cui si estraeva pirrotina con magnetite pirite e arseno pirite. La miniera, che venne chiusa nel ’43, diede lavoro a numerosi abitanti dei masi, che poterono quindi integrare il proprio reddito. I masi fornivano agli abitanti tutto il necessario per vivere, ma non era infrequente cercare modi alternativi per disporre di denaro: chi lavorava in miniera, chi prestava la propria manodopera nei lavori nel bosco, chi vendeva i frutti della raccolta dei funghi o dell’uccellagione ai negozi più a valle.",
      "Tutto ciò poteva avvenire solo nella stagione fredda, quando il tempo non era dedicato al lavoro nei campi e nei prati, che costituiva la priorità. La svolta avvenne negli anni ’70, quando furono costruite le strade che salivano ai masi: questo rese più agevoli gli spostamenti in valle, e molti abitanti trovarono lavoro nelle nascenti piccole industrie. Anche questo fenomeno è in parte causa del progressivo spopolamento della montagna. Tuttavia, negli ultimi anni si è assistito ad un ripopolamento e ristrutturazione di alcuni masi.",
      "Il nome del maso in cui ci troviamo deriva probabilmente dal nome che era stato dato ai livellari dei signori di Montebello (attuale maso in cui si trovava l’omonimo castello), ovvero i Montibeller, che qui si stabilirono. Si assiste così ad un passaggio dall’italiano (Montebello), al tedesco (Montibeller), e poi di nuovo all’italiano (Montibèlleri).",
    ],
    audioTitle: "Ascolta: Maso Montibèlleri",
  }),
];

export function getMasoPanel(slug: string) {
  return masiPanels.find((panel) => panel.slug === slug) ?? null;
}
