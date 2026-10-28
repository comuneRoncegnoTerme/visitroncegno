import Link from "next/link";
import { connection } from "next/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MuseumGallery from "@/components/museum/MuseumGallery";
import MuseumKeyInfo from "@/components/museum/MuseumKeyInfo";
import { MuseumEvents, MuseumGettingThere, MuseumVisit } from "@/components/museum/MuseumSections";
import { MuseumStatusBadge } from "@/components/museum/MuseumStatus";
import MuseumSubnav from "@/components/museum/MuseumSubnav";
import { getSiteSettings } from "@/lib/directus";
import { getMuseum, getMuseumEvents, getMuseumNearby, museumJsonLd } from "@/lib/museums";
import { jsonLdString, pageMetadata, SITE_URL } from "@/lib/seo";
import GrainJourney from "./GrainJourney";
import MillTimeline from "./MillTimeline";
import Scarecrow from "./Scarecrow";
import ScarecrowField from "./ScarecrowField";
import WaterWheel from "./WaterWheel";
import styles from "./page.module.css";

const DESCRIPTION = "Mulino Angeli, la casa degli spaventapasseri a Marter di Roncegno Terme: il mulino ad acqua sul Brenta, il viaggio del chicco su tre piani e la collezione di Flavio Faganello. Orari, visite e come arrivare.";

export const metadata = pageMetadata({
  title: "Mulino Angeli e Casa Museo degli Spaventapasseri",
  description: DESCRIPTION,
  path: "/musei/mulino-angeli",
  image: "/images/musei/mulino-angeli/meccanismi.jpg",
});

const IMG = "/images/musei/mulino-angeli";

// Proposte per gruppi e scuole, dalla pagina "Le attività" di mulinoangeli.com.
const schoolOffers = [
  { name: "Visita guidata", detail: "Visita guidata interattiva, circa un’ora.", price: "4,00 €" },
  { name: "Doppia visita", detail: "Visita al mulino più visita guidata al Museo degli Strumenti Musicali Popolari di Santa Brigida.", price: "6,00 €" },
  { name: "Visita e laboratorio", detail: "Visita guidata interattiva di circa un’ora, poi un laboratorio a scelta.", price: "6,00 €" },
];

const workshops = [
  { when: "Tutto l’anno", items: ["Un piccolo spaventapasseri", "Un piccolo giocattolo", "Mandala naturale", "Pasta modellabile di mais"] },
  { when: "In primavera", items: ["Un erbario", "Pittura con tinture naturali"] },
];

const museumPhotos = [
  { src: `${IMG}/spaventapasseri-1.jpg`, alt: "Uno spaventapasseri seduto al tavolo nella cucina del mugnaio", caption: "Nella casa del mugnaio" },
  { src: `${IMG}/spaventapasser-3.jpg`, alt: "Spaventapasseri esposti accanto alle fotografie dei campi trentini", caption: "Spaventapasseri e fotografie" },
  { src: `${IMG}/meccanismi.jpg`, alt: "Le macchine in legno del mulino con uno spaventapasseri in primo piano", caption: "Tra le macchine del mulino" },
  { src: `${IMG}/spaventapasser-2.jpg`, alt: "L’esterno del Mulino Angeli lungo il canale", caption: "Il mulino lungo il canale" },
  { src: `${IMG}/hero.jpg`, alt: "Il Mulino Angeli a Marter visto dall’alto", caption: "Il Mulino Angeli a Marter" },
];

