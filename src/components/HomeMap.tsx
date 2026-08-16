"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
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
}

interface HomeMapProps {
  places: HomeMapPlace[];
  compact?: boolean;
  showFilters?: boolean;
}

type MapFilter = "all" | "places" | "food" | "sleep" | "services";

const FILTERS: { value: MapFilter; label: string }[] = [
  { value: "all", label: "Tutto" },
  { value: "places", label: "Luoghi" },
  { value: "food", label: "Mangiare" },
  { value: "sleep", label: "Dormire" },
  { value: "services", label: "Servizi" },
];

function normalizeLabel(place: HomeMapPlace) {
  return (place.mapLabel ?? "").toLocaleLowerCase("it-IT");
}

function categoryForPlace(place: HomeMapPlace): Exclude<MapFilter, "all"> {
  const label = normalizeLabel(place);

  if (["ristor", "pizzer", "bar", "oster", "trattor", "enotec", "mangiare"].some((term) => label.includes(term))) {
    return "food";
  }

  if (["hotel", "b&b", "bed", "agritur", "allogg", "ospital", "dormire", "appartament"].some((term) => label.includes(term))) {
    return "sleep";
  }

  if (["parchegg", "servizio", "info", "farmacia", "stazione"].some((term) => label.includes(term))) {
    return "services";
  }

  return "places";
}

function placeHref(place: HomeMapPlace) {
  const normalizedTitle = place.title.toLowerCase();

  if (normalizedTitle.includes("mulino angeli")) {
    return "/musei/mulino-angeli";
  }

  if (
    normalizedTitle.includes("strumenti musicali") ||
    normalizedTitle.includes("museo della musica")
  ) {
    return "/musei/museo-della-musica";
  }

  return `/luoghi/${place.slug}`;
}

export default function HomeMap({ places, compact = false, showFilters = compact }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");

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
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm-tiles" }],
      },
      center: [11.405, 46.047],
      zoom: 13.3,
      attributionControl: false,
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
      link.href = placeHref(place);
      link.textContent = "Scopri il luogo →";
      content.appendChild(link);
      popupContent.appendChild(content);

      const popup = new Popup({
        offset: isMobile ? 18 : 24,
        closeButton: true,
        closeOnClick: true,
        maxWidth: isMobile ? "calc(100vw - 44px)" : "320px",
        focusAfterOpen: false,
      }).setDOMContent(popupContent);

      markerElement.addEventListener("click", () => {
        map.easeTo({
          center: [place.longitude, place.latitude],
          duration: 450,
          padding: isMobile
            ? { top: 80, right: 24, bottom: 210, left: 24 }
            : { top: 80, right: 80, bottom: 80, left: 80 },
        });
      });

      new Marker({ element: markerElement, anchor: "center" })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    map.on("load", () => {
      map.setPaintProperty("osm", "raster-saturation", -0.45);
      map.setPaintProperty("osm", "raster-contrast", -0.08);
      map.setPaintProperty("osm", "raster-brightness-min", 0.08);
      map.setPaintProperty("osm", "raster-brightness-max", 0.92);

      if (!bounds.isEmpty()) {
        if (visiblePlaces.length === 1) {
          map.easeTo({ center: bounds.getCenter(), zoom: 14.4, duration: 0 });
        } else {
          map.fitBounds(bounds, {
            padding: isMobile
              ? { top: showFilters ? 110 : 70, right: 42, bottom: 70, left: 42 }
              : { top: showFilters ? 110 : 86, right: 86, bottom: 86, left: 86 },
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
  }, [showFilters, visiblePlaces]);

  return (
    <div className={`${styles.shell}${compact ? ` ${styles.compact}` : ""}`}>
      {showFilters && (
        <div className={styles.filters} aria-label="Filtra i punti sulla mappa">
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
      <div
        ref={containerRef}
        className="home-map"
        aria-label={`Mappa interattiva di Roncegno Terme. ${visiblePlaces.length} punti visibili.`}
      />
      <div className={styles.mobileHint} aria-hidden="true">
        Trascina la mappa · usa due dita per lo zoom
      </div>
    </div>
  );
}
