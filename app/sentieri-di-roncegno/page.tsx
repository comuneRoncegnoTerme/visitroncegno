import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/directus";
import { SENTIERI_ITINERARIES } from "@/lib/sentieri-project";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "I Sentieri di Roncegno tra storia e tradizione",
  description:
    "Il Circuito del Castagno e il Sentiero Cinque Valli: due itinerari con pannelli e QR tra castagneti, masi, acque termali, miniere e Grande Guerra.",
  path: "/sentieri-di-roncegno",
});

export default async function SentieriProjectPage() {
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <SiteHeader settings={settings} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Pannelli e QR sul territorio</p>
        <h1>I Sentieri di Roncegno tra storia e tradizione</h1>
        <p className={styles.lead}>
          Due itinerari con pannelli informativi. In quota raccontano la Grande Guerra, le vecchie miniere e gli
          ambienti naturali; sopra l’abitato di Roncegno la coltura dei castagneti, le tradizioni dei masi e la storia
          delle acque termali. Ogni pannello ha un QR che apre la sua scheda, spesso con l’audioguida.
        </p>
      </section>

      <section className={styles.itineraries} aria-label="Gli itinerari">
        {SENTIERI_ITINERARIES.map((itinerary) => (
          <article className={styles.itinerary} key={itinerary.id} id={itinerary.id}>
            <header className={styles.itineraryHeader}>
              <div>
                <h2>{itinerary.title}</h2>
                <p>{itinerary.summary}</p>
                <div className={styles.facts}>
                  {itinerary.facts.map((fact) => <span key={fact}>{fact}</span>)}
                </div>
              </div>
              <Link href={itinerary.routeHref} className={styles.routeLink}>Mappa e percorso →</Link>
            </header>
            <ol className={styles.panels}>
              {itinerary.panels.map((item) => (
                <li key={item.href + item.numbers}>
                  <Link href={item.href}>
                    <span className={styles.number}>Pannello {item.numbers}</span>
                    <strong>{item.title}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <section className={styles.funding} id="contributi" aria-labelledby="contributi-title">
        <h2 id="contributi-title">Contributi</h2>
        <h3>PSR 2014–2020 e GAL Trentino Orientale</h3>
        <p>
          Il progetto è stato realizzato grazie al contributo del Consiglio Direttivo del GAL che, nella seduta del
          21.12.2020 con Deliberazione n. 163, approva la concessione dell’aiuto per l’intervento “I Sentieri di
          Roncegno tra storia e tradizione”. Rientra nell’ambito dell’Azione 7.5 della Strategia di SLTP del GAL, bando
          annualità 2019.
        </p>
        <p>
          L’aiuto è stato concesso ai sensi del Regolamento (UE) n. 1305/2013 da parte del Fondo europeo agricolo per lo
          sviluppo rurale (FEASR) ed è cofinanziato dall’Unione Europea (per il 42,98%), dallo Stato (per il 39,914%) e
          dalla Provincia Autonoma di Trento (per il 17,106%) per un totale di € 89.074,13. L’intervento rientra nel
          regime di aiuti notificato e identificato dal codice SA. 52303 (2018/N) “Sostegno alle operazioni 7.5 e 7.6 del
          Programma di Sviluppo Rurale della Provincia autonoma di Trento attuate dai Gruppi di Azione Locale
          nell’ambito della Misura 19 - Leader”.
        </p>
        <h3>Altri contributi</h3>
        <p>
          Ai sensi dell’articolo 1, comma 125-quinquies, della L. 124/2017 si dichiara, per l’anno solare 2021,
          l’esistenza di aiuti oggetto di obbligo di pubblicazione nel{" "}
          <a href="https://www.rna.gov.it/" target="_blank" rel="noopener noreferrer">Registro nazionale degli aiuti di Stato</a>.
        </p>
        <p className={styles.taxId}>Comune di Roncegno Terme · C.F./P.IVA 00296510225</p>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}
