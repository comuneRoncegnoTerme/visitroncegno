"use client";

import { useEffect, useRef } from "react";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre-gl-worker.mjs");

interface RouteMapProps {
  gpxUrl: string;
}

interface RouteCoordinate {
  longitude: number;
  latitude: number;
}

function parseGpx(gpxText: string): RouteCoordinate[] {
  const parser = new DOMParser();

  const xml = parser.parseFromString(
    gpxText,
    "application/xml"
  );

  const trackPoints = Array.from(
    xml.querySelectorAll("trkpt")
  );

  return trackPoints
    .map((point) => ({
      latitude: Number(
        point.getAttribute("lat")
      ),
      longitude: Number(
        point.getAttribute("lon")
      ),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude)
    );
}

export default function RouteMap({
  gpxUrl,
}: RouteMapProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<Map | null>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      mapRef.current
    ) {
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

            attribution:
              "© OpenStreetMap contributors",
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

      center: [11.408, 46.05],
      zoom: 13,

      attributionControl: false,

      minZoom: 10,
      maxZoom: 18,
    });

    mapRef.current = map;

    /*
     * Log degli errori interni MapLibre.
     */
    map.on("error", (event) => {
      console.error(
        "MAPLIBRE ERROR:",
        event.error
      );
    });

    map.addControl(
      new NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      "top-right"
    );

    map.on("load", async () => {
      try {
        /*
         * Resa cartografica coerente
         * con il resto del sito.
         */
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

        /*
         * Scarica il GPX.
         */
        const response =
          await fetch(gpxUrl);

        if (!response.ok) {
          throw new Error(
            `GPX error: ${response.status}`
          );
        }

        const gpxText =
          await response.text();

        /*
         * Estrae i punti del tracciato.
         */
        const coordinates =
          parseGpx(gpxText);

        console.log(
          "GPX punti:",
          coordinates.length
        );

        if (coordinates.length < 2) {
          throw new Error(
            "Il GPX non contiene abbastanza punti"
          );
        }

        /*
         * Converte in coordinate GeoJSON:
         * [longitudine, latitudine]
         */
        const lineCoordinates =
          coordinates.map(
            (point) =>
              [
                point.longitude,
                point.latitude,
              ] as [number, number]
          );

        console.log(
          "Prime coordinate:",
          lineCoordinates.slice(0, 5)
        );

        console.log(
          "Ultime coordinate:",
          lineCoordinates.slice(-5)
        );

        /*
         * Source GeoJSON del percorso.
         */
        map.addSource("route", {
          type: "geojson",

          data: {
            type: "Feature",

            properties: {},

            geometry: {
              type: "LineString",
              coordinates:
                lineCoordinates,
            },
          },
        });

        console.log(
          "Route source:",
          map.getSource("route")
        );

        /*
         * Bordo bianco.
         */
        map.addLayer({
          id: "route-shadow",
          type: "line",
          source: "route",

          layout: {
            "line-join": "round",
            "line-cap": "round",
          },

          paint: {
            "line-color": "#ffffff",
            "line-width": 10,
            "line-opacity": 0.95,
          },
        });

        /*
         * Linea principale.
         *
         * Per ora volutamente molto evidente
         * per il debug.
         */
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",

          layout: {
            "line-join": "round",
            "line-cap": "round",
          },

          paint: {
            "line-color": "#d85f2f",
            "line-width": 5,
            "line-opacity": 1,
          },
        });
  

        /*
         * Partenza e arrivo.
         */
        const first =
          lineCoordinates[0];

        const last =
          lineCoordinates[
          lineCoordinates.length - 1
          ];

        const startMarker =
          document.createElement("div");

        startMarker.className =
          "route-map-marker route-map-marker-start";

        startMarker.innerHTML = `
          <span class="route-map-marker-dot"></span>
          <span class="route-map-marker-label">
            Partenza
          </span>
        `;

        new Marker({
          element: startMarker,
          anchor: "center",
        })
          .setLngLat(first)
          .addTo(map);

        /*
         * Evita marker sovrapposti
         * sui percorsi ad anello.
         */
        const deltaLongitude =
          first[0] - last[0];

        const deltaLatitude =
          first[1] - last[1];

        const distanceBetweenStartAndEnd =
          Math.sqrt(
            deltaLongitude *
            deltaLongitude +
            deltaLatitude *
            deltaLatitude
          );

        if (
          distanceBetweenStartAndEnd >
          0.0002
        ) {
          const endMarker =
            document.createElement("div");

          endMarker.className =
            "route-map-marker route-map-marker-end";

          endMarker.innerHTML = `
            <span class="route-map-marker-dot"></span>
            <span class="route-map-marker-label">
              Arrivo
            </span>
          `;

          new Marker({
            element: endMarker,
            anchor: "center",
          })
            .setLngLat(last)
            .addTo(map);
        }

        /*
         * Calcola l'estensione completa
         * del percorso.
         */
        const bounds =
          lineCoordinates.reduce(
            (
              currentBounds,
              coordinate
            ) =>
              currentBounds.extend(
                coordinate
              ),

            new LngLatBounds(
              first,
              first
            )
          );

        /*
         * Zoom automatico sul GPX.
         */
        map.fitBounds(bounds, {
          padding: 70,
          maxZoom: 16,
          duration: 0,
        });
      } catch (error) {
        console.error(
          "Errore caricamento GPX:",
          error
        );
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [gpxUrl]);

  return (
    <div
      ref={containerRef}
      className="route-map"
      aria-label="Mappa del percorso"
    />
  );
}