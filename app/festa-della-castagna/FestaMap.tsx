"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LngLatBounds, Map, Marker, NavigationControl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { configureMapLibreWorker } from "@/lib/maplibre-worker";
import styles from "./FestaMap.module.css";

export type FestaCategory = "food" | "events" | "kids" | "see" | "parking" | "shuttle" | "services";

export type FestaPoint = {
  id: string;
  category: FestaCategory;
  name: string;
  text: string | null;
  menu: string[];
  lat: number;
  lng: number;
};

type Filter = "all" | FestaCategory;

const CATEGORIES: Record<FestaCategory, { label: string; singular: string }> = {
  food: { label: "Mangiare e bere", singular: "Stand gastronomico" },
  events: { label: "Eventi", singular: "Evento" },
  kids: { label: "Bambini", singular: "Per i bambini" },
  see: { label: "Da vedere", singular: "Da vedere" },
  parking: { label: "Parcheggi", singular: "Parcheggio" },
  shuttle: { label: "Navetta", singular: "Navetta" },
  services: { label: "Servizi", singular: "Servizi" },
};

// Icone essenziali disegnate a tratto (24×24), bianche sul colore della categoria.
const ICONS: Record<FestaCategory, string> = {
  food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 1.2-3 3.5-3 6v4h3"/>',
  events: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  kids: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9.5 18h5"/>',
  see: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
  parking: '<path d="M8 20V4h5a4.5 4.5 0 0 1 0 9H8"/>',
  shuttle: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M8 20v-3M16 20v-3"/>',
  services: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4M12 16h.01"/>',
};

function iconSvg(category: FestaCategory) {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[category]}</svg>`;
}

function directionsHref(point: FestaPoint) {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=walking`;
}

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.35, "raster-brightness-max": 0.96 } }],
};

export default function FestaMap({ points }: { points: FestaPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef(new globalThis.Map<string, HTMLButtonElement>());
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const result = {} as Record<FestaCategory, number>;
    for (const point of points) result[point.category] = (result[point.category] ?? 0) + 1;
    return result;
  }, [points]);
  const filters = (Object.keys(CATEGORIES) as FestaCategory[]).filter((category) => counts[category]);
  const visible = useMemo(() => (filter === "all" ? points : points.filter((p) => p.category === filter)), [filter, points]);
  const selected = points.find((point) => point.id === selectedId) ?? null;

  // La mappa si crea una volta; i filtri mostrano o nascondono i segnaposto.
  useEffect(() => {
    if (!containerRef.current) return;
    configureMapLibreWorker();
    const map = new Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [11.4105, 46.0505],
      zoom: 16,
      minZoom: 12,
      maxZoom: 19,
      cooperativeGestures: window.matchMedia("(pointer: coarse)").matches,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.touchZoomRotate.disableRotation();

    const markers = markersRef.current;
    for (const point of points) {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `festa-marker festa-marker-${point.category}`;
      element.setAttribute("aria-label", `${point.name} (${CATEGORIES[point.category].singular})`);
      element.innerHTML = iconSvg(point.category);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        setSelectedId(point.id);
      });
      markers.set(point.id, element);
      new Marker({ element, anchor: "center" }).setLngLat([point.lng, point.lat]).addTo(map);
    }
    map.on("click", () => setSelectedId(null));

    const resize = new ResizeObserver(() => map.resize());
    resize.observe(containerRef.current);
    return () => {
      resize.disconnect();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  // Filtro: segnaposto visibili e inquadratura sui punti della categoria.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const visibleIds = new Set(visible.map((point) => point.id));
    for (const [id, element] of markersRef.current) element.classList.toggle("is-hidden", !visibleIds.has(id));
    const bounds = new LngLatBounds();
    for (const point of visible) bounds.extend([point.lng, point.lat]);
    if (bounds.isEmpty()) return;
    const fit = () => map.fitBounds(bounds, { padding: 56, maxZoom: 17.2, duration: 500 });
    if (map.loaded()) fit();
    else map.once("load", fit);
  }, [visible]);

  // Selezione: segnaposto evidenziato e mappa centrata sul punto.
  useEffect(() => {
    for (const [id, element] of markersRef.current) element.classList.toggle("is-active", id === selectedId);
    const map = mapRef.current;
    if (!map || !selected) return;
    map.easeTo({ center: [selected.lng, selected.lat], zoom: Math.max(map.getZoom(), 17), duration: 450 });
  }, [selected, selectedId]);

  function choose(next: Filter) {
    setFilter(next);
    setSelectedId(null);
  }

  return (
    <div className={styles.shell}>
      <div className={styles.filters} role="group" aria-label="Filtra i punti della mappa">
        <button type="button" aria-pressed={filter === "all"} onClick={() => choose("all")}>
          Tutto <span>{points.length}</span>
        </button>
        {filters.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={filter === category}
            onClick={() => choose(category)}
            data-category={category}
          >
            <i aria-hidden="true" />
            {CATEGORIES[category].label} <span>{counts[category]}</span>
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.mapFrame}>
          <div ref={containerRef} className={styles.map} role="region" aria-label="Mappa della Festa della Castagna" />
        </div>

        <aside className={styles.panel} aria-live="polite">
          {selected ? (
            <article className={styles.detail}>
              <button type="button" className={styles.back} onClick={() => setSelectedId(null)}>
                ← {filter === "all" ? "Tutti i punti" : CATEGORIES[filter].label}
              </button>
              <p className={styles.kicker} data-category={selected.category}>
                <i aria-hidden="true" />
                {CATEGORIES[selected.category].singular}
              </p>
              <h3>{selected.name}</h3>
              {selected.text && <p>{selected.text}</p>}
              {selected.menu.length > 0 && (
                <>
                  <h4>Menù</h4>
                  <ul className={styles.menu}>
                    {selected.menu.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </>
              )}
              <a className={styles.directions} href={directionsHref(selected)} target="_blank" rel="noopener noreferrer">
                Indicazioni a piedi ↗
              </a>
            </article>
          ) : (
            <>
              <p className={styles.panelHint}>
                {filter === "all"
                  ? "Tocca un punto sulla mappa o scegli una categoria."
                  : `${visible.length} ${visible.length === 1 ? "punto" : "punti"}: ${CATEGORIES[filter].label.toLowerCase()}`}
              </p>
              <ul className={styles.list}>
                {visible.map((point) => (
                  <li key={point.id}>
                    <button type="button" onClick={() => setSelectedId(point.id)} data-category={point.category}>
                      <i aria-hidden="true" />
                      <span>
                        <strong>{point.name}</strong>
                        {point.menu.length > 0 ? (
                          <small>{point.menu.slice(0, 3).join(" · ")}{point.menu.length > 3 ? " …" : ""}</small>
                        ) : point.text ? (
                          <small>{point.text}</small>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
