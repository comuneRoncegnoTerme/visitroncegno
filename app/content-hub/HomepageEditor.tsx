"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageContent } from "@/lib/directus";
import styles from "./editor.module.css";

interface HomepageEditorProps {
  homepage: HomepageContent;
}

export default function HomepageEditor({ homepage }: HomepageEditorProps) {
  const router = useRouter();
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
      highlights_eyebrow: homepage.highlights_eyebrow ?? "",
      highlights_title: homepage.highlights_title ?? "",
      highlights_description: homepage.highlights_description ?? "",
      highlights_link_label: homepage.highlights_link_label ?? "",
      highlights_link_url: homepage.highlights_link_url ?? "",
      map_eyebrow: homepage.map_eyebrow ?? "",
      map_title: homepage.map_title ?? "",
      map_description: homepage.map_description ?? "",
      map_primary_label: homepage.map_primary_label ?? "",
      map_primary_url: homepage.map_primary_url ?? "",
      map_secondary_label: homepage.map_secondary_label ?? "",
      map_secondary_url: homepage.map_secondary_url ?? "",
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
      setMessage("Modifiche salvate. La homepage pubblica usa già questi contenuti.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Connessione interrotta durante il salvataggio");
    }
  }

  return (
    <section className={styles.editor} id="homepage-editor">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Homepage · modifica diretta</p>
          <h2>Contenuti di apertura</h2>
          <p>Modifica i testi principali senza entrare nell’interfaccia tecnica di Directus.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className={styles.preview}>
          Apri homepage ↗
        </a>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
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

        <div className={styles.full}>
          <h3>Luoghi in evidenza</h3>
          <p>I tre contenuti arrivano dai Luoghi marcati come “in evidenza”. Qui controlli il racconto della sezione.</p>
        </div>

        <label>
          <span>Soprattitolo luoghi</span>
          <input name="highlights_eyebrow" defaultValue={initialValues.highlights_eyebrow} />
        </label>

        <label className={styles.full}>
          <span>Titolo luoghi</span>
          <input name="highlights_title" defaultValue={initialValues.highlights_title} />
        </label>

        <label className={styles.full}>
          <span>Descrizione luoghi</span>
          <textarea name="highlights_description" rows={4} defaultValue={initialValues.highlights_description} />
        </label>

        <label>
          <span>Testo link luoghi</span>
          <input name="highlights_link_label" defaultValue={initialValues.highlights_link_label} />
        </label>

        <label>
          <span>Destinazione link luoghi</span>
          <input name="highlights_link_url" defaultValue={initialValues.highlights_link_url} />
        </label>

        <div className={styles.full}>
          <h3>Cartina ed esplorazione</h3>
          <p>Call to action che collega la narrazione editoriale alla cartina illustrata e alla mappa operativa.</p>
        </div>

        <label>
          <span>Soprattitolo cartina</span>
          <input name="map_eyebrow" defaultValue={initialValues.map_eyebrow} />
        </label>

        <label className={styles.full}>
          <span>Titolo cartina</span>
          <input name="map_title" defaultValue={initialValues.map_title} />
        </label>

        <label className={styles.full}>
          <span>Descrizione cartina</span>
          <textarea name="map_description" rows={4} defaultValue={initialValues.map_description} />
        </label>

        <label>
          <span>Pulsante cartina illustrata</span>
          <input name="map_primary_label" defaultValue={initialValues.map_primary_label} />
        </label>

        <label>
          <span>Destinazione cartina illustrata</span>
          <input name="map_primary_url" defaultValue={initialValues.map_primary_url} />
        </label>

        <label>
          <span>Pulsante mappa interattiva</span>
          <input name="map_secondary_label" defaultValue={initialValues.map_secondary_label} />
        </label>

        <label>
          <span>Destinazione mappa interattiva</span>
          <input name="map_secondary_url" defaultValue={initialValues.map_secondary_url} />
        </label>

        <div className={styles.actions}>
          <button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Salvataggio…" : "Salva modifiche"}
          </button>
          {message && (
            <p className={status === "error" ? styles.error : styles.success}>
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
