"use client";

import { useState } from "react";
import styles from "@/components/museum/Museum.module.css";

type System = "palmenti" | "cilindri";

const SYSTEMS: Record<System, { label: string; grain: string }> = {
  palmenti: { label: "Frumento · palmenti", grain: "il frumento" },
  cilindri: { label: "Mais · cilindri", grain: "il mais" },
};

const STEPS: { title: string; text: (system: System) => string }[] = [
  {
    title: "Spulatura",
    text: (system) => `Prima della macina ${SYSTEMS[system].grain} viene ripulito da pula, polvere e impurità. Nastri convettori e saliscendi lo portano da un piano all’altro dell’edificio.`,
  },
  {
    title: "Macinazione",
    text: (system) => system === "palmenti"
      ? "Il frumento passa tra due macine di pietra, il palmento: quella superiore gira, quella inferiore resta ferma. È il sistema tradizionale, il più antico del mulino."
      : "Il mais viene frantumato tra coppie di cilindri che girano in senso opposto, in più passaggi successivi. È il sistema più moderno conservato nel mulino.",
  },
  {
    title: "Setacciatura",
    text: () => "Setacci e buratti separano la farina dalla crusca e dividono le macinature per finezza.",
  },
  {
    title: "Insaccatura",
    text: (system) => `Alla fine del percorso la farina di ${system === "palmenti" ? "frumento" : "mais"} scende nei sacchi, pronta per essere consegnata.`,
  },
];

/** Il percorso del grano dentro il mulino, fase per fase, per i due sistemi molitori. */
export default function GrainJourney() {
  const [system, setSystem] = useState<System>("palmenti");
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className={styles.journey}>
      <div className={styles.toggle} role="group" aria-label="Sistema molitorio">
        {(Object.keys(SYSTEMS) as System[]).map((key) => (
          <button key={key} type="button" aria-pressed={system === key} onClick={() => setSystem(key)}>
            {SYSTEMS[key].label}
          </button>
        ))}
      </div>

      <ol className={styles.steps} role="tablist" aria-label="Fasi della lavorazione">
        {STEPS.map((item, index) => (
          <li key={item.title} role="presentation">
            <button
              type="button"
              role="tab"
              id={`fase-${index}`}
              aria-selected={step === index}
              aria-controls="fase-pannello"
              data-done={index < step || undefined}
              onClick={() => setStep(index)}
            >
              <span>{index + 1}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.stepPanel} role="tabpanel" id="fase-pannello" aria-labelledby={`fase-${step}`} aria-live="polite">
        <strong className={styles.stepNumber}>0{step + 1}</strong>
        <div>
          <h3>{current.title}</h3>
          <p>{current.text(system)}</p>
        </div>
      </div>

      <div className={styles.stepNav}>
        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0}>← Fase precedente</button>
        <button type="button" onClick={() => setStep(step + 1)} disabled={step === STEPS.length - 1}>Fase successiva →</button>
      </div>
    </div>
  );
}
