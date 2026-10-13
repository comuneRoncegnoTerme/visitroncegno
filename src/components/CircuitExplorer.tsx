"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { LngLatBounds, Map, Marker, NavigationControl } from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import { configureMapLibreWorker } from "@/lib/maplibre-worker";
import { CIRCUIT_COLORS } from "@/lib/circuit-colors";
import { parseGpxSegments, thinPoints, type GpxPoint } from "@/lib/gpx-client";
import styles from "./CircuitExplorer.module.css";

export type CircuitExplorerLoop = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  imageUrl: string | null;
  difficulty: string | null;
  facts: string[];
  gpxText: string | null;
};


type Trace = { id: number; color: string; segments: GpxPoint[][] };

function startMarker(number: number, color: string, title: string) {
  const element = document.createElement("div");
  element.className = styles.startMarker;
  element.style.background = color;
  element.textContent = String(number);
  element.title = `Partenza: ${title}`;
  return element;
}

// Mappa con tutti gli anelli del circuito e le loro schede: scheda e tracciato si evidenziano a vicenda.
export default function CircuitExplorer({ loops }: { loops: CircuitExplorerLoop[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef(new globalThis.Map<number, { shadow: SVGPathElement; line: SVGPathElement; hit: SVGPathElement }>());
  const [active, setActive] = useState<number | null>(null);

  const traces = useMemo<Trace[]>(
    () =>
      loops.flatMap((loop, index) => {
        if (!loop.gpxText) return [];
        const segments = parseGpxSegments(loop.gpxText)
          .filter((segment) => segment.length >= 2)
          .map((segment) => thinPoints(segment, 400));
        return segments.length ? [{ id: loop.id, color: CIRCUIT_COLORS[index % CIRCUIT_COLORS.length], segments }] : [];
      }),
    [loops]
  );

  useEffect(() => {
    if (!containerRef.current || !traces.length) return;
    configureMapLibreWorker();
    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    const first = traces[0].segments[0][0];

    const map = new Map({
      container: containerRef.current,
      style: {
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
        layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.38, "raster-brightness-max": 0.94 } }],
      },
      center: [first.longitude, first.latitude],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      cooperativeGestures: window.matchMedia("(pointer: coarse)").matches,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.touchZoomRotate.disableRotation();

    const bounds = new LngLatBounds();
    traces.forEach((trace) => trace.segments.flat().forEach((point) => bounds.extend([point.longitude, point.latitude])));
    const fit = () => map.fitBounds(bounds, { padding: isMobile ? 32 : 64, maxZoom: 16, duration: 0 });

    traces.forEach((trace) => {
      const start = trace.segments[0][0];
      const number = loops.findIndex((loop) => loop.id === trace.id) + 1;
      const title = loops.find((loop) => loop.id === trace.id)?.title ?? "";
      new Marker({ element: startMarker(number, trace.color, title), anchor: "center" })
        .setLngLat([start.longitude, start.latitude])
        .addTo(map);
    });

    // Tracciati disegnati in SVG sopra la mappa, come in RouteMap: visibili anche senza WebGL per le linee.
    const render = () => {
      const overlay = overlayRef.current;
      const container = containerRef.current;
      if (!overlay || !container) return;
      overlay.setAttribute("viewBox", `0 0 ${container.clientWidth} ${container.clientHeight}`);
      for (const trace of traces) {
        const paths = pathRefs.current.get(trace.id);
        if (!paths) continue;
        const d = trace.segments
          .map((segment) =>
            segment
              .map((point, index) => {
                const projected = map.project([point.longitude, point.latitude]);
                return `${index ? "L" : "M"}${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
              })
              .join(" ")
          )
          .join(" ");
        paths.shadow.setAttribute("d", d);
        paths.line.setAttribute("d", d);
        paths.hit.setAttribute("d", d);
      }
    };

    map.on("load", () => {
      map.resize();
      fit();
      render();
    });
    map.on("render", render);
    const resize = new ResizeObserver(() => {
      map.resize();
      render();
    });
    resize.observe(containerRef.current);
    requestAnimationFrame(() => {
      map.resize();
      fit();
      render();
    });

    return () => {
      resize.disconnect();
      map.remove();
    };
  }, [loops, traces]);

  return (
    <div className={styles.explorer}>
      {traces.length > 0 && (
        <div className={styles.mapWrap}>
          <div ref={containerRef} className={styles.map} aria-label="Mappa degli anelli del circuito" role="region" />
          <svg ref={overlayRef} className={styles.overlay} preserveAspectRatio="none" aria-hidden="true">
            {/* L'anello evidenziato va disegnato per ultimo, sopra gli altri. */}
            {[...traces].sort((a, b) => Number(a.id === active) - Number(b.id === active)).map((trace) => (
              <g
                key={trace.id}
                className={styles.trace}
                data-state={active === null ? undefined : active === trace.id ? "active" : "dim"}
              >
                <path
                  className={styles.traceShadow}
                  ref={(element) => {
                    const entry = pathRefs.current.get(trace.id) ?? ({} as { shadow: SVGPathElement; line: SVGPathElement; hit: SVGPathElement });
                    if (element) pathRefs.current.set(trace.id, { ...entry, shadow: element });
                  }}
                />
                <path
                  className={styles.traceLine}
                  style={{ stroke: trace.color }}
                  ref={(element) => {
                    const entry = pathRefs.current.get(trace.id) ?? ({} as { shadow: SVGPathElement; line: SVGPathElement; hit: SVGPathElement });
                    if (element) pathRefs.current.set(trace.id, { ...entry, line: element });
                  }}
                />
                <path
                  className={styles.traceHit}
                  onMouseEnter={() => setActive(trace.id)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive((current) => (current === trace.id ? null : trace.id))}
                  ref={(element) => {
                    const entry = pathRefs.current.get(trace.id) ?? ({} as { shadow: SVGPathElement; line: SVGPathElement; hit: SVGPathElement });
                    if (element) pathRefs.current.set(trace.id, { ...entry, hit: element });
                  }}
                />
              </g>
            ))}
          </svg>
        </div>
      )}

      <ol className={styles.cards}>
        {loops.map((loop, index) => {
          const color = CIRCUIT_COLORS[index % CIRCUIT_COLORS.length];
          return (
            <li key={loop.id}>
              <Link
                href={`/percorsi/${loop.slug}`}
                className={styles.card}
                data-active={active === loop.id || undefined}
                style={{ "--loop-color": color } as CSSProperties}
                onMouseEnter={() => setActive(loop.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(loop.id)}
                onBlur={() => setActive(null)}
              >
                <div className={styles.cardImage} style={loop.imageUrl ? { backgroundImage: `url('${loop.imageUrl}')` } : undefined}>
                  <span>{index + 1}</span>
                </div>
                <div className={styles.cardBody}>
                  <small>{loop.difficulty ?? `Anello ${index + 1}`}</small>
                  <h3>{loop.title}</h3>
                  {loop.summary && <p>{loop.summary}</p>}
                  {loop.facts.length > 0 && (
                    <div className={styles.facts}>
                      {loop.facts.map((fact) => <span key={fact}>{fact}</span>)}
                    </div>
                  )}
                  <strong>Apri il percorso →</strong>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
