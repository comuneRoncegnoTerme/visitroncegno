"use client";

import { useEffect, useRef } from "react";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  flattenGpxSegments,
  haversineDistanceKm,
  parseGpxSegments,
  thinPoints,
} from "@/lib/gpx-client";
import styles from "./RouteMap.module.css";

interface RouteMapProps {
  gpxText: string;
}

function markerElement(label: string, variant: "start" | "end") {
  const element = document.createElement("div");
  element.className = `route-map-marker route-map-marker-${variant}`;
  element.innerHTML = `
    <span class="route-map-marker-dot"></span>
    <span class="route-map-marker-label">${label}</span>
  `;
  return element;
}

export default function RouteMap({ gpxText }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const shadowPathRef = useRef<SVGPathElement | null>(null);
  const routePathRef = useRef<SVGPathElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const segments = parseGpxSegments(gpxText).filter(
      (segment) => segment.length >= 2
    );
    const allPoints = flattenGpxSegments(segments);

    if (allPoints.length < 2) {
      console.error("Il GPX non contiene abbastanza punti");
      return;
    }

    const first = allPoints[0];
    const last = allPoints[allPoints.length - 1];
    const isMobile = window.matchMedia("(max-width: 800px)").matches;

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
      center: [first.longitude, first.latitude],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
    });

    mapRef.current = map;

    map.on("error", (event) => {
      console.error("Errore MapLibre:", event.error);
    });

    map.addControl(
      new NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      "top-right"
    );

    const bounds = new LngLatBounds();
    allPoints.forEach((point) => {
      bounds.extend([point.longitude, point.latitude]);
    });

    const fitRoute = () => {
      if (bounds.isEmpty()) return;

      map.fitBounds(bounds, {
        padding: isMobile ? 36 : 70,
        maxZoom: 16,
        duration: 0,
      });
    };

    new Marker({
      element: markerElement("Partenza", "start"),
      anchor: "center",
    })
      .setLngLat([first.longitude, first.latitude])
      .addTo(map);

    if (haversineDistanceKm(first, last) > 0.025) {
      new Marker({
        element: markerElement("Arrivo", "end"),
        anchor: "center",
      })
        .setLngLat([last.longitude, last.latitude])
        .addTo(map);
    }

    const maxPointsPerSegment = Math.max(
      80,
      Math.floor(700 / Math.max(segments.length, 1))
    );
    const displaySegments = segments.map((segment) =>
      thinPoints(segment, maxPointsPerSegment)
    );

    const renderRouteOverlay = () => {
      const container = containerRef.current;
      const overlay = overlayRef.current;
      const shadowPath = shadowPathRef.current;
      const routePath = routePathRef.current;

      if (!container || !overlay || !shadowPath || !routePath) {
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width <= 0 || height <= 0) {
        return;
      }

      overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const path = displaySegments
        .map((segment) =>
          segment
            .map((point, index) => {
              const projected = map.project([
                point.longitude,
                point.latitude,
              ]);
              return `${index === 0 ? "M" : "L"} ${projected.x.toFixed(
                1
              )} ${projected.y.toFixed(1)}`;
            })
            .join(" ")
        )
        .join(" ");

      shadowPath.setAttribute("d", path);
      routePath.setAttribute("d", path);
    };

    map.on("load", () => {
      map.setPaintProperty("osm", "raster-saturation", -0.38);
      map.setPaintProperty("osm", "raster-contrast", -0.06);
      map.setPaintProperty("osm", "raster-brightness-min", 0.06);
      map.setPaintProperty("osm", "raster-brightness-max", 0.94);

      map.resize();
      fitRoute();
      renderRouteOverlay();
    });

    // L'overlay SVG viene proiettato usando la stessa trasformazione della
    // mappa. In questo modo il tracciato resta visibile anche se il browser
    // non renderizza correttamente un layer GeoJSON WebGL.
    map.on("render", renderRouteOverlay);
    map.on("resize", renderRouteOverlay);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      fitRoute();
      renderRouteOverlay();
    });
    resizeObserver.observe(containerRef.current);

    requestAnimationFrame(() => {
      map.resize();
      fitRoute();
      renderRouteOverlay();
    });

    return () => {
      resizeObserver.disconnect();
      map.off("render", renderRouteOverlay);
      map.off("resize", renderRouteOverlay);
      map.remove();
      mapRef.current = null;
    };
  }, [gpxText]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className="route-map"
        aria-label="Mappa interattiva del percorso"
      />
      <svg
        ref={overlayRef}
        className={styles.overlay}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path ref={shadowPathRef} className={styles.routeShadow} />
        <path ref={routePathRef} className={styles.routeLine} />
      </svg>
    </div>
  );
}
