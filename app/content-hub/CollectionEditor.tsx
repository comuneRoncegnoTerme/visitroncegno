"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MediaField from "./MediaField";
import styles from "./collection-editor.module.css";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "datetime-local"
  | "checkbox"
  | "select"
  | "email"
  | "url"
  | "tel"
  | "media";

export type EditorField = {
  name: string;
  label: string;
  type?: FieldType;
  full?: boolean;
  required?: boolean;
  step?: string;
  help?: string;
  mediaKind?: "image" | "file";
  options?: { label: string; value: string }[];
};

type Item = Record<string, unknown> & {
  id: number;
  title?: string;
  slug?: string;
  status?: string;
  map_label?: string;
};

type Props = {
  collection: "events" | "places" | "routes";
  title: string;
  description: string;
  fields: EditorField[];
  previewBase?: string;
};

type CollectionResult = {
  data?: Item[];
  fields?: string[];
  error?: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toInputDate(value: unknown) {
  if (!value || typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function fetchCollection(
  collection: Props["collection"],
  signal?: AbortSignal
): Promise<{ response: Response; result: CollectionResult | null }> {
  const response = await fetch(`/api/content-hub/items/${collection}`, {
    cache: "no-store",
    signal,
  });
  const result = (await response.json().catch(() => null)) as CollectionResult | null;
  return { response, result };
}

export default function CollectionEditor({
  collection,
  title,
  description,
  fields,
  previewBase,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [availableFields, setAvailableFields] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({ status: "draft" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const visibleFields = useMemo(() => {
    if (!availableFields) return fields;
    const available = new Set(availableFields);
    return fields.filter((field) => available.has(field.name));
  }, [availableFields, fields]);

  const hiddenFieldCount = fields.length - visibleFields.length;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("it-IT");
    if (!normalizedQuery) return items;

    return items.filter((item) =>
      [item.title, item.slug, item.status, item.map_label]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("it-IT").includes(normalizedQuery)
        )
    );
  }, [items, query]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchCollection(collection, controller.signal)
      .then(({ response, result }) => {
        if (response.status === 401) {
          router.replace("/content-hub/login");
          return;
        }

        if (!response.ok) {
          setMessage(result?.error ?? "Impossibile caricare i contenuti");
          setStatus("error");
          return;
        }

        setItems(result?.data ?? []);
        setAvailableFields(Array.isArray(result?.fields) ? result.fields : null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("Impossibile caricare i contenuti");
        setStatus("error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [collection, router]);

  function selectItem(item: Item) {
    setSelectedId(item.id);
    setDraft({ ...item });
    setStatus("idle");
    setMessage("");
  }

  function createNew() {
    setSelectedId(null);
    setDraft({ status: "draft" });
    setStatus("idle");
    setMessage("");
  }

  function setField(name: string, value: unknown) {
    setDraft((current) => {
      const next = { ...current, [name]: value };
      if (
        name === "title" &&
        !selectedId &&
        !String(current.slug ?? "").trim()
      ) {
        next.slug = slugify(String(value ?? ""));
      }
      return next;
    });
  }

  async function refreshItems() {
    const { response, result } = await fetchCollection(collection);
    if (response.status === 401) {
      router.replace("/content-hub/login");
      return false;
    }
    if (!response.ok) return false;

    setItems(result?.data ?? []);
    setAvailableFields(Array.isArray(result?.fields) ? result.fields : null);
    return true;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const url = selectedId
      ? `/api/content-hub/items/${collection}/${selectedId}`
      : `/api/content-hub/items/${collection}`;

    try {
      const response = await fetch(url, {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
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

      const newId = result?.data?.id;
      if (!selectedId && newId) setSelectedId(Number(newId));

      await refreshItems();
      setStatus("saved");
      setMessage(selectedId ? "Modifiche salvate." : "Contenuto creato.");
    } catch {
      setStatus("error");
      setMessage("Connessione interrotta durante il salvataggio");
    }
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.listPane}>
        <div className={styles.listHeader}>
          <div>
            <span>{items.length} contenuti</span>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={createNew}>
            + Nuovo
          </button>
        </div>

        <div className={styles.searchBox}>
          <label htmlFor={`content-search-${collection}`}>Cerca</label>
          <input
            id={`content-search-${collection}`}
            type="search"
            value={query}
            placeholder="Titolo, slug, stato o tipologia"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && <span>{filteredItems.length} risultati</span>}
        </div>

        <div className={styles.items}>
          {loading && <p className={styles.muted}>Caricamento…</p>}
          {!loading &&
            filteredItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={selectedId === item.id ? styles.activeItem : styles.item}
                onClick={() => selectItem(item)}
              >
                <strong>{item.title || `#${item.id}`}</strong>
                <span>
                  {item.status === "published"
                    ? "Pubblicato"
                    : item.status === "archived"
                      ? "Archiviato"
                      : "Bozza"}
                  {" · "}
                  {item.map_label ? `${item.map_label} · ` : ""}
                  {item.slug}
                </span>
              </button>
            ))}
          {!loading && filteredItems.length === 0 && (
            <p className={styles.muted}>Nessun contenuto corrisponde alla ricerca.</p>
          )}
        </div>
      </aside>

      <section className={styles.editorPane}>
        <div className={styles.editorHeading}>
          <div>
            <p>{selected ? `Modifica #${selected.id}` : "Nuovo contenuto"}</p>
            <h1>{selected?.title || title}</h1>
            <span>{description}</span>
          </div>
          {selected && previewBase && selected.slug && (
            <a
              href={`${previewBase}/${selected.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Anteprima ↗
            </a>
          )}
        </div>

        {availableFields && hiddenFieldCount > 0 && (
          <p className={styles.schemaNotice}>
            {hiddenFieldCount} campi avanzati non sono ancora presenti nello schema Directus
            di questa installazione e vengono nascosti automaticamente.
          </p>
        )}

        <form className={styles.form} onSubmit={save}>
          {visibleFields.map((field) => {
            const value = draft[field.name];
            const className = field.full ? styles.full : undefined;

            if (field.type === "checkbox") {
              return (
                <label
                  key={field.name}
                  className={`${styles.checkbox} ${className ?? ""}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => setField(field.name, event.target.checked)}
                  />
                  <span>{field.label}</span>
                  {field.help && <small>{field.help}</small>}
                </label>
              );
            }

            if (field.type === "media") {
              return (
                <label key={field.name} className={className}>
                  <span>{field.label}</span>
                  <MediaField
                    value={String(value ?? "")}
                    kind={field.mediaKind ?? "image"}
                    onChange={(nextValue) => setField(field.name, nextValue)}
                  />
                  {field.help && <small>{field.help}</small>}
                </label>
              );
            }

            return (
              <label key={field.name} className={className}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={5}
                    required={field.required}
                    value={String(value ?? "")}
                    onChange={(event) => setField(field.name, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    required={field.required}
                    value={String(value ?? "")}
                    onChange={(event) => setField(field.name, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    step={field.step}
                    required={field.required}
                    value={
                      field.type === "datetime-local"
                        ? toInputDate(value)
                        : String(value ?? "")
                    }
                    onChange={(event) => {
                      if (field.type === "number") {
                        setField(
                          field.name,
                          event.target.value === "" ? null : Number(event.target.value)
                        );
                      } else {
                        setField(field.name, event.target.value);
                      }
                    }}
                  />
                )}
                {field.help && <small>{field.help}</small>}
              </label>
            );
          })}

          <div className={styles.actions}>
            <button type="submit" disabled={status === "saving"}>
              {status === "saving"
                ? "Salvataggio…"
                : selectedId
                  ? "Salva modifiche"
                  : "Crea contenuto"}
            </button>
            {message && (
              <p className={status === "error" ? styles.error : styles.success}>
                {message}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
