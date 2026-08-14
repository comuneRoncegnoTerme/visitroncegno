"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

type MediaItem = {
  id: string;
  title: string | null;
  filename_download: string;
  type: string | null;
  filesize: string | number | null;
  width: number | null;
  height: number | null;
  uploaded_on: string | null;
};

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/content-hub/media", { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(true);
      setMessage(result?.error ?? "Impossibile caricare i file");
    } else {
      setItems(result.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Caricamento…");
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/content-hub/media", { method: "POST", body: form });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(true);
      setMessage(result?.error ?? "Upload non riuscito");
      return;
    }
    setMessage(`File caricato. ID Directus: ${result?.data?.id ?? "ok"}`);
    event.currentTarget.reset();
    await load();
  }

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id);
    setMessage(`ID copiato: ${id}`);
    setError(false);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><p>Content Hub · Media</p><h1>Immagini, audio e GPX</h1><span>Carica asset direttamente in Directus e riutilizzali nei contenuti.</span></div>
        <a href="/content-hub">← Dashboard</a>
      </header>

      <form className={styles.upload} onSubmit={upload}>
        <label><span>Titolo</span><input name="title" placeholder="Titolo facoltativo" /></label>
        <label className={styles.file}><span>File</span><input name="file" type="file" accept="image/*,audio/*,.gpx,application/gpx+xml" required /></label>
        <button type="submit">Carica in Directus</button>
        {message && <p className={error ? styles.error : styles.success}>{message}</p>}
      </form>

      <section className={styles.grid}>
        {loading && <p>Caricamento libreria…</p>}
        {!loading && items.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.preview}>
              {item.type?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/content-hub/media/${item.id}`} alt="" />
              ) : item.type?.startsWith("audio/") ? <span>Audio</span> : <span>File</span>}
            </div>
            <div className={styles.meta}>
              <strong>{item.title || item.filename_download}</strong>
              <small>{item.filename_download}</small>
              <code>{item.id}</code>
              <button type="button" onClick={() => copyId(item.id)}>Copia ID</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
