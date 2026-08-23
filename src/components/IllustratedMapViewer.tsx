"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IllustratedMapViewer.module.css";

type Props = {
  src: string;
  alt: string;
  initialScale?: number;
  mobileScale?: number;
};

export default function IllustratedMapViewer({
  src,
  alt,
  initialScale = 1,
  mobileScale = 2.2,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [scale, setScale] = useState(initialScale);

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

  return (
    <div className={styles.shell}>
      <div className={styles.controls} aria-label="Controlli cartina">
        <button type="button" onClick={() => updateScale(scale - 0.25)} disabled={scale <= 1} aria-label="Riduci zoom">−</button>
        <span aria-live="polite">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => updateScale(scale + 0.25)} disabled={scale >= 3} aria-label="Aumenta zoom">+</button>
        <button className={styles.reset} type="button" onClick={reset}>Centra</button>
        <button className={styles.fullscreen} type="button" onClick={() => frameRef.current?.requestFullscreen?.()}>Schermo intero</button>
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
        {/* A native image allows continuous touch/drag zoom without Next Image layout constraints. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ width: `${scale * 100}%` }}
          onLoad={() => {
            if (!frameRef.current || !window.matchMedia("(max-width: 760px)").matches) return;
            frameRef.current.scrollLeft = (frameRef.current.scrollWidth - frameRef.current.clientWidth) / 2;
            frameRef.current.scrollTop = 0;
          }}
        />
      </div>
      <p className={styles.hint}><span aria-hidden="true">↔</span> Trascina per esplorare · usa i pulsanti per ingrandire</p>
    </div>
  );
}
