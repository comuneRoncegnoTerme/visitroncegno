"use client";

import { FormEvent, useEffect, useState } from "react";
import MediaField from "../MediaField";
import PageHeader from "../PageHeader";
import styles from "./page.module.css";

type FieldName =
  | "site_name"
  | "tagline"
  | "footer_description"
  | "contact_email"
  | "contact_phone"
  | "address"
  | "facebook_url"
  | "instagram_url"
  | "default_seo_title"
  | "default_seo_description"
  | "logo"
  | "logo_light"
  | "default_social_image";

type Field = {
  name: FieldName;
  label: string;
  kind?: "text" | "textarea" | "email" | "tel" | "url" | "media";
  full?: boolean;
  help?: string;
};

const sections: { title: string; text: string; fields: Field[] }[] = [
  {
    title: "Nome e logo",
    text: "Come si presenta il sito in alto e nel footer.",
    fields: [
      { name: "site_name", label: "Nome del sito" },
      { name: "tagline", label: "Sottotitolo" },
      { name: "logo", label: "Logo", kind: "media", full: true },
      { name: "logo_light", label: "Logo chiaro (su fondo scuro)", kind: "media", full: true },
    ],
  },
  {
    title: "Contatti",
    text: "Compaiono nel footer e nella pagina contatti.",
    fields: [
      { name: "contact_email", label: "Email", kind: "email" },
      { name: "contact_phone", label: "Telefono", kind: "tel" },
      { name: "address", label: "Indirizzo", full: true },
      { name: "footer_description", label: "Testo del footer", kind: "textarea", full: true },
    ],
  },
  {
    title: "Social",
    text: "Lascia vuoto un campo per nascondere l’icona.",
    fields: [
      { name: "facebook_url", label: "Pagina Facebook", kind: "url" },
      { name: "instagram_url", label: "Profilo Instagram", kind: "url" },
    ],
  },
  {
    title: "Google e condivisioni",
    text: "Usati quando una pagina non ha titolo, descrizione o immagine propri.",
    fields: [
      { name: "default_seo_title", label: "Titolo predefinito", full: true },
      {
        name: "default_seo_description",
        label: "Descrizione predefinita",
        kind: "textarea",
        full: true,
        help: "Circa 150 caratteri: è il testo che Google mostra sotto il titolo.",
      },
      {
        name: "default_social_image",
        label: "Immagine per le condivisioni",
        kind: "media",
        full: true,
        help: "Si vede quando un link al sito viene condiviso su WhatsApp o Facebook. Meglio orizzontale, 1200 × 630 px.",
      },
    ],
  },
];

const allFields = sections.flatMap((section) => section.fields.map((field) => field.name));

export default function SettingsEditor() {
  const [data, setData] = useState<Record<string, string>>(
    Object.fromEntries(allFields.map((name) => [name, ""]))
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/content-hub/settings", { cache: "no-store" });
      const result = await response.json().catch(() => null);
      setLoading(false);
      if (!response.ok) {
        setLoadError(result?.error ?? "Impossibile caricare le impostazioni");
        return;
      }
      setData(Object.fromEntries(allFields.map((name) => [name, String(result?.data?.[name] ?? "")])));
    })();
  }, []);

  function setField(name: FieldName, value: string) {
    setData((current) => ({ ...current, [name]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError(false);
    const response = await fetch("/api/content-hub/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) {
      setError(true);
      setMessage(result?.error ?? "Salvataggio non riuscito");
      return;
    }
    setMessage("Impostazioni salvate.");
  }

  return (
    <main className={styles.page}>
      <PageHeader
        title="Impostazioni del sito"
        intro="Nome, contatti, social e testi predefiniti. Valgono per tutte le pagine."
      />

      {loadError ? (
        <p className={`${styles.loading} ${styles.error}`}>{loadError}</p>
      ) : loading ? (
        <p className={styles.loading}>Caricamento…</p>
      ) : (
        <form className={styles.form} onSubmit={save}>
          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <header>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </header>
              <div className={styles.fields}>
                {section.fields.map((field) => {
                  const value = data[field.name] ?? "";
                  return field.kind === "media" ? (
                    <div className={`${styles.field} ${styles.full}`} key={field.name}>
                      <span>{field.label}</span>
                      <MediaField
                        value={value}
                        kind="image"
                        onChange={(next) => setField(field.name, next ?? "")}
                      />
                      {field.help && <small>{field.help}</small>}
                    </div>
                  ) : (
                    <label
                      className={`${styles.field} ${field.full ? styles.full : ""}`}
                      key={field.name}
                    >
                      <span>{field.label}</span>
                      {field.kind === "textarea" ? (
                        <textarea
                          rows={3}
                          value={value}
                          onChange={(event) => setField(field.name, event.target.value)}
                        />
                      ) : (
                        <input
                          type={field.kind === "url" ? "text" : field.kind ?? "text"}
                          inputMode={field.kind === "url" ? "url" : undefined}
                          placeholder={field.kind === "url" ? "https://…" : undefined}
                          value={value}
                          onChange={(event) => setField(field.name, event.target.value)}
                        />
                      )}
                      {field.help && <small>{field.help}</small>}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          <div className={styles.actions}>
            <button type="submit" disabled={saving}>
              {saving ? "Salvataggio…" : "Salva impostazioni"}
            </button>
            {message && <p className={error ? styles.error : styles.success}>{message}</p>}
          </div>
        </form>
      )}
    </main>
  );
}
