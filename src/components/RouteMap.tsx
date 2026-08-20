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
  gpxText: string;
}

interface RouteCoordinate {
  longitude: number;
  latitude: number;
}

function readPoints(xml: Document, tagName: "trkpt" | "rtept") {
  return Array.from(xml.getElementsByTagNameNS("*", tagName));
}

function parseGpx(gpxText: string): RouteCoordinate[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  if (xml.getElementsByTagName("parsererror").length > 0) {
    throw new Error("GPX non valido");
  }

  const trackPoints = readPoints(xml, "trkpt");
  const routePoints = readPoints(xml, "rtept");
  const points = trackPoints.length > 0 ? trackPoints : routePoints;

  return points
    .map((point) => ({
      latitude: Number(point.getAttribute("lat")),
      longitude: Number(point.getAttribute("lon")),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude)
    );
}

export default function RouteMap({ gpxText }: RouteMapProps) {
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
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
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
      center: [11.408, 46.05],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
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
      try {
        map.setPaintProperty("osm", "raster-saturation", -0.45);
        map.setPaintProperty("osm", "raster-contrast", -0.08);
        map.setPaintProperty("osm", "raster-brightness-min", 0.08);
        map.setPaintProperty("osm", "raster-brightness-max", 0.92);

        const coordinates = parseGpx(gpxText);

        if (coordinates.length < 2) {
          throw new Error("Il GPX non contiene abbastanza punti");
        }

        const lineCoordinates = coordinates.map(
          (point) => [point.longitude, point.latitude] as [number, number]
        );

        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: lineCoordinates,
            },
          },
        });

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
            "line-width": 9,
            "line-opacity": 0.92,
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#d66b2c",
            "line-width": 5,
            "line-opacity": 1,
          },
        });

        const first = lineCoordinates[0];
        const last = lineCoordinates[lineCoordinates.length - 1];

        const startMarker = document.createElement("div");
        startMarker.className = "route-map-marker route-map-marker-start";
        startMarker.innerHTML = `
          <span class="route-map-marker-dot"></span>
          <span class="route-map-marker-label">Partenza</span>
        `;

        new Marker({
          element: startMarker,
          anchor: "center",
        })
          .setLngLat(first)
          .addTo(map);

        const deltaLongitude = first[0] - last[0];
        const deltaLatitude = first[1] - last[1];
        const distanceBetweenStartAndEnd = Math.sqrt(
          deltaLongitude * deltaLongitude + deltaLatitude * deltaLatitude
        );

        if (distanceBetweenStartAndEnd > 0.0002) {
          const endMarker = document.createElement("div");
          endMarker.className = "route-map-marker route-map-marker-end";
          endMarker.innerHTML = `
            <span class="route-map-marker-dot"></span>
            <span class="route-map-marker-label">Arrivo</span>
          `;

          new Marker({
            element: endMarker,
            anchor: "center",
          })
            .setLngLat(last)
            .addTo(map);
        }

        const bounds = lineCoordinates.reduce(
          (currentBounds, coordinate) => currentBounds.extend(coordinate),
          new LngLatBounds(first, first)
        );

        map.fitBounds(bounds, {
          padding: 70,
          maxZoom: 16,
          duration: 0,
        });
      } catch (error) {
        console.error("Errore caricamento GPX:", error);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [gpxText]);

  return (
    <div
      ref={containerRef}
      className="route-map"
      aria-label="Mappa interattiva del percorso"
    />
  );
}
