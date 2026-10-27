"use client";

import { useState } from "react";
import styles from "@/components/museum/Museum.module.css";

const OPTIONS = {
  libera: {
    label: "Visita libera",
    points: [
      "Ingresso libero, negli orari di apertura.",
      "Si gira tra le sale al proprio ritmo, guardando gli strumenti da vicino.",
      "Adatta a una sosta breve, anche con bambini.",
    ],
  },
  guidata: {
    label: "Visita guidata",
    points: [
      "Su prenotazione, con un piccolo contributo.",
      "La guida racconta da dove vengono gli strumenti e come si suonano.",
      "Il percorso diventa interattivo: alcuni strumenti si possono provare.",
    ],
  },
} as const;

type Option = keyof typeof OPTIONS;

/** Due modi di visitare il museo, a confronto. */
export default function VisitChooser({ bookingHref }: { bookingHref: string | null }) {
  const [option, setOption] = useState<Option>("guidata");
  const current = OPTIONS[option];

  return (
    <div className={styles.chooser}>
      <div className={styles.toggle} role="group" aria-label="Tipo di visita">
        {(Object.keys(OPTIONS) as Option[]).map((key) => (
          <button key={key} type="button" aria-pressed={option === key} onClick={() => setOption(key)}>
            {OPTIONS[key].label}
          </button>
        ))}
      </div>
      <ul className={styles.chooserList} aria-live="polite">
        {current.points.map((point) => <li key={point}>{point}</li>)}
      </ul>
      {option === "guidata" && bookingHref && (
        <a className={styles.chooserCta} href={bookingHref}>Prenota una visita guidata</a>
      )}
    </div>
  );
}