export default async function MulinoAngeliPage() {
  await connection();
  const [settings, mulino] = await Promise.all([getSiteSettings(), getMuseum("mulino-angeli")]);
  const [events, nearby] = await Promise.all([getMuseumEvents(mulino), getMuseumNearby(mulino)]);

  const sections = [
    { id: "info", label: "In breve" },
    { id: "ruota", label: "La ruota" },
    { id: "chicco", label: "Il viaggio del chicco" },
    { id: "spaventapasseri", label: "Spaventapasseri" },
    { id: "storia", label: "Storia" },
    { id: "visita", label: "Orari e visite" },
    { id: "scuole", label: "Scuole e gruppi" },
    ...(events.length ? [{ id: "eventi", label: "Eventi" }] : []),
    { id: "come-arrivare", label: "Come arrivare" },
  ];

  return (
    <main className={styles.page} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(museumJsonLd(mulino, DESCRIPTION, SITE_URL)) }} />
      <SiteHeader settings={settings} />

      <section className={styles.hero} aria-labelledby="mulino-titolo">
        <div className={styles.wrap}>
          <div>
            <span className={`${styles.label} ${styles.kicker}`}>Marter · Roncegno Terme · sul Brenta</span>
            <h1 id="mulino-titolo"><span>Mulino</span><span><em>Angeli</em></span></h1>
            <p className={styles.sub}>la casa degli spaventapasseri</p>
            <p className={styles.lead}>Fino agli anni Cinquanta l’acqua del Brenta ha fatto girare le macine di questo mulino, che serviva gran parte della conca di granoturco e cereali della Bassa Valsugana. Oggi è un museo su tre piani: i macchinari sono ancora al loro posto, e nelle stanze dove viveva la famiglia del mugnaio abita la collezione di spaventapasseri del fotografo Flavio Faganello.</p>
            <MuseumStatusBadge hours={mulino.openingHours} className={styles.heroStatus} />
            <div className={styles.where}>
              <span className={styles.label}>{mulino.address}</span>
              <span className={styles.label}>Accanto alla ciclabile della Valsugana</span>
              <a className={styles.infoLink} href="#info">Orari e informazioni ↓</a>
            </div>
          </div>
          <div className={styles.postcardHolder}>
            <figure className={styles.postcard}>
              <span className={styles.tape} aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element -- cartolina d'epoca, già ottimizzata */}
              <img src={`${IMG}/cartolina.webp`} width={1500} height={1003} alt="Cartolina d’epoca in bianco e nero: il mulino Angeli, casa bianca a tre piani, con il canale e il fiume Brenta a destra." />
              <figcaption>Marter Vals., mulino e fiume Brenta, circa cento anni fa</figcaption>
            </figure>
            <p className={styles.hint} aria-hidden="true">
              <svg viewBox="0 0 44 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M42 20 C 30 22, 14 18, 6 6" /><path d="M6 6 L 5 13 M6 6 L 12 8" /></svg>
              gli spaventapasseri si spostano
            </p>
            <Scarecrow name="giacca" width="clamp(70px,10vw,118px)" left="-3%" top="52%" tilt={-7} />
            <Scarecrow name="righe" width="clamp(110px,15vw,180px)" left="72%" top="-16%" tilt={9} />
          </div>
        </div>
      </section>

      <MuseumSubnav title="Mulino Angeli" items={sections} />
      <MuseumKeyInfo museum={mulino} id="info" />

      <section className={styles.gears} id="ruota" aria-labelledby="mulino-ruota">
        <div className={styles.wrap}>
          <Scarecrow name="legno" width="clamp(80px,9vw,120px)" left="calc(100% - 110px)" top="-70px" tilt={6} />
          <div className={styles.secHead}>
            <div>
              <span className={`${styles.label} ${styles.kicker}`}>Piano terra · locale molitura</span>
              <h2 id="mulino-ruota">Dalla ruota alla macina</h2>
            </div>
            <p>Un lungo canale, regolato da una chiusa a monte dell’edificio, porta l’acqua dal Brenta fino alla grande ruota di legno all’esterno. La ruota gira in verticale. Dentro, il lubecchio e la ruota a lanterna trasformano quel giro in una rotazione orizzontale, che arriva fino alle macine.</p>
          </div>
          <div className={styles.gearGrid}>
            <WaterWheel />
            <div className={styles.gearSide}>
              <figure className={styles.photo}>
                {/* eslint-disable-next-line @next/next/no-img-element -- foto già ottimizzata */}
                <img src={`${IMG}/ingranaggi.webp`} width={1500} height={1125} loading="lazy" alt="Ingranaggi del mulino: una grande puleggia di legno e una ruota dentata con denti di legno che ingrana con un pignone di ferro." />
                <figcaption>Gli ingranaggi di movimento sotto il castello, come sono oggi al piano terra.</figcaption>
              </figure>
              <p className={styles.note}>Sopra gli ingranaggi c’è il castello, un soppalco rialzato dove stanno i due mulini: quello a palmenti, con le macine di pietra, e quello a cilindri.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.journey} id="chicco" aria-labelledby="mulino-chicco">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <div>
              <span className={`${styles.label} ${styles.kicker}`}>Tre piani, un percorso</span>
              <h2 id="mulino-chicco">Il viaggio del chicco</h2>
            </div>
            <p>Nel mulino il grano non scende soltanto: sale, viene pulito, cade sulle macine e risale come farina. Scorri per seguirlo. I numeri sono quelli dei pannelli del museo; toccali per leggere il nome della macchina.</p>
          </div>
          <GrainJourney />
          <div className={styles.fromPanels}>
            <figure className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element -- foto già ottimizzata */}
              <img src={`${IMG}/soffitta.webp`} width={1050} height={1400} loading="lazy" alt="La soffitta del mulino: travi di legno, un lucernario, un elevatore a forma di casetta con una ruota, una scala a pioli e una vecchia bascula." />
              <figcaption>Il secondo piano oggi: l’elevatore a forma di casetta, il ventilabro e la bascula per pesare i sacchi.</figcaption>
            </figure>
            <figure className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element -- schizzo già ottimizzato */}
              <img src={`${IMG}/schizzo_buratti.webp`} width={1200} height={879} loading="lazy" alt="Schizzo a sanguigna del secondo piano con il ventilabro, i due buratti e gli elevatori, numerati da 10 a 13." />
              <figcaption>Lo schizzo del locale buratti dai pannelli del museo. Di questi elevatori i pannelli sottolineano la forma a casetta.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.scare} id="spaventapasseri" aria-labelledby="mulino-spaventapasseri">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <div>
              <span className={`${styles.label} ${styles.kicker}`}>La collezione Faganello</span>
              <h2 id="mulino-spaventapasseri">Cinquanta <em>spaventapasseri</em></h2>
            </div>
            <p>Nei primi anni Ottanta il fotografo Flavio Faganello girò le valli del Trentino per una ricerca etnografica sugli spaventapasseri, e li raccolse dai campi e dagli orti. Sono fatti con quello che c’era in casa: giacche smesse, sacchi, piatti di plastica, perfino un casco o una maschera da sub.</p>
          </div>
          <ScarecrowField />
          <div className={styles.ledger}>
            <div>
              <p>Fra il 1998 e il 2001 la raccolta fu esposta a Trento, nel Nord Italia e in Austria. Dal 2006 vive qui, nelle stanze della casa del mugnaio, insieme all’archivio fotografico della ricerca.</p>
              <p>Oltre agli spaventapasseri il museo conserva attrezzi agricoli, strumenti del lavoro femminile come le vecchie macchine da cucire e gli arcolai, e la sala dei giocattoli di Rosanna Cavallini: il mulino è stato lavoro, ma anche casa.</p>
            </div>
            <dl aria-label="La collezione in numeri">
              <div><dt>50</dt><dd>spaventapasseri: antropomorfi, girandole e meccanismi vari</dd></div>
              <div><dt>5.730</dt><dd>diapositive a colori</dd></div>
              <div><dt>2.138</dt><dd>negativi in bianco e nero 6×6</dd></div>
              <div><dt>998</dt><dd>stampe in bianco e nero 18×24</dd></div>
              <div><dt>466</dt><dd>stampe 20×20 e 13×20 da fotocolor</dd></div>
            </dl>
          </div>
          <div className={styles.photos}>
            <p className={styles.label}>Il museo in foto · tocca una foto per ingrandirla</p>
            <MuseumGallery images={museumPhotos} label="Foto del Mulino Angeli e degli spaventapasseri" />
          </div>
        </div>
      </section>

      <section className={styles.history} id="storia" aria-labelledby="mulino-storia">
        <div className={styles.wrap}>
          <Scarecrow name="grigio" width="clamp(56px,7vw,86px)" left="44%" top="-64px" tilt={-5} />
          <div className={styles.secHead}>
            <div>
              <span className={`${styles.label} ${styles.kicker}`}>Cronistoria</span>
              <h2 id="mulino-storia">Il mulino, anno per anno</h2>
            </div>
            <p>Di scritto resta pochissimo. La storia si ricostruisce da un decreto del 1909, dai ricordi della famiglia Angeli e dal lavoro di una classe elementare di Marter.</p>
          </div>
          <MillTimeline />
        </div>
      </section>

      <MuseumVisit
        museum={mulino}
        intro="Il mulino apre in primavera, estate e autunno. Fuori dagli orari di apertura gruppi e scuole possono prenotare una visita guidata, anche con un laboratorio: le proposte sono qui sotto."
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- schizzo dai pannelli del museo */}
        <img className={styles.sketchMulino} src={`${IMG}/schizzo_mulino.webp`} width={865} height={665} loading="lazy" alt="Schizzo del mulino con il canale, il muro in pietra e la ruota coperta." />
      </MuseumVisit>

      <section className={styles.school} id="scuole" aria-labelledby="mulino-scuole">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <div>
              <span className={`${styles.label} ${styles.kicker}`}>Progetto Giovani al museo</span>
              <h2 id="mulino-scuole">Scuole e <em>gruppi</em></h2>
            </div>
            <p>Il mulino è Centro di Esperienza della Rete trentina di educazione ambientale. Con le classi la visita è interattiva: si segue il chicco tra le macchine, si incontrano gli spaventapasseri e si entra nella sala dei giocattoli. Si prenota, anche fuori dagli orari di apertura.</p>
          </div>
          <ul className={styles.offers}>
            {schoolOffers.map((offer) => (
              <li key={offer.name}>
                <h3>{offer.name}</h3>
                <p>{offer.detail}</p>
                <p className={styles.price}><strong>{offer.price}</strong> a bambino</p>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Gratis per insegnanti, educatori e alunni certificati. Ai prezzi si aggiunge l’IVA quando serve la fattura.</p>
          <div className={styles.workshops}>
            <h3>I laboratori</h3>
            {workshops.map((group) => (
              <div key={group.when}>
                <p className={styles.label}>{group.when}</p>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
          {mulino.email && (
            <a className={styles.schoolCta} href={`mailto:${mulino.email}?subject=${encodeURIComponent("Visita al Mulino Angeli con la classe")}`}>
              Chiedi informazioni e prenota: {mulino.email}
            </a>
          )}
        </div>
      </section>

      <MuseumEvents events={events} title="Al Mulino Angeli" />

      <MuseumGettingThere
        museum={mulino}
        nearby={nearby}
        lead="Il mulino è a Marter, frazione di Roncegno Terme, sul lato monte del Brenta, vicino alla Tor Tonda. Passa accanto la pista ciclabile della Valsugana e sul retro c’è un parco giochi dove fermarsi per un picnic."
      />

      <section className={styles.next}>
        <p>L’altro museo di Roncegno</p>
        <h2>Il Museo degli Strumenti Musicali Popolari</h2>
        <div className={styles.nextActions}>
          <Link href="/musei/museo-della-musica">Museo degli Strumenti Musicali →</Link>
          <Link href="/musei">Tutti e due i musei →</Link>
        </div>
      </section>

      <div className={styles.credits}>
        <p>Testi e disegni dai pannelli del museo: Comune di Roncegno Terme, Provincia autonoma di Trento, Associazione triFOLIUM, con il contributo della Cassa Rurale di Roncegno. Cronistoria a cura di Antonella Serra, Biblioteca comunale (2011–2012). Documenti del 1909 per gentile concessione del signor Fernando Slomp.</p>
      </div>
      <SiteFooter settings={settings} />
    </main>
  );
}
