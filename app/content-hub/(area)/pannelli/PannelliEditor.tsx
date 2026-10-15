"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MediaField from "../MediaField";
import styles from "../collection-editor.module.css";

type Story = {
  id: number;
  status?: string;
  sort?: number | null;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string | null;
  image?: string | null;
  audio_file?: string | null;
  audio_title?: string | null;
  featured?: boolean;
  source_url?: string | null;
  source_label?: string | null;
};

type ListResult = { data?: Story[]; fields?: string[]; error?: string };
type SaveResult = { data?: Story; error?: string };

export default function PannelliEditor() {
  const router = useRouter();
  const [items, setItems] = useState<Story[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Story | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/content-hub/items/stories", { cache: "no-store" });
    const result = (await response.json().catch(() => null)) as ListResult | null;
    if (response.status === 401) {
      router.replace("/content-hub/login");
      return;
    }
    if (!response.ok) {
      setMessage(result?.error ?? "Impossibile caricare pannelli e contenuti");
      return;
    }
    const nextItems = result?.data ?? [];
    setItems(nextItems);
    setFields(result?.fields ?? []);
    if (selectedId) {
      const refreshed = nextItems.find((item) => item.id === selectedId);
      if (refreshed) setDraft(refreshed);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("it-IT");
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.slug, item.source_url]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("it-IT").includes(q))
    );
  }, [items, query]);

  const hasAudioFields = fields.includes("audio_file") && fields.includes("audio_title");
  const hasEditorialOrder = fields.includes("sort");
  const hasFeatured = fields.includes("featured");

  function select(item: Story) {
    setSelectedId(item.id);
    setDraft({ ...item });
    setMessage("");
  }

  function setField<K extends keyof Story>(field: K, value: Story[K]) {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  }

  async function save() {
    if (!draft || !selectedId) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/content-hub/items/stories/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(draft),
      });
      const result = (await response.json().catch(() => null)) as SaveResult | null;

      if (response.status === 401) {
        router.replace("/content-hub/login");
        return;
      }
      if (!response.ok) {
        setMessage(result?.error ?? "Salvataggio non riuscito");
        return;
      }

      const saved = result?.data ? { ...draft, ...result.data } : { ...draft };
      setDraft(saved);
      setItems((current) =>
        current.map((item) => item.id === selectedId ? saved : item)
      );
      setMessage("Modifiche salvate.");
    } catch {
      setMessage("Connessione interrotta durante il salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.listPane}>
        <div className={styles.listHeader}>
          <div><h2>Pannelli</h2><span>{items.length === 1 ? "1 scheda" : `${items.length} schede`}</span></div>
        </div>
        <div className={styles.searchBox}>
          <label htmlFor="panel-search" className={styles.srOnly}>Cerca</label>
          <input id="panel-search" type="search" value={query} placeholder="Cerca per titolo o indirizzo" onChange={(event) => setQuery(event.target.value)} />
          {query && <span>{filtered.length} risultati</span>}
        </div>
        <div className={styles.items}>
          {filtered.map((item) => (
            <button type="button" key={item.id} className={selectedId === item.id ? styles.activeItem : styles.item} onClick={() => select(item)}>
              <strong>{item.title || `#${item.id}`}</strong>
              <span>{item.slug}{item.source_url ? ` · ${item.source_url}` : ""}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.editorPane}>
        <div className={styles.editorHeading}>
          <div>
            <p>Pannelli e audioguide</p>
            <h1>{draft?.title ?? "Scegli un pannello"}</h1>
            <span>Queste schede corrispondono ai pannelli sui sentieri. Il QR stampato punta sempre allo stesso indirizzo: puoi cambiare testo, foto e audio senza toccarlo.</span>
          </div>
          {draft?.source_url && <a href={draft.source_url.replace("https://www.visitroncegno.it", "")} target="_blank" rel="noreferrer">Vedi sul sito</a>}
        </div>

        {!hasAudioFields && fields.length > 0 && (
          <p className={styles.schemaNotice}>I campi audio non sono ancora presenti in Directus. Esegui lo script di aggiornamento schema indicato nella PR; l’immagine resta già gestibile.</p>
        )}

        {draft ? (
          <div className={styles.form}>
            <label className={styles.full}>
              <span>Titolo</span>
              <input value={draft.title ?? ""} onChange={(event) => setField("title", event.target.value)} />
            </label>
            {hasEditorialOrder && (
              <label>
                <span>Ordine lungo il percorso</span>
                <input type="number" min="0" value={draft.sort ?? ""} onChange={(event) => setField("sort", event.target.value === "" ? null : Number(event.target.value))} />
                <small>Determina la sequenza con cui pannelli e approfondimenti vengono mostrati lungo il percorso.</small>
              </label>
            )}
            {hasFeatured && (
              <label className={styles.checkbox}>
                <input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setField("featured", event.target.checked)} />
                <span>Evidenza editoriale</span>
                <small>Vale nei contesti editoriali del sito; non altera l’ordine o la dimensione dei pannelli lungo un percorso.</small>
              </label>
            )}
            <label className={styles.full}>
              <span>Immagine del pannello o contenuto</span>
              <MediaField value={draft.image ?? ""} kind="image" onChange={(value) => setField("image", value)} />
              <small>Usata nella hero della scheda e nelle anteprime del percorso.</small>
            </label>
            {hasAudioFields && (
              <>
                <label className={styles.full}>
                  <span>File audioguida</span>
                  <MediaField value={draft.audio_file ?? ""} kind="audio" onChange={(value) => setField("audio_file", value)} />
                </label>
                <label className={styles.full}>
                  <span>Titolo audioguida</span>
                  <input value={draft.audio_title ?? ""} placeholder={`Ascolta: ${draft.title ?? "audioguida"}`} onChange={(event) => setField("audio_title", event.target.value)} />
                </label>
              </>
            )}
            <label className={styles.full}>
              <span>Descrizione breve</span>
              <textarea rows={4} value={draft.excerpt ?? ""} onChange={(event) => setField("excerpt", event.target.value)} />
            </label>
            <label className={styles.full}>
              <span>Testo</span>
              <textarea rows={12} value={draft.body ?? ""} onChange={(event) => setField("body", event.target.value)} />
            </label>
            <div className={styles.actions}>
              <button type="button" disabled={saving} onClick={() => void save()}>{saving ? "Salvataggio…" : "Salva modifiche"}</button>
              {message && <p className={message.includes("salvate") ? styles.success : styles.error}>{message}</p>}
            </div>
          </div>
        ) : (
          <p className={styles.muted}>Scegli un pannello dall’elenco.</p>
        )}
      </section>
    </div>
  );
}
