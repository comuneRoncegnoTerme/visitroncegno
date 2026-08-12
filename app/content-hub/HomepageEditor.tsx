"use client";

import { FormEvent, useMemo, useState } from "react";
import type { HomepageContent } from "@/lib/directus";
import styles from "./editor.module.css";

interface HomepageEditorProps {
  homepage: HomepageContent;
}

export default function HomepageEditor({ homepage }: HomepageEditorProps) {
  const [editorKey, setEditorKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const initialValues = useMemo(
    () => ({
      hero_eyebrow: homepage.hero_eyebrow ?? "",
      hero_title: homepage.hero_title ?? "",
      hero_description: homepage.hero_description ?? "",
      hero_primary_label: homepage.hero_primary_label ?? "",
      hero_primary_url: homepage.hero_primary_url ?? "",
      hero_secondary_label: homepage.hero_secondary_label ?? "",
      hero_secondary_url: homepage.hero_secondary_url ?? "",
    }),
    [homepage]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      Object.keys(initialValues).map((key) => [key, String(form.get(key) ?? "")])
    );

    const response = await fetch("/api/content-hub/homepage", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-editor-key": editorKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setMessage(result?.error ?? "Salvataggio non riuscito");
      return;
    }

    setStatus("saved");
    setMessage("Modifiche salvate in Directus. La homepage pubblica usa già questi contenuti.");
  }

  return (
    <section className={styles.editor} id="homepage-editor">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Homepage · modifica reale</p>
          <h2>Contenuti di apertura</h2>
          <p>
            Modifica i testi principali senza entrare nell’interfaccia tecnica di Directus.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className={styles.preview}>
          Apri homepage ↗
        </a>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.full}>
          <span>Codice redazione</span>
          <input
            type="password"
            value={editorKey}
            onChange={(event) => setEditorKey(event.target.value)}
            autoComplete="off"
            required
            placeholder="Inserisci il codice editoriale"
          />
          <small>Serve solo per autorizzare il salvataggio dal prototipo.</small>
        </label>

        <label>
          <span>Soprattitolo</span>
          <input name="hero_eyebrow" defaultValue={initialValues.hero_eyebrow} />
        </label>

        <label className={styles.full}>
          <span>Titolo principale</span>
          <input name="hero_title" defaultValue={initialValues.hero_title} />
        </label>

        <label className={styles.full}>
          <span>Descrizione</span>
          <textarea
            name="hero_description"
            rows={5}
            defaultValue={initialValues.hero_description}
          />
        </label>

        <label>
          <span>Pulsante principale</span>
          <input name="hero_primary_label" defaultValue={initialValues.hero_primary_label} />
        </label>

        <label>
          <span>Destinazione pulsante principale</span>
          <input name="hero_primary_url" defaultValue={initialValues.hero_primary_url} />
        </label>

        <label>
          <span>Pulsante secondario</span>
          <input name="hero_secondary_label" defaultValue={initialValues.hero_secondary_label} />
        </label>

        <label>
          <span>Destinazione pulsante secondario</span>
          <input name="hero_secondary_url" defaultValue={initialValues.hero_secondary_url} />
        </label>

        <div className={styles.actions}>
          <button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Salvataggio…" : "Salva modifiche"}
          </button>
          {message && (
            <p className={status === "error" ? styles.error : styles.success}>{message}</p>
          )}
        </div>
      </form>
    </section>
  );
}
