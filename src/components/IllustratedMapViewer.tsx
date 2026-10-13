"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import styles from "./IllustratedMapViewer.module.css";

export type IllustratedMapPoint = {
  id: string;
  title: string;
  group: string;
  x: number;
  y: number;
  href: string | null;
  text: string | null;
  image: string | null;
  meta?: string | null;
};

type Props = {
  src: string;
  /** Versione ad alta risoluzione, scaricata solo quando si ingrandisce. */
  hdSrc?: string;
  alt: string;
  /** Larghezza / altezza dell'illustrazione. */
  aspect: number;
  points: IllustratedMapPoint[];
  groups: { id: string; label: string }[];
  /** Punto da aprire subito (dai nomi della cartina in homepage). */
  initialPointId?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function IllustratedMapViewer({ src, hdSrc, alt, aspect, points, groups, initialPointId }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const draggedRef = useRef(false);
  const selectedRef = useRef<IllustratedMapPoint | null>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  const [baseScale, setBaseScale] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hdLoaded, setHdLoaded] = useState(false);
  const hdRequestedRef = useRef(false);

  const selectedIndex = points.findIndex((point) => point.id === selectedId);
  const selected = selectedIndex >= 0 ? points[selectedIndex] : null;
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Scala minima: l'illustrazione riempie sempre il riquadro in altezza.
  const measureBaseScale = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return 1;
    const fit = (frame.clientHeight * aspect) / frame.clientWidth;
    return Math.max(MIN_SCALE, fit);
  }, [aspect]);

  // Porta un punto dell'illustrazione (in percentuale) al centro del riquadro.
  const centerOn = useCallback((x: number, y: number, nextScale: number, smooth = true) => {
    const frame = frameRef.current;
    if (!frame) return;
    const width = frame.clientWidth * nextScale;
    const height = width / aspect;
    const narrow = frame.clientWidth < 760;
    frame.scrollTo({
      left: width * (x / 100) - frame.clientWidth / 2,
      // Su telefono la scheda copre la parte bassa: il punto resta più in alto.
      top: height * (y / 100) - frame.clientHeight * (narrow ? 0.34 : 0.5),
      behavior: smooth ? "smooth" : "auto",
    });
  }, [aspect]);

  const applyScale = useCallback((next: number, anchor?: { x: number; y: number }) => {
    const frame = frameRef.current;
    const bounded = clamp(next, baseScale, MAX_SCALE);
    if (!frame) return setScale(bounded);
    const ax = anchor?.x ?? frame.clientWidth / 2;
    const ay = anchor?.y ?? frame.clientHeight / 2;
    const pointX = frame.scrollLeft + ax;
    const pointY = frame.scrollTop + ay;
    const ratio = bounded / scale;
    setScale(bounded);
    requestAnimationFrame(() => {
      frame.scrollLeft = pointX * ratio - ax;
      frame.scrollTop = pointY * ratio - ay;
    });
  }, [baseScale, scale]);

  // Vista iniziale: su desktop l'intera cartina, su telefono il paese al centro.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const setup = () => {
      const base = measureBaseScale();
      setBaseScale(base);
      setScale((current) => Math.max(current, base));
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [measureBaseScale, expanded]);

  // Ricentra quando cambia la scala minima (primo caricamento, rotazione, tutto schermo):
  // va fatto dopo che il canvas ha preso la nuova larghezza.
  useEffect(() => {
    const recenter = () => {
      const current = selectedRef.current;
      if (current) centerOn(current.x, current.y, Math.max(baseScale, scaleRef.current), false);
      else centerOn(50, 62, baseScale, false);
    };
    const frameId = requestAnimationFrame(recenter);
    // La larghezza del canvas cambia con una transizione di mezzo secondo.
    const timeoutId = window.setTimeout(recenter, 550);
    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [baseScale, centerOn, expanded]);

  // Oltre un certo ingrandimento la versione normale si sgrana: si scarica l'HD e si scambia
  // l'immagine solo quando è pronta, senza vuoti.
  const zoomedIn = scale / baseScale > 1.4 || (expanded && scale > 1.2);
  useEffect(() => {
    if (!hdSrc || !zoomedIn || hdRequestedRef.current) return;
    hdRequestedRef.current = true;
    const image = new Image();
    image.onload = () => setHdLoaded(true);
    image.src = hdSrc;
  }, [hdSrc, zoomedIn]);

  // Zoom con due dita (iOS non supporta il pinch dentro un riquadro scorrevole senza aiuto).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const distance = (event: TouchEvent) => {
      const [a, b] = [event.touches[0], event.touches[1]];
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      pinchRef.current = { distance: distance(event), scale };
      setAnimated(false);
    };
    const onMove = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || event.touches.length !== 2) return;
      event.preventDefault();
      const rect = frame.getBoundingClientRect();
      const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
      const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;
      applyScale(pinch.scale * (distance(event) / pinch.distance), { x: midX, y: midY });
    };
    const onEnd = () => {
      if (!pinchRef.current) return;
      pinchRef.current = null;
      setAnimated(true);
    };
    frame.addEventListener("touchstart", onStart, { passive: true });
    frame.addEventListener("touchmove", onMove, { passive: false });
    frame.addEventListener("touchend", onEnd);
    frame.addEventListener("touchcancel", onEnd);
    return () => {
      frame.removeEventListener("touchstart", onStart);
      frame.removeEventListener("touchmove", onMove);
      frame.removeEventListener("touchend", onEnd);
      frame.removeEventListener("touchcancel", onEnd);
    };
  }, [applyScale, scale]);

  // Vista a tutto schermo fatta in casa: funziona anche su iPhone, dove l'API Fullscreen non c'è.
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  function focusPoint(point: IllustratedMapPoint) {
    const narrow = (frameRef.current?.clientWidth ?? 1000) < 760;
    const target = Math.max(scale, baseScale * (narrow ? 1.5 : 1.8));
    setSelectedId(point.id);
    setScale(target);
    // Su telefono porta tutta la cartina nello schermo, così la scheda in basso si vede.
    if (narrow && !expanded) shellRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    // Il canvas cambia larghezza con una transizione: si ricentra all'inizio e alla fine.
    requestAnimationFrame(() => centerOn(point.x, point.y, target));
    window.setTimeout(() => centerOn(point.x, point.y, target), 520);
  }

  // Arrivando da un nome della homepage, la cartina si apre già su quel punto.
  const openedInitialRef = useRef(false);
  useEffect(() => {
    if (openedInitialRef.current || !initialPointId || baseScale === 1 && (frameRef.current?.clientWidth ?? 0) < 760) return;
    const point = points.find((item) => item.id === initialPointId);
    if (!point) return;
    const timeout = window.setTimeout(() => {
      openedInitialRef.current = true;
      shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      focusPoint(point);
    }, 300);
    return () => window.clearTimeout(timeout);
    // focusPoint cambia a ogni render: qui serve solo all'apertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseScale, initialPointId, points]);

  function step(direction: number) {
    const next = points[(selectedIndex + direction + points.length) % points.length];
    if (next) focusPoint(next);
  }

  function closeCard() {
    setSelectedId(null);
    setTouring(false);
  }

  function startTour() {
    setTouring(true);
    if (points[0]) focusPoint(points[0]);
  }

  const shell = (
      <div className={styles.shell} ref={shellRef}>
        <div
          className={styles.frame}
          ref={frameRef}
          onPointerDown={(event) => {
            if (event.pointerType === "touch") return;
            const frame = frameRef.current;
            if (!frame) return;
            dragRef.current = { x: event.clientX, y: event.clientY, left: frame.scrollLeft, top: frame.scrollTop, moved: false };
            frame.dataset.dragging = "true";
          }}
          onPointerMove={(event) => {
            const frame = frameRef.current;
            const drag = dragRef.current;
            if (!frame || !drag) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
            frame.scrollLeft = drag.left - dx;
            frame.scrollTop = drag.top - dy;
          }}
          onPointerUp={() => {
            draggedRef.current = Boolean(dragRef.current?.moved);
            dragRef.current = null;
            if (frameRef.current) frameRef.current.dataset.dragging = "false";
          }}
          onPointerLeave={() => {
            dragRef.current = null;
            if (frameRef.current) frameRef.current.dataset.dragging = "false";
          }}
          onDoubleClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            applyScale(scale * 1.6, { x: event.clientX - rect.left, y: event.clientY - rect.top });
          }}
        >
          <div
            className={`${styles.canvas} ${animated ? styles.canvasAnimated : ""}`}
            style={{ width: `${scale * 100}%` }}
          >
            {/* Immagine nativa: lo zoom cambia la larghezza del contenitore senza i vincoli di next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hdLoaded && hdSrc ? hdSrc : src} alt={alt} draggable={false} />
            {touring && (
              <svg className={styles.tourPath} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
              </svg>
            )}
            {points.map((point) => (
              <button
                key={point.id}
                type="button"
                className={`${styles.marker} ${point.id === selectedId ? styles.markerActive : ""}`}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (draggedRef.current) return;
                  focusPoint(point);
                }}
                aria-label={point.title}
              >
                <span className={styles.markerLabel}>{point.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controls}>
          <button type="button" onClick={() => applyScale(scale / 1.4)} disabled={scale <= baseScale + 0.01} aria-label="Riduci">−</button>
          <button type="button" onClick={() => applyScale(scale * 1.4)} disabled={scale >= MAX_SCALE} aria-label="Ingrandisci">+</button>
          <button type="button" className={styles.expandButton} onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Chiudi" : "Tutto schermo"}
          </button>
        </div>

        {!selected && (
          <button type="button" className={styles.tourStart} onClick={startTour}>
            Guarda i luoghi uno per uno
          </button>
        )}

        {selected && (
          <aside className={styles.card} aria-live="polite">
            <button type="button" className={styles.cardClose} onClick={closeCard} aria-label="Chiudi la scheda">×</button>
            {selected.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.cardImage} src={selected.image} alt="" />
            )}
            <div className={styles.cardBody}>
              <small>
                {touring
                  ? `Tappa ${selectedIndex + 1} di ${points.length}`
                  : [groups.find((group) => group.id === selected.group)?.label, selected.meta].filter(Boolean).join(" · ")}
              </small>
              <h3>{selected.title}</h3>
              {selected.text && <p>{selected.text}</p>}
              <div className={styles.cardActions}>
                {touring && <button type="button" onClick={() => step(-1)} aria-label="Tappa precedente">←</button>}
                {selected.href ? (
                  <Link href={selected.href}>Apri la scheda</Link>
                ) : (
                  <span className={styles.cardNoLink}>Scheda non ancora disponibile</span>
                )}
                {touring && <button type="button" onClick={() => step(1)} aria-label="Tappa successiva">→</button>}
              </div>
            </div>
          </aside>
        )}
      </div>
  );

  return (
    <div className={styles.viewer}>
      {expanded
        ? createPortal(<div className={`${styles.viewer} ${styles.expanded}`}>{shell}</div>, document.body)
        : shell}
      {expanded && <div className={styles.placeholder} aria-hidden="true" />}

      <nav className={styles.index} aria-label="Luoghi sulla cartina">
        {groups.map((group) => {
          const groupPoints = points.filter((point) => point.group === group.id);
          if (groupPoints.length === 0) return null;
          return (
            <div className={styles.indexGroup} key={group.id}>
              <h3>{group.label}</h3>
              <ul>
                {groupPoints.map((point) => (
                  <li key={point.id}>
                    <button
                      type="button"
                      className={point.id === selectedId ? styles.indexActive : undefined}
                      onClick={() => {
                        setTouring(false);
                        if (expanded) setExpanded(false);
                        frameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                        focusPoint(point);
                      }}
                    >
                      {point.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
