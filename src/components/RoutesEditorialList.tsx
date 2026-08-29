"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getDirectusAssetUrl } from "@/lib/directus";
import type { EditorialItem } from "@/lib/editorial";
import styles from "./RoutesIndex.module.css";

type Filter = "all" | "easy" | "moderate" | "family";

type Props = {
  items: EditorialItem[];
};

function normalizedDifficulty(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isEasy(item: EditorialItem) {
  return normalizedDifficulty(item.difficulty).includes("facil");
}

function isModerate(item: EditorialItem) {
  const value = normalizedDifficulty(item.difficulty);
  return value.includes("moderat") || value.includes("media");
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
    item.distance_km ? `${item.distance_km} km` : null,
    durationLabel(item.duration_minutes),
    item.elevation_gain_m ? `+${item.elevation_gain_m} m` : null,
  ].filter(Boolean);
}

function RouteImage({ item, index }: { item: EditorialItem; index: number }) {
  const image = getDirectusAssetUrl(item.image);
  if (image) {
    return <div className={styles.image} style={{ backgroundImage: `url('${image}')` }} />;
  }

  return (
    <div className={`${styles.image} ${styles.imageFallback}`}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <small>Immagine in arrivo</small>
    </div>
  );
}

function RouteCard({ item, index, featured = false }: { item: EditorialItem; index: number; featured?: boolean }) {
  const facts = routeFacts(item);
  return (
    <Link className={`${styles.card} ${featured ? styles.featuredCard : ""}`} href={`/percorsi/${item.slug}`}>
      <RouteImage item={item} index={index} />
      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span>{item.difficulty || "Percorso"}</span>
          {item.family_friendly && <span>Adatto alle famiglie</span>}
        </div>
        <h2>{item.title}</h2>
        <p>{item.summary ?? item.route_highlight ?? "Scopri informazioni, dettagli e consigli utili per questo percorso."}</p>
        {facts.length > 0 && (
          <div className={styles.facts} aria-label="Dati del percorso">
            {facts.map((fact) => <span key={fact}>{fact}</span>)}
          </div>
        )}
        <strong>Scopri il percorso <span aria-hidden="true">→</span></strong>
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
          <RouteCard item={item} index={index} featured={index === 0} key={item.id} />
        ))}
      </div>
    </>
  );
}
