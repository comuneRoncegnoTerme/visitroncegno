"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageContent } from "@/lib/directus";
import styles from "./editor.module.css";

interface HomepageEditorProps {
  homepage: HomepageContent;
}

const textFields = [
  "hero_eyebrow",
  "hero_title",
  "hero_description",
  "hero_primary_label",
  "hero_primary_url",
  "hero_secondary_label",
  "hero_secondary_url",
  "routes_eyebrow",
  "routes_title",
  "routes_description",
  "routes_link_label",
  "routes_link_url",
  "identity_eyebrow",
  "identity_title",
  "identity_description",
  "identity_fact_1_value",
  "identity_fact_1_label",
  "identity_fact_2_value",
  "identity_fact_2_label",
  "identity_fact_3_value",
  "identity_fact_3_label",
  "highlights_eyebrow",
  "highlights_title",
  "highlights_description",
  "highlights_link_label",
  "highlights_link_url",
  "seasonal_eyebrow",
  "seasonal_title",
  "seasonal_description",
  "seasonal_primary_label",
  "seasonal_primary_url",
  "seasonal_secondary_label",
  "seasonal_secondary_url",
  "seasonal_note_small",
  "seasonal_note_strong",
  "events_eyebrow",
  "events_title",
  "events_description",
  "events_link_label",
  "events_link_url",
  "map_eyebrow",
  "map_title",
  "map_description",
  "map_primary_label",
  "map_primary_url",
  "map_secondary_label",
  "map_secondary_url",
  "memory_eyebrow",
  "memory_title",
  "memory_description",
  "memory_link_label",
  "memory_link_url",
  "planning_eyebrow",
  "planning_title",
  "planning_description",
  "closing_eyebrow",
  "closing_title",
  "closing_description",
  "closing_primary_label",
  "closing_primary_url",
  "closing_secondary_label",
  "closing_secondary_url",
] as const;

function fieldValue(homepage: HomepageContent, field: (typeof textFields)[number]) {
  return String(homepage[field] ?? "");
}

