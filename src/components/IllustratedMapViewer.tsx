"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./IllustratedMapViewer.module.css";

export type IllustratedMapHotspot = {
  id: string;
  x: number;
  y: number;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
};

type Props = {
  src: string;
  alt: string;
  initialScale?: number;
  mobileScale?: number;
  hotspots?: IllustratedMapHotspot[];
};

export default function IllustratedMapViewer({
  src,
  alt,
  initialScale = 1,
  mobileScale = 2.2,
  hotspots = [],
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const activeHotspotRef = useRef<IllustratedMapHotspot | null>(null);
  const [scale, setScale] = useState(initialScale);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tourActive, setTourActive] = useState(false);

  const selectedIndex = hotspots.findIndex((hotspot) => hotspot.id === selectedId);
  const selected = selectedIndex >= 0 ? hotspots[selectedIndex] : null;

  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const animationFrame = requestAnimationFrame(() => setScale(mobileScale));
    return () => cancelAnimationFrame(animationFrame);
  }, [mobileScale]);

  function updateScale(next: number) {
    const frame = frameRef.current;
    const bounded = Math.min(3, Math.max(1, next));
    if (!frame) return setScale(bounded);

    const centerX = frame.scrollLeft + frame.clientWidth / 2;
    const centerY = frame.scrollTop + frame.clientHeight / 2;
    const ratio = bounded / scale;
    setScale(bounded);
    requestAnimationFrame(() => {
      frame.scrollLeft = centerX * ratio - frame.clientWidth / 2;
      frame.scrollTop = centerY * ratio - frame.clientHeight / 2;
    });
  }

  function reset() {
    const next = window.matchMedia("(max-width: 760px)").matches ? mobileScale : initialScale;
    setScale(next);
    requestAnimationFrame(() => {
      if (!frameRef.current) return;
      frameRef.current.scrollLeft = frameRef.current.scrollWidth * 0.28;
      frameRef.current.scrollTop = frameRef.current.scrollHeight * 0.38;
    });
  }

  function scrollToHotspot(hotspot: IllustratedMapHotspot) {
    const frame = frameRef.current;
    if (!frame) return;
    const image = frame.querySelector("img");
    if (!image?.complete || !image.naturalWidth) return;
    frame.scrollTo({
      left: image.clientWidth * hotspot.x / 100 - frame.clientWidth / 2,
      top: image.clientHeight * hotspot.y / 100 - frame.clientHeight * (window.matchMedia("(max-width: 760px)").matches ? 0.14 : 0.5),
      behavior: "smooth",
    });
  }

  function focusHotspot(hotspot: IllustratedMapHotspot) {
    const targetScale = Math.max(scale, window.matchMedia("(max-width: 760px)").matches ? 3 : 1.55);
    activeHotspotRef.current = hotspot;
    setScale(targetScale);
    setSelectedId(hotspot.id);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHotspot(hotspot)));
    window.setTimeout(() => scrollToHotspot(hotspot), 920);
  }

  function startTour() {
    if (!hotspots[0]) return;
    setTourActive(true);
    focusHotspot(hotspots[0]);
  }

  function moveTour(direction: number) {
    const nextIndex = (selectedIndex + direction + hotspots.length) % hotspots.length;
    focusHotspot(hotspots[nextIndex]);
  }

  return (
    <div className={styles.shell} ref={shellRef}>
      <div className={styles.controls} aria-label="Controlli cartina">
        <button type="button" onClick={() => updateScale(scale - 0.25)} disabled={scale <= 1} aria-label="Riduci zoom">−</button>
        <span aria-live="polite">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => updateScale(scale + 0.25)} disabled={scale >= 3} aria-label="Aumenta zoom">+</button>
        <button className={styles.reset} type="button" onClick={reset}>Centra</button>
        {hotspots.length > 0 && <button className={styles.tourButton} type="button" onClick={startTour}><span aria-hidden="true">✦</span> Tour illustrato</button>}
        <button className={styles.fullscreen} type="button" onClick={() => shellRef.current?.requestFullscreen?.()}>Schermo intero</button>
      </div>
      <div
        className={styles.frame}
        ref={frameRef}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") return;
          const frame = frameRef.current;
          if (!frame) return;
          dragRef.current = { x: event.clientX, y: event.clientY, left: frame.scrollLeft, top: frame.scrollTop };
          frame.setPointerCapture(event.pointerId);
          frame.dataset.dragging = "true";
        }}
        onPointerMove={(event) => {
          const frame = frameRef.current;
          const drag = dragRef.current;
          if (!frame || !drag) return;
          frame.scrollLeft = drag.left - (event.clientX - drag.x);
          frame.scrollTop = drag.top - (event.clientY - drag.y);
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          if (frameRef.current) {
            frameRef.current.dataset.dragging = "false";
            frameRef.current.releasePointerCapture?.(event.pointerId);
          }
        }}
      >
        <div className={styles.canvas} style={{ width: `${scale * 100}%` }}>
          {/* A native image allows continuous touch/drag zoom without Next Image layout constraints. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            onLoad={() => {
              if (!frameRef.current) return;
              if (activeHotspotRef.current) return scrollToHotspot(activeHotspotRef.current);
              if (!window.matchMedia("(max-width: 760px)").matches) return;
              frameRef.current.scrollLeft = (frameRef.current.scrollWidth - frameRef.current.clientWidth) / 2;
              frameRef.current.scrollTop = 0;
            }}
          />
          {tourActive && hotspots.length > 1 && (
            <svg className={styles.tourPath} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={hotspots.map((hotspot) => `${hotspot.x},${hotspot.y}`).join(" ")} />
            </svg>
          )}
          {hotspots.map((hotspot, index) => (
            <button
              className={`${styles.hotspot} ${selectedId === hotspot.id ? styles.hotspotActive : ""}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              type="button"
              key={hotspot.id}
              onClick={(event) => { event.stopPropagation(); focusHotspot(hotspot); }}
              aria-label={`Scopri ${hotspot.title}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{hotspot.title}</b>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <aside className={styles.storyCard} aria-live="polite">
          <button className={styles.closeCard} type="button" onClick={() => { activeHotspotRef.current = null; setSelectedId(null); setTourActive(false); }} aria-label="Chiudi approfondimento">×</button>
          <small>{tourActive ? `Tappa ${selectedIndex + 1} di ${hotspots.length}` : selected.eyebrow}</small>
          <h3>{selected.title}</h3>
          <p>{selected.text}</p>
          <div className={styles.storyActions}>
            {tourActive && <button type="button" onClick={() => moveTour(-1)} aria-label="Tappa precedente">←</button>}
            <Link href={selected.href}>Scopri di più →</Link>
            {tourActive && <button type="button" onClick={() => moveTour(1)} aria-label="Tappa successiva">→</button>}
          </div>
        </aside>
      )}
      <p className={styles.hint}><span aria-hidden="true">↔</span> Trascina per esplorare · usa i pulsanti per ingrandire</p>
    </div>
  );
}
