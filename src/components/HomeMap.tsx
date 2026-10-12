"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  type StyleSpecification,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import { configureMapLibreWorker } from "@/lib/maplibre-worker";
import { placeHref, type PlaceDetailMode, type PlaceType } from "@/lib/place-detail";
import { placeCategory, type PlaceCategory } from "@/lib/place-taxonomy";
import styles from "./HomeMap.module.css";

interface HomeMapPlace {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  mapLabel: string | null;
  mapIcon?: string | null;
  placeType?: PlaceType | null;
  detailMode?: PlaceDetailMode | null;
  canonicalPath?: string | null;
  externalDetailUrl?: string | null;
}

interface HomeMapProps {
  places: HomeMapPlace[];
  compact?: boolean;
  showFilters?: boolean;
  /** La mappa occupa tutta l'altezza del contenitore (pagina /mappa). */
  fill?: boolean;
}

type MapFilter = "all" | PlaceCategory;
type MapTheme = "editorial" | "terrain";

const FILTERS: { value: MapFilter; label: string }[] = [
  { value: "all", label: "Tutto" },
  { value: "places", label: "Da vedere" },
  { value: "food", label: "Mangiare" },
  { value: "sleep", label: "Dormire" },
  { value: "services", label: "Servizi" },
];

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  places: "Da vedere",
  food: "Mangiare",
  sleep: "Dormire",
  services: "Servizi",
};

function categoryForPlace(place: HomeMapPlace) {
  return placeCategory({ place_type: place.placeType, map_icon: place.mapIcon, map_label: place.mapLabel });
}

function hrefForPlace(place: HomeMapPlace) {
  return placeHref({
    slug: place.slug,
    title: place.title,
    place_type: place.placeType,
    detail_mode: place.detailMode,
    canonical_path: place.canonicalPath,
    external_detail_url: place.externalDetailUrl,
  });
}

function mapStyle(theme: MapTheme): StyleSpecification {
  const source = theme === "terrain"
    ? {
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        maxzoom: 17,
        attribution: "© OpenStreetMap contributors · SRTM | OpenTopoMap",
      }
    : {
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      };

  return {
    version: 8,
    sources: { base: { type: "raster", tileSize: 256, minzoom: 0, ...source } },
    layers: [{ id: "base", type: "raster", source: "base" }],
  };
}

