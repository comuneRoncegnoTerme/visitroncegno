"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../PageHeader";
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

type MediaResult = { data?: MediaItem[]; error?: string };

async function fetchMedia(signal?: AbortSignal) {
  const response = await fetch("/api/content-hub/media", {
    cache: "no-store",
    signal,
  });
  const result = (await response.json().catch(() => null)) as MediaResult | null;
  return { response, result };
}

function formatSize(value: string | number | null) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("it-IT");
    if (!normalized) return items;
    return items.filter((item) =>
      [item.title, item.filename_download, item.type]
        .filter(Boolean)
        .some((part) =>
          String(part).toLocaleLowerCase("it-IT").includes(normalized)
        )
    );
  }, [items, query]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchMedia(controller.signal)
      .then(({ response, result }) => {
        if (response.status === 401) {
          router.replace("/content-hub/login");
          return;
        }
        if (!response.ok) {
          setError(true);
          setMessage(result?.error ?? "Impossibile caricare i file");
          return;
        }
        setItems(result?.data ?? []);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(true);
        setMessage("Connessione interrotta durante il caricamento dei file");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  async function reload() {
    const { response, result } = await fetchMedia();
    if (response.status === 401) {
      router.replace("/content-hub/login");
      return;
    }
    if (!response.ok) throw new Error(result?.error ?? "Impossibile aggiornare la libreria");
    setItems(result?.data ?? []);
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage("Caricamento…");
    setError(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/content-hub/media", {
        method: "POST",
        body: form,
      });
      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/content-hub/login");
        return;
      }
      if (!response.ok) {
        setError(true);
        setMessage(result?.error ?? "Upload non riuscito");
        return;
      }

      formElement.reset();
      await reload();
      setMessage("File caricato correttamente.");
    } catch (reason) {
      setError(true);
      setMessage(
        reason instanceof Error ? reason.message : "Connessione interrotta durante l'upload"
      );
    } finally {
      setUploading(false);
    }
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setMessage(`ID copiato: ${id}`);
      setError(false);
    } catch {
      setMessage("Impossibile copiare automaticamente l'ID");
      setError(true);
    }
  }

  return (
    <main className={styles.page}>
      <PageHeader
        title="Immagini e file"
        intro="Foto, audio delle audioguide e tracce GPX. Quello che carichi qui si può poi scegliere in eventi, luoghi, percorsi e pannelli."
      />

      <form className={styles.upload} onSubmit={upload}>
        <label>
          <span>Titolo (facoltativo)</span>
          <input name="title" placeholder="Es. Piazza Montebello d’estate" />
        </label>
        <label className={styles.file}>
          <span>File</span>
          <input
            name="file"
            type="file"
            accept="image/*,audio/*,.gpx,application/gpx+xml"
            required
            disabled={uploading}
          />
        </label>
        <button type="submit" disabled={uploading}>
          {uploading ? "Caricamento…" : "Carica"}
        </button>
        {message && <p className={error ? styles.error : styles.success}>{message}</p>}
      </form>

      <div className={styles.toolbar}>
        <label>
          <span className={styles.srOnly}>Cerca tra i file</span>
          <input
            type="search"
            placeholder="Cerca per titolo o nome del file"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {!loading && (
          <span>
            {query
              ? `${filteredItems.length} di ${items.length} file`
              : `${items.length} file`}
          </span>
        )}
      </div>

      <section className={styles.grid}>
        {loading && <p className={styles.empty}>Caricamento…</p>}
        {!loading && filteredItems.length === 0 && (
          <p className={styles.empty}>Nessun file trovato.</p>
        )}
        {!loading &&
          filteredItems.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.preview}>
                {item.type?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/content-hub/media/${item.id}`} alt="" loading="lazy" />
                ) : item.type?.startsWith("audio/") ? (
                  <span>Audio</span>
                ) : (
                  <span>File</span>
                )}
              </div>
              <div className={styles.meta}>
                <strong>{item.title || item.filename_download}</strong>
                <small>
                  {[
                    item.filename_download.split(".").pop()?.toUpperCase(),
                    item.width && item.height ? `${item.width} × ${item.height}` : null,
                    formatSize(item.filesize),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
                <button type="button" onClick={() => copyId(item.id)} title={item.id}>
                  Copia ID
                </button>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}
