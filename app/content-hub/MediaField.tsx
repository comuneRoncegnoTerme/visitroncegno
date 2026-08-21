"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./media-field.module.css";

type MediaItem = {
  id: string;
  title?: string | null;
  filename_download?: string | null;
  type?: string | null;
  width?: number | null;
  height?: number | null;
};

type Props = {
  value: string;
  onChange: (value: string | null) => void;
  kind?: "image" | "file";
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

export default function MediaField({ value, onChange, kind = "image" }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const current = items.find((item) => item.id === value) ?? null;
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("it-IT");
    return items.filter((item) => {
      if (kind === "image" && !String(item.type ?? "").startsWith("image/")) {
        return false;
      }
      if (!normalized) return true;
      return [item.title, item.filename_download, item.id]
        .filter(Boolean)
        .some((part) =>
          String(part).toLocaleLowerCase("it-IT").includes(normalized)
        );
    });
  }, [items, kind, query]);

  useEffect(() => {
    if (!value || items.some((item) => item.id === value)) return;

    const controller = new AbortController();
    void fetchMedia(controller.signal)
      .then(({ response, result }) => {
        if (response.status === 401) {
          router.replace("/content-hub/login");
          return;
        }
        if (response.ok) setItems(result?.data ?? []);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [items, router, value]);

  async function loadMedia() {
    setLoading(true);
    setError("");

    try {
      const { response, result } = await fetchMedia();
      if (response.status === 401) {
        router.replace("/content-hub/login");
        return;
      }
      if (!response.ok) {
        setError(result?.error ?? "Impossibile caricare la libreria media");
        return;
      }
      setItems(result?.data ?? []);
    } catch {
      setError("Connessione interrotta durante il caricamento dei media");
    } finally {
      setLoading(false);
    }
  }

  function toggleLibrary() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && items.length === 0) void loadMedia();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.[^.]+$/, ""));

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
        setError(result?.error ?? "Caricamento non riuscito");
        return;
      }

      const uploaded = result?.data as MediaItem | undefined;
      if (uploaded?.id) {
        setItems((currentItems) => [
          uploaded,
          ...currentItems.filter((item) => item.id !== uploaded.id),
        ]);
        onChange(uploaded.id);
        setOpen(false);
      }
    } catch {
      setError("Connessione interrotta durante il caricamento");
    } finally {
      setUploading(false);
    }
  }

  const label =
    current?.title ||
    current?.filename_download ||
    (value ? `Media ${value}` : "Nessun media selezionato");

  return (
    <div className={styles.field}>
      {value ? (
        <div className={styles.selected}>
          {kind === "image" && (
            // Directus asset proxy requires authenticated Content Hub access.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/content-hub/media/${value}`} alt="" />
          )}
          <div>
            <strong>{label}</strong>
            <small>
              {current?.width && current?.height
                ? `${current.width} × ${current.height}px`
                : "Media Directus selezionato"}
            </small>
          </div>
          <button type="button" onClick={() => onChange(null)}>
            Rimuovi
          </button>
        </div>
      ) : (
        <div className={styles.empty}>Nessun media selezionato.</div>
      )}

      <div className={styles.controls}>
        <button type="button" onClick={toggleLibrary}>
          {open ? "Chiudi libreria" : "Scegli dalla libreria"}
        </button>
        <label className={styles.uploadButton}>
          {uploading ? "Caricamento…" : "Carica nuovo"}
          <input
            type="file"
            accept={
              kind === "image"
                ? "image/jpeg,image/png,image/webp,image/svg+xml"
                : undefined
            }
            disabled={uploading}
            onChange={upload}
          />
        </label>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {open && (
        <div className={styles.library}>
          <input
            className={styles.search}
            type="search"
            placeholder="Cerca nei media…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {loading ? (
            <p>Caricamento media…</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((item) => (
                <button
                  type="button"
                  className={item.id === value ? styles.activeMedia : styles.media}
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  {kind === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/content-hub/media/${item.id}`}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <span>{item.title || item.filename_download || item.id}</span>
                </button>
              ))}
              {!filtered.length && <p>Nessun media corrispondente.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
