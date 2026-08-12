"use client";

import { useEffect, useRef } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

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
}

export default function HomeMap({ places }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new Map({
      container: containerRef.current,

      style: {
        version: 8,

        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
        },

        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm-tiles",
          },
        ],
      },

      center: [11.405, 46.047],
      zoom: 13.3,

      attributionControl: false,

      minZoom: 11,
      maxZoom: 17,
    });

    mapRef.current = map;

    map.addControl(
      new NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      map.setPaintProperty(
        "osm",
        "raster-saturation",
        -0.45
      );

      map.setPaintProperty(
        "osm",
        "raster-contrast",
        -0.08
      );

      map.setPaintProperty(
        "osm",
        "raster-brightness-min",
        0.08
      );

      map.setPaintProperty(
        "osm",
        "raster-brightness-max",
        0.92
      );
    });

    places.forEach((place) => {
      const markerElement =
        document.createElement("button");

      markerElement.className =
        "roncegno-map-marker";

      markerElement.type = "button";

      markerElement.setAttribute(
        "aria-label",
        `Apri ${place.title}`
      );

      const popupContent =
        document.createElement("div");

      popupContent.className =
        "roncegno-map-popup";

      if (place.imageUrl) {
        const image =
          document.createElement("img");

        image.src = place.imageUrl;
        image.alt = place.title;

        popupContent.appendChild(image);
      }

      const content =
        document.createElement("div");

      content.className =
        "roncegno-map-popup-content";

      const label =
        document.createElement("span");

      label.textContent =
        place.mapLabel ?? "Luogo";

      const title =
        document.createElement("strong");

      title.textContent = place.title;

      content.appendChild(label);
      content.appendChild(title);

      if (place.summary) {
        const description =
          document.createElement("p");

        description.textContent =
          place.summary;

        content.appendChild(description);
      }

      const link =
        document.createElement("a");

      link.href =
        `/luoghi/${place.slug}`;

      link.textContent =
        "Scopri il luogo →";

      content.appendChild(link);
      popupContent.appendChild(content);

      const popup = new Popup({
        offset: 24,
        closeButton: false,
        closeOnClick: true,
        maxWidth: "320px",
      }).setDOMContent(popupContent);

      new Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([
          place.longitude,
          place.latitude,
        ])
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [places]);

  return (
    <div
      ref={containerRef}
      className="home-map"
      aria-label="Mappa interattiva di Roncegno Terme"
    />
  );
}