"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
  type StyleSpecification,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
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
}

type MapFilter = "all" | PlaceCategory;
type MapTheme = "editorial" | "terrain";

const FILTERS: { value: MapFilter; label: string }[] = [
  { value: "all", label: "Tutto" },
  { value: "places", label: "Luoghi" },
  { value: "food", label: "Mangiare" },
  { value: "sleep", label: "Dormire" },
  { value: "services", label: "Servizi" },
];

const THEMES: { value: MapTheme; label: string }[] = [
  { value: "editorial", label: "Mappa" },
  { value: "terrain", label: "Rilievo" },
];

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
  if (theme === "terrain") {
    return {
      version: 8,
      sources: {
        terrain: {
          type: "raster",
          tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          minzoom: 0,
          maxzoom: 17,
          attribution: "© OpenStreetMap contributors · SRTM | OpenTopoMap",
        },
      },
      layers: [{ id: "terrain", type: "raster", source: "terrain" }],
    };
  }

  return {
    version: 8,
    sources: {
      editorial: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "editorial", type: "raster", source: "editorial" }],
  };
}

export default function HomeMap({ places, compact = false, showFilters = true }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");
  const [mapTheme, setMapTheme] = useState<MapTheme>("editorial");

  const visiblePlaces = useMemo(
    () => activeFilter === "all" ? places : places.filter((place) => categoryForPlace(place) === activeFilter),
    [activeFilter, places]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    mapRef.current?.remove();
    mapRef.current = null;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;

    const map = new Map({
      container: containerRef.current,
      style: mapStyle(mapTheme),
      center: [11.405, 46.047],
      zoom: 13.3,
      attributionControl: true,
      minZoom: 10,
      maxZoom: 17,
    });

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false, showZoom: true }), "top-right");

    if (isMobile) {
      map.scrollZoom.disable();
      map.touchZoomRotate.disableRotation();
    }

    const bounds = new LngLatBounds();

    visiblePlaces.forEach((place) => {
      bounds.extend([place.longitude, place.latitude]);

      const markerElement = document.createElement("button");
      markerElement.className = `roncegno-map-marker roncegno-map-marker-${categoryForPlace(place)}`;
      markerElement.type = "button";
      markerElement.setAttribute("aria-label", `Apri ${place.title}`);

      const popupContent = document.createElement("div");
      popupContent.className = "roncegno-map-popup";

      if (place.imageUrl) {
        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = "";
        popupContent.appendChild(image);
      }

      const content = document.createElement("div");
      content.className = "roncegno-map-popup-content";

      const label = document.createElement("span");
      label.textContent = place.mapLabel ?? "Luogo";
      const title = document.createElement("strong");
      title.textContent = place.title;
      content.appendChild(label);
      content.appendChild(title);

      if (place.summary) {
        const description = document.createElement("p");
        description.textContent = place.summary;
        content.appendChild(description);
      }

      const link = document.createElement("a");
      link.href = hrefForPlace(place);
      link.textContent = "Scopri il luogo →";
      content.appendChild(link);
      popupContent.appendChild(content);

      const popup = new Popup({
        offset: isMobile ? 18 : 24,
        closeButton: true,
        closeOnClick: true,
        maxWidth: isMobile ? "calc(100vw - 36px)" : "330px",
        focusAfterOpen: false,
      }).setDOMContent(popupContent);

      markerElement.addEventListener("click", () => {
        markerElement.classList.add("is-active");
        map.easeTo({
          center: [place.longitude, place.latitude],
          duration: 450,
          padding: isMobile
            ? { top: 120, right: 24, bottom: 220, left: 24 }
            : { top: 110, right: 90, bottom: 90, left: 90 },
        });
      });

      popup.on("close", () => markerElement.classList.remove("is-active"));

      new Marker({ element: markerElement, anchor: "center" })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    map.on("load", () => {
      const rasterLayer = mapTheme === "terrain" ? "terrain" : "editorial";

      if (mapTheme === "editorial") {
        map.setPaintProperty(rasterLayer, "raster-saturation", -0.22);
        map.setPaintProperty(rasterLayer, "raster-contrast", -0.05);
        map.setPaintProperty(rasterLayer, "raster-brightness-min", 0.04);
        map.setPaintProperty(rasterLayer, "raster-brightness-max", 0.94);
      } else {
        map.setPaintProperty(rasterLayer, "raster-saturation", -0.08);
        map.setPaintProperty(rasterLayer, "raster-contrast", -0.04);
        map.setPaintProperty(rasterLayer, "raster-brightness-max", 0.96);
      }

      if (!bounds.isEmpty()) {
        if (visiblePlaces.length === 1) {
          map.easeTo({ center: bounds.getCenter(), zoom: 14.4, duration: 0 });
        } else {
          map.fitBounds(bounds, {
            padding: isMobile
              ? { top: showFilters ? 126 : 76, right: 42, bottom: 74, left: 42 }
              : { top: showFilters ? 118 : 86, right: 86, bottom: 86, left: 86 },
            maxZoom: 14.8,
            duration: 0,
          });
        }
      }
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [mapTheme, showFilters, visiblePlaces]);

  return (
    <div className={`${styles.shell}${compact ? ` ${styles.compact}` : ""}`}>
      <div className={styles.toolbar}>
        {showFilters && (
          <div className={styles.filters} role="group" aria-label="Filtra i punti sulla mappa">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={activeFilter === filter.value ? styles.activeFilter : undefined}
                aria-pressed={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.themes} role="group" aria-label="Aspetto della mappa">
          {THEMES.map((theme) => (
            <button
              type="button"
              key={theme.value}
              className={mapTheme === theme.value ? styles.activeTheme : undefined}
              aria-pressed={mapTheme === theme.value}
              onClick={() => setMapTheme(theme.value)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="home-map"
        aria-label={`Mappa interattiva di Roncegno Terme. ${visiblePlaces.length} punti visibili.`}
      />
      <span className={styles.srStatus} aria-live="polite">
        {visiblePlaces.length} punti visibili sulla mappa
      </span>
      <div className={styles.mobileHint} aria-hidden="true">
        Trascina la mappa · usa due dita per lo zoom
      </div>
    </div>
  );
}
