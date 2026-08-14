"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

const fields = [
  ["site_name", "Nome sito"],
  ["tagline", "Tagline"],
  ["footer_description", "Descrizione footer"],
  ["contact_email", "Email contatto"],
  ["contact_phone", "Telefono"],
  ["address", "Indirizzo"],
  ["facebook_url", "Facebook URL"],
  ["instagram_url", "Instagram URL"],
  ["default_seo_title", "Titolo SEO predefinito"],
  ["default_seo_description", "Descrizione SEO predefinita"],
  ["logo", "ID logo Directus"],
  ["logo_light", "ID logo chiaro Directus"],
  ["default_social_image", "ID immagine social predefinita"],
] as const;

export default function SettingsEditor() {
  const [data, setData] = useState<Record<string, string>>(Object.fromEntries(fields.map(([name]) => [name, ""])));
  const [message, setMessage] = useState("Caricamento…");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/content-hub/settings", { cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(true);
        setMessage(result?.error ?? "Impossibile caricare le impostazioni");
        return;
      }
      setData(Object.fromEntries(fields.map(([name]) => [name, String(result?.data?.[name] ?? "")])))
      setMessage("");
    })();
  }, []);

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
    setMessage("Impostazioni salvate in Directus.");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><p>Content Hub · Configurazione</p><h1>Impostazioni sito</h1><span>Contatti, identità e SEO predefinito gestiti dalla singleton site_settings di Directus.</span></div>
        <a href="/content-hub">← Dashboard</a>
      </header>
      <form className={styles.form} onSubmit={save}>
        {fields.map(([name, label]) => (
          <label key={name} className={name.includes("description") || name === "address" ? styles.full : undefined}>
            <span>{label}</span>
            {name.includes("description") ? (
              <textarea rows={4} value={data[name] ?? ""} onChange={(e) => setData((v) => ({ ...v, [name]: e.target.value }))} />
            ) : (
              <input value={data[name] ?? ""} onChange={(e) => setData((v) => ({ ...v, [name]: e.target.value }))} />
            )}
          </label>
        ))}
        <div className={styles.actions}>
          <button type="submit" disabled={saving}>{saving ? "Salvataggio…" : "Salva impostazioni"}</button>
          {message && <p className={error ? styles.error : styles.success}>{message}</p>}
        </div>
      </form>
    </main>
  );
}