export default function HomepageEditor({ homepage }: HomepageEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const initialValues = useMemo(
    () => Object.fromEntries(textFields.map((field) => [field, fieldValue(homepage, field)])),
    [homepage]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload: Record<string, string | boolean> = Object.fromEntries(
      textFields.map((key) => [key, String(form.get(key) ?? "")])
    );
    payload.seasonal_enabled = form.get("seasonal_enabled") === "on";

    try {
      const response = await fetch("/api/content-hub/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/content-hub/login");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(result?.error ?? "Salvataggio non riuscito");
        return;
      }

      setStatus("saved");
      setMessage("Homepage aggiornata.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Connessione interrotta durante il salvataggio");
    }
  }

  const value = (name: (typeof textFields)[number]) => initialValues[name] ?? "";

  return (
    <section className={styles.editor} id="homepage-editor">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Homepage · regia editoriale</p>
          <h2>La homepage, sezione per sezione.</h2>
          <p>
            L’ordine qui sotto segue quello del sito pubblico. I contenuti automatici
            restano collegati alle relative raccolte; qui controlli testi, titoli e call to action.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className={styles.preview}>
          Apri homepage ↗
        </a>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>01</span>
            <div><small>Apertura</small><h3>Hero principale</h3><p>Il primo messaggio della homepage, sopra la fotografia o il media hero.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="hero_eyebrow" defaultValue={value("hero_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo principale</span><input name="hero_title" defaultValue={value("hero_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="hero_description" rows={4} defaultValue={value("hero_description")} /></label>
            <label><span>Pulsante principale</span><input name="hero_primary_label" defaultValue={value("hero_primary_label")} /></label>
            <label><span>Destinazione</span><input name="hero_primary_url" defaultValue={value("hero_primary_url")} /></label>
            <label><span>Pulsante secondario</span><input name="hero_secondary_label" defaultValue={value("hero_secondary_label")} /></label>
            <label><span>Destinazione</span><input name="hero_secondary_url" defaultValue={value("hero_secondary_url")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Automatico</strong><span>Il box “Prossimo appuntamento” usa il primo evento futuro pubblicato.</span><a href="/content-hub/eventi">Gestisci eventi →</a></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>02</span>
            <div><small>Navigazione rapida</small><h3>Scorciatoie tematiche</h3><p>Sentieri, terme, cultura, ristorazione, eventi e cartina.</p></div>
          </header>
          <div className={styles.automaticNote}><strong>Struttura</strong><span>Queste sei scorciatoie sono parte della navigazione stabile del sito e non richiedono gestione quotidiana.</span></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>03</span>
            <div><small>Esperienze da vivere</small><h3>Percorsi</h3><p>Testi introduttivi e collegamento all’archivio. Le tre card arrivano dai percorsi consigliati.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="routes_eyebrow" defaultValue={value("routes_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="routes_title" defaultValue={value("routes_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="routes_description" rows={3} defaultValue={value("routes_description")} /></label>
            <label><span>Testo link</span><input name="routes_link_label" defaultValue={value("routes_link_label")} /></label>
            <label><span>Destinazione</span><input name="routes_link_url" defaultValue={value("routes_link_url")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Contenuti</strong><span>Fino a tre percorsi con flag “recommended”, poi “featured” come fallback.</span><a href="/content-hub/percorsi">Gestisci percorsi →</a></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>04</span>
            <div><small>Identità</small><h3>Un paese, molti paesaggi</h3><p>La fascia che racconta in poche righe il carattere del territorio.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="identity_eyebrow" defaultValue={value("identity_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="identity_title" defaultValue={value("identity_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="identity_description" rows={3} defaultValue={value("identity_description")} /></label>
            <label><span>Dato 1</span><input name="identity_fact_1_value" defaultValue={value("identity_fact_1_value")} /></label>
            <label><span>Etichetta dato 1</span><input name="identity_fact_1_label" defaultValue={value("identity_fact_1_label")} /></label>
            <label><span>Dato 2</span><input name="identity_fact_2_value" defaultValue={value("identity_fact_2_value")} /></label>
            <label><span>Etichetta dato 2</span><input name="identity_fact_2_label" defaultValue={value("identity_fact_2_label")} /></label>
            <label><span>Dato 3</span><input name="identity_fact_3_value" defaultValue={value("identity_fact_3_value")} /></label>
            <label><span>Etichetta dato 3</span><input name="identity_fact_3_label" defaultValue={value("identity_fact_3_label")} /></label>
          </div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>05</span>
            <div><small>Da non perdere</small><h3>Luoghi in evidenza</h3><p>Il racconto della sezione; le tre card arrivano dai luoghi marcati in evidenza.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="highlights_eyebrow" defaultValue={value("highlights_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="highlights_title" defaultValue={value("highlights_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="highlights_description" rows={3} defaultValue={value("highlights_description")} /></label>
            <label><span>Testo link</span><input name="highlights_link_label" defaultValue={value("highlights_link_label")} /></label>
            <label><span>Destinazione</span><input name="highlights_link_url" defaultValue={value("highlights_link_url")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Contenuti</strong><span>Le card seguono i luoghi con flag “featured”.</span><a href="/content-hub/luoghi">Gestisci luoghi →</a></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>06</span>
            <div><small>Contenuto stagionale</small><h3>Banner speciale</h3><p>Usalo per Festa della Castagna o per un altro appuntamento forte. Puoi anche nasconderlo.</p></div>
          </header>
          <label className={styles.switchRow}>
            <input type="checkbox" name="seasonal_enabled" defaultChecked={homepage.seasonal_enabled ?? true} />
            <span><strong>Mostra il banner stagionale</strong><small>Disattivalo quando la campagna non è più attuale.</small></span>
          </label>
          <div className={styles.fields}>
            <label><span>Soprattitolo / data</span><input name="seasonal_eyebrow" defaultValue={value("seasonal_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="seasonal_title" defaultValue={value("seasonal_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="seasonal_description" rows={3} defaultValue={value("seasonal_description")} /></label>
            <label><span>Pulsante principale</span><input name="seasonal_primary_label" defaultValue={value("seasonal_primary_label")} /></label>
            <label><span>Destinazione</span><input name="seasonal_primary_url" defaultValue={value("seasonal_primary_url")} /></label>
            <label><span>Pulsante secondario</span><input name="seasonal_secondary_label" defaultValue={value("seasonal_secondary_label")} /></label>
            <label><span>Destinazione</span><input name="seasonal_secondary_url" defaultValue={value("seasonal_secondary_url")} /></label>
            <label><span>Nota breve</span><input name="seasonal_note_small" defaultValue={value("seasonal_note_small")} /></label>
            <label><span>Nota in evidenza</span><input name="seasonal_note_strong" defaultValue={value("seasonal_note_strong")} /></label>
          </div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>07</span>
            <div><small>Agenda</small><h3>Eventi a Roncegno</h3><p>Testi della sezione che introduce gli appuntamenti futuri.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="events_eyebrow" defaultValue={value("events_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="events_title" defaultValue={value("events_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="events_description" rows={3} defaultValue={value("events_description")} /></label>
            <label><span>Testo link</span><input name="events_link_label" defaultValue={value("events_link_label")} /></label>
            <label><span>Destinazione</span><input name="events_link_url" defaultValue={value("events_link_url")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Contenuti</strong><span>Le card mostrano automaticamente i prossimi eventi pubblicati.</span><a href="/content-hub/eventi">Gestisci eventi →</a></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>08</span>
            <div><small>Esplora il territorio</small><h3>Cartina e mappa</h3><p>Il richiamo che porta alla cartina illustrata e alla mappa operativa.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="map_eyebrow" defaultValue={value("map_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="map_title" defaultValue={value("map_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="map_description" rows={3} defaultValue={value("map_description")} /></label>
            <label><span>Pulsante cartina</span><input name="map_primary_label" defaultValue={value("map_primary_label")} /></label>
            <label><span>Destinazione</span><input name="map_primary_url" defaultValue={value("map_primary_url")} /></label>
            <label><span>Pulsante mappa</span><input name="map_secondary_label" defaultValue={value("map_secondary_label")} /></label>
            <label><span>Destinazione</span><input name="map_secondary_url" defaultValue={value("map_secondary_url")} /></label>
          </div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>09</span>
            <div><small>Storie e memoria</small><h3>Na vòlta a Ronzégno</h3><p>Il blocco narrativo dedicato alla memoria del paese.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="memory_eyebrow" defaultValue={value("memory_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="memory_title" defaultValue={value("memory_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="memory_description" rows={3} defaultValue={value("memory_description")} /></label>
            <label><span>Testo pulsante</span><input name="memory_link_label" defaultValue={value("memory_link_label")} /></label>
            <label><span>Destinazione</span><input name="memory_link_url" defaultValue={value("memory_link_url")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Archivio</strong><span>Le storie e i contenuti di memoria si gestiscono nella raccolta dedicata.</span><a href="/content-hub/storie">Gestisci storie →</a></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>10</span>
            <div><small>Organizza</small><h3>Pianifica la tua visita</h3><p>Introduzione alle quattro scorciatoie operative: arrivare, dormire, mangiare e servizi.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="planning_eyebrow" defaultValue={value("planning_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="planning_title" defaultValue={value("planning_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="planning_description" rows={3} defaultValue={value("planning_description")} /></label>
          </div>
          <div className={styles.automaticNote}><strong>Struttura</strong><span>Le quattro card puntano alle sezioni stabili di “Organizza la visita”.</span></div>
        </section>

        <section className={styles.block}>
          <header className={styles.blockHeading}>
            <span>11</span>
            <div><small>Chiusura</small><h3>Continua a esplorare</h3><p>L’ultima call to action prima del footer.</p></div>
          </header>
          <div className={styles.fields}>
            <label><span>Soprattitolo</span><input name="closing_eyebrow" defaultValue={value("closing_eyebrow")} /></label>
            <label className={styles.full}><span>Titolo</span><input name="closing_title" defaultValue={value("closing_title")} /></label>
            <label className={styles.full}><span>Descrizione</span><textarea name="closing_description" rows={3} defaultValue={value("closing_description")} /></label>
            <label><span>Pulsante principale</span><input name="closing_primary_label" defaultValue={value("closing_primary_label")} /></label>
            <label><span>Destinazione</span><input name="closing_primary_url" defaultValue={value("closing_primary_url")} /></label>
            <label><span>Pulsante secondario</span><input name="closing_secondary_label" defaultValue={value("closing_secondary_label")} /></label>
            <label><span>Destinazione</span><input name="closing_secondary_url" defaultValue={value("closing_secondary_url")} /></label>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Salvataggio…" : "Salva tutta la homepage"}
          </button>
          {message && <p className={status === "error" ? styles.error : styles.success}>{message}</p>}
        </div>
      </form>
    </section>
  );
}
