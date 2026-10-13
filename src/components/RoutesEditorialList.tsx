"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EditorialItem } from "@/lib/editorial";
import styles from "./RoutesIndex.module.css";

type Filter = "all" | "easy" | "moderate" | "family";

// L'URL dell'immagine arriva già calcolato dal server: qui (nel browser) l'indirizzo di Directus non è disponibile.
export type RouteListItem = EditorialItem & { imageUrl: string | null };

type Props = {
  items: RouteListItem[];
};

function normalizedDifficulty(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

// In Directus la difficoltà può essere salvata come codice (easy/medium/hard) o come testo italiano.
function isEasy(item: EditorialItem) {
  const value = normalizedDifficulty(item.difficulty);
  return value === "easy" || value.includes("facil");
}

function isModerate(item: EditorialItem) {
  const value = normalizedDifficulty(item.difficulty);
  return value === "medium" || value.includes("moderat") || value.includes("media");
}

function durationLabel(minutes?: number | null) {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining} min`;
  if (!remaining) return `${hours} h`;
  return `${hours} h ${remaining} min`;
}

function routeFacts(item: EditorialItem) {
  return [
    item.distance_km ? `${item.distance_km.toLocaleString("it-IT")} km` : null,
    durationLabel(item.duration_minutes),
    item.elevation_gain_m ? `+${item.elevation_gain_m} m` : null,
  ].filter(Boolean);
}

function RouteImage({ item, index }: { item: RouteListItem; index: number }) {
  const image = item.imageUrl;
  if (image) {
    return <div className={styles.image} style={{ backgroundImage: `url('${image}')` }} />;
  }

  return (
    <div className={`${styles.image} ${styles.imageFallback}`}>
      <span>{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

function parentId(item: EditorialItem) {
  const value = item.parent_route;
  if (typeof value === "number") return value;
  return value && typeof value === "object" ? value.id : null;
}

// Etichetta per i circuiti ("Circuito · 3 anelli") e per i loro anelli ("Anello del Circuito del Castagno").
type CircuitInfo = { label: string } | null;

function RouteCard({ item, index, featured = false, circuit = null }: { item: RouteListItem; index: number; featured?: boolean; circuit?: CircuitInfo }) {
  const facts = routeFacts(item);
  return (
    <Link className={`${styles.card} ${featured ? styles.featuredCard : ""}`} href={`/percorsi/${item.slug}`}>
      <RouteImage item={item} index={index} />
      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          {circuit ? <span className={styles.circuitTag}>{circuit.label}</span> : <span>{item.difficulty || "Percorso"}</span>}
          {item.family_friendly && <span>Adatto alle famiglie</span>}
        </div>
        <h2>{item.title}</h2>
        {(item.summary ?? item.route_highlight) && <p>{item.summary ?? item.route_highlight}</p>}
        {facts.length > 0 && (
          <div className={styles.facts} aria-label="Dati del percorso">
            {facts.map((fact) => <span key={fact}>{fact}</span>)}
          </div>
        )}
        <strong>Vai al percorso <span aria-hidden="true">→</span></strong>
      </div>
    </Link>
  );
}

export default function RoutesEditorialList({ items }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filters = useMemo(() => {
    const result: { id: Filter; label: string }[] = [{ id: "all", label: "Tutti" }];
    if (items.some(isEasy)) result.push({ id: "easy", label: "Facili" });
    if (items.some(isModerate)) result.push({ id: "moderate", label: "Moderati" });
    if (items.some((item) => item.family_friendly)) result.push({ id: "family", label: "Famiglie" });
    return result;
  }, [items]);

  const circuits = useMemo(() => {
    const titles = new Map(items.map((item) => [item.id, item.title]));
    const loopCount = new Map<number, number>();
    for (const item of items) {
      const parent = parentId(item);
      if (parent !== null) loopCount.set(parent, (loopCount.get(parent) ?? 0) + 1);
    }
    const result = new Map<number, CircuitInfo>();
    for (const item of items) {
      const parent = parentId(item);
      const count = loopCount.get(item.id);
      if (count) result.set(item.id, { label: `Circuito · ${count} ${count === 1 ? "anello" : "anelli"}` });
      else if (parent !== null && titles.has(parent)) result.set(item.id, { label: `Anello del ${titles.get(parent)}` });
    }
    return result;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (filter === "easy") return items.filter(isEasy);
    if (filter === "moderate") return items.filter(isModerate);
    if (filter === "family") return items.filter((item) => item.family_friendly);
    return items;
  }, [filter, items]);

  return (
    <>
      <div className={styles.toolbar}>
        <p><strong>{visibleItems.length}</strong> {visibleItems.length === 1 ? "percorso" : "percorsi"}</p>
        <div className={styles.filters} role="group" aria-label="Filtra i percorsi">
          {filters.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? styles.activeFilter : undefined}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.editorialGrid}>
        {visibleItems.map((item, index) => (
          <RouteCard item={item} index={index} featured={index === 0} circuit={circuits.get(item.id) ?? null} key={item.id} />
        ))}
      </div>
    </>
  );
}