export default function HomeMap({ places, compact = false, showFilters = true, fill = false }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(0);
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");
  const [mapTheme, setMapTheme] = useState<MapTheme>("editorial");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);

  const visiblePlaces = useMemo(
    () => activeFilter === "all" ? places : places.filter((place) => categoryForPlace(place) === activeFilter),
    [activeFilter, places]
  );
  const selected = places.find((place) => place.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const result: Partial<Record<MapFilter, number>> = { all: places.length };
    for (const place of places) {
      const category = categoryForPlace(place);
      result[category] = (result[category] ?? 0) + 1;
    }
    return result;
  }, [places]);

  // La mappa si ricrea solo quando cambia lo stile di base.
  useEffect(() => {
    if (!containerRef.current) return;
    configureMapLibreWorker();

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const map = new Map({
      container: containerRef.current,
      style: mapStyle(mapTheme),
      center: [11.405, 46.047],
      zoom: 13.3,
      attributionControl: { compact: true },
      minZoom: 10,
      maxZoom: 17,
      cooperativeGestures: false,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.touchZoomRotate.disableRotation();
    if (isMobile && !fill) map.scrollZoom.disable();

    // "style.load" arriva subito (lo stile è inline): i segnaposto non aspettano le tile.
    map.once("style.load", () => {
      map.setPaintProperty("base", "raster-saturation", mapTheme === "terrain" ? -0.08 : -0.25);
      map.setPaintProperty("base", "raster-brightness-max", 0.96);
      setMapReady((value) => value + 1);
    });
    map.on("movestart", (event) => {
      // Solo i gesti della persona nascondono il suggerimento, non le animazioni del codice.
      if ((event as { originalEvent?: Event }).originalEvent) setHintVisible(false);
    });
    map.on("click", () => setSelectedId(null));

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current = [];
      map.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [mapTheme, fill]);

  // Segnaposto e inquadratura seguono il filtro attivo.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;

    markersRef.current.forEach((marker) => marker.remove());
    const bounds = new LngLatBounds();

    markersRef.current = visiblePlaces.map((place) => {
      bounds.extend([place.longitude, place.latitude]);
      const element = document.createElement("button");
      element.type = "button";
      element.className = `${styles.marker} ${styles[`marker_${categoryForPlace(place)}`] ?? ""}`;
      element.setAttribute("aria-label", place.title);
      element.dataset.placeId = String(place.id);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        setSelectedId(place.id);
        map.easeTo({
          center: [place.longitude, place.latitude],
          duration: 450,
          padding: isMobile
            ? { top: 80, right: 20, bottom: 300, left: 20 }
            : { top: 80, right: 80, bottom: 80, left: 420 },
        });
      });
      return new Marker({ element, anchor: "center" }).setLngLat([place.longitude, place.latitude]).addTo(map);
    });

    if (!bounds.isEmpty()) {
      if (visiblePlaces.length === 1) {
        map.jumpTo({ center: bounds.getCenter(), zoom: 14.4 });
      } else {
        map.fitBounds(bounds, {
          padding: isMobile
            ? { top: showFilters ? 80 : 40, right: 36, bottom: 60, left: 36 }
            : { top: showFilters ? 90 : 60, right: 80, bottom: 70, left: 80 },
          maxZoom: 14.8,
          duration: mapReady > 1 ? 500 : 0,
        });
      }
    }
  }, [mapReady, showFilters, visiblePlaces]);

  // Evidenzia il segnaposto scelto.
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const element = marker.getElement();
      element.classList.toggle(styles.markerActive, element.dataset.placeId === String(selectedId));
    });
  }, [selectedId, visiblePlaces, mapReady]);

  useEffect(() => {
    if (!hintVisible) return;
    const timeout = window.setTimeout(() => setHintVisible(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [hintVisible]);

  return (
    <div className={`${styles.shell}${compact ? ` ${styles.compact}` : ""}${fill ? ` ${styles.fill}` : ""}`}>
      {showFilters && (
        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Filtra i punti sulla mappa">
            {FILTERS.filter((filter) => filter.value === "all" || counts[filter.value]).map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={activeFilter === filter.value ? styles.activeFilter : undefined}
                aria-pressed={activeFilter === filter.value}
                onClick={() => {
                  setActiveFilter(filter.value);
                  setSelectedId(null);
                }}
              >
                {filter.value !== "all" && <i className={styles[`dot_${filter.value}`]} aria-hidden="true" />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.themeToggle}
        onClick={() => setMapTheme((theme) => (theme === "editorial" ? "terrain" : "editorial"))}
        aria-pressed={mapTheme === "terrain"}
      >
        {mapTheme === "terrain" ? "Mappa stradale" : "Mostra il rilievo"}
      </button>

      <div
        ref={containerRef}
        className={styles.map}
        aria-label={`Mappa interattiva di Roncegno Terme. ${visiblePlaces.length} punti visibili.`}
      />
      <span className={styles.srStatus} aria-live="polite">
        {visiblePlaces.length} punti visibili sulla mappa
      </span>

      {hintVisible && !selected && (
        <div className={styles.hint} aria-hidden="true">
          Trascina la mappa · due dita per lo zoom
        </div>
      )}

      {selected && (
        <aside className={styles.card} aria-live="polite">
          <button type="button" className={styles.cardClose} onClick={() => setSelectedId(null)} aria-label="Chiudi la scheda">×</button>
          {selected.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.cardImage} src={selected.imageUrl} alt="" />
          )}
          <div className={styles.cardBody}>
            <small>{selected.mapLabel ?? CATEGORY_LABELS[categoryForPlace(selected)]}</small>
            <h3>{selected.title}</h3>
            {selected.summary && <p>{selected.summary}</p>}
            <div className={styles.cardActions}>
              <Link href={hrefForPlace(selected)}>Apri la scheda</Link>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Indicazioni ↗
              </a>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
