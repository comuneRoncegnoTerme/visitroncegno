"use client";

import { useRef } from "react";
import styles from "./page.module.css";

type Year = { year: string; until?: string; text: string; key?: boolean; decree?: boolean };

const YEARS: Year[] = [
  { year: "1751", text: "Nel catasto di Roncegno compare un edificio chiamato Molino dell’Anzoleto." },
  { year: "1880", text: "La Camera di Commercio di Rovereto conta otto mugnai al lavoro sul territorio di Roncegno." },
  { year: "1906", text: "Secondo i ricordi della famiglia, il mugnaio è Antonio Angeli fino al 1906. Poi i figli Federico e Venanzio, fino al 1958; l’ultimo è Guglielmo Iobstraibizer, morto nel 1959." },
  { year: "1909", text: "Il Giudizio distrettuale di Borgo divide l’eredità di Pietro Slomp e descrive il mulino stanza per stanza. È l’unico documento scritto che resta.", key: true, decree: true },
  { year: "1933", until: "–1935", text: "Gli scavi per abbassare e rinforzare il letto del Brenta contro le esondazioni. Le fotografie dei cantieri sono esposte al mulino." },
  { year: "1994", text: "Le classi quarta e quinta della scuola elementare di Marter dedicano al mulino una ricerca nel loro giornalino. Le incoraggia l’etnografo Giuseppe Šebesta: il mulino va salvato." },
  { year: "1995", text: "Il 25 settembre il Comune di Roncegno Terme compra il vecchio mulino dagli eredi Angeli." },
  { year: "1998", text: "Arrivano un finanziamento provinciale e fondi europei, con un vincolo: l’edificio diventerà un museo." },
  { year: "1999", text: "Inizia il restauro su progetto dell’architetto Giorgio Losi di Arco. I lavori durano fino al 2004 e i macchinari vengono restaurati per essere esposti." },
  { year: "2005", text: "L’architetto Paolo Bertotti di Trento progetta l’allestimento, con lo studio di Arrigo Rudi e Simone Barnaba di Verona." },
  { year: "2006", text: "Il 16 luglio il museo apre al pubblico con il nome di Mulino Angeli, la casa degli spaventapasseri.", key: true },
  { year: "2007", text: "Diventa Centro di Esperienza della Rete trentina di educazione ambientale." },
];

function Cup() {
  return (
    <svg className={styles.cup} viewBox="0 0 46 44" aria-hidden="true">
      <path d="M23 0 V14" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M8 16 H38 L33 40 H13 Z" fill="color-mix(in srgb, var(--grano) 28%, transparent)" stroke="var(--sangue)" strokeWidth="1.3" />
      <path d="M11 22 H35" stroke="var(--sangue)" strokeWidth=".7" />
    </svg>
  );
}

/** La cronistoria come la cinghia di un elevatore: una tazeta per ogni anno, scorre in orizzontale. */
export default function MillTimeline() {
  const beltRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);

  function scrollBelt(direction: 1 | -1) {
    const belt = beltRef.current;
    const width = belt?.querySelector("li")?.getBoundingClientRect().width ?? 280;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    belt?.scrollBy({ left: direction * width * 1.5, behavior: reduce ? "auto" : "smooth" });
  }

  // Col mouse la cinghia si trascina; al tocco scorre da sé.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const belt = beltRef.current;
    if (!belt || event.pointerType !== "mouse" || (event.target as Element).closest("button")) return;
    drag.current = { x: event.clientX, scroll: belt.scrollLeft };
    belt.setAttribute("data-dragging", "");
    belt.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current && beltRef.current) beltRef.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
  }
  function onPointerUp() {
    drag.current = null;
    beltRef.current?.removeAttribute("data-dragging");
  }

  return (
    <>
      <div className={styles.beltNav}>
        <button className={styles.btn} type="button" onClick={() => scrollBelt(-1)} aria-label="Anni precedenti">←</button>
        <button className={styles.btn} type="button" onClick={() => scrollBelt(1)} aria-label="Anni successivi">→</button>
      </div>
      <div
        ref={beltRef}
        className={styles.belt}
        tabIndex={0}
        role="region"
        aria-label="Cronistoria, scorre in orizzontale"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ol>
          {YEARS.map((item) => (
            <li key={item.year} data-key={item.key || undefined}>
              <Cup />
              <div className={styles.yr}>{item.year}{item.until && <small>{item.until}</small>}</div>
              <p>{item.text}</p>
              {item.decree && (
                <button className={styles.linkbtn} type="button" onClick={() => dialogRef.current?.showModal()}>Leggi il decreto</button>
              )}
            </li>
          ))}
        </ol>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.sheet}
        aria-labelledby="decreto-titolo"
        onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className={styles.sheetRow}>
          <h3 id="decreto-titolo">Decreto di aggiudicazione, 1909</h3>
          <button className={styles.mini} type="button" onClick={() => dialogRef.current?.close()}>Chiudi</button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- scansione del documento nel dialogo */}
        <img src="/images/musei/mulino-angeli/decreto1909.webp" width={1600} height={652} loading="lazy" alt="Tre fogli manoscritti del 1909 con bollo e timbro del Giudizio distrettuale di Borgo." />
        <blockquote>
          «Casa di abitazione ai Brustolai di Roncegno part. edif. 502 consistente a piano terra in edificio da molino con 2 macine, pestino e mulinello, stalla e cantina a volto reale, altro avvolto a travatura e portico con annesso verso il Brenta locale per le ruote, che servono per il macinamento del molino […]»
          <br /><br />stim. Corone 6000
        </blockquote>
        <p className={styles.note}>I. R. Giudizio distrettuale, Borgo, 13 settembre 1909. È la ripartizione dell’eredità di Pietro Slomp fu Antonio, morto il 9 marzo 1909. Originali per gentile concessione del signor Fernando Slomp.</p>
      </dialog>
    </>
  );
}
