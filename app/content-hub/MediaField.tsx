"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

export default function MediaField({ value, onChange, kind = "image" }: Props) {
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
      if (kind === "image" && !String(item.type ?? "").startsWith("image/")) return false;
      if (!normalized) return true;
      return [item.title, item.filename_download, item.id]
        .filter(Boolean)
        .some((part) => String(part).toLocaleLowerCase("it-IT").includes(normalized));
    });
  }, [items, kind, query]);

  async function loadMedia() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/content-hub/media", { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Impossibile caricare la libreria media");
      setLoading(false);
      return;
    }
    setItems(result?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (value || open) void loadMedia();
  }, [open, value]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.[^.]+$/, ""));

    const response = await fetch("/api/content-hub/media", { method: "POST", body: form });
    const result = await response.json().catch(() => null);
    setUploading(false);

    if (!response.ok) {
      setError(result?.error ?? "Caricamento non riuscito");
      return;
    }

    const uploaded = result?.data as MediaItem | undefined;
    if (uploaded?.id) {
      setItems((currentItems) => [uploaded, ...currentItems.filter((item) => item.id !== uploaded.id)]);
      onChange(uploaded.id);
      setOpen(false);
    }
  }

  const label = current?.title || current?.filename_download || (value ? `Media ${value}` : "Nessun media selezionato");

  return (
    <div className={styles.field}>
      {value ? (
        <div className={styles.selected}>
          {kind === "image" && <img src={`/api/content-hub/media/${value}`} alt="" />}
          <div>
            <strong>{label}</strong>
            <small>{current?.width && current?.height ? `${current.width} × ${current.height}px` : "Media Directus selezionato"}</small>
          </div>
          <button type="button" onClick={() => onChange(null)}>Rimuovi</button>
        </div>
      ) : (
        <div className={styles.empty}>Nessun media selezionato.</div>
      )}

      <div className={styles.controls}>
        <button type="button" onClick={() => setOpen((currentOpen) => !currentOpen)}>
          {open ? "Chiudi libreria" : "Scegli dalla libreria"}
        </button>
        <label className={styles.uploadButton}>
          {uploading ? "Caricamento…" : "Carica nuovo"}
          <input
            type="file"
            accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/svg+xml" : undefined}
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
                  {kind === "image" && <img src={`/api/content-hub/media/${item.id}`} alt="" loading="lazy" />}
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
