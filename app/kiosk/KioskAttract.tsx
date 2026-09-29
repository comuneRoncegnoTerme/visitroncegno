"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./KioskAttract.module.css";

export type KioskAttractSlide = {
  eyebrow: string;
  title: string;
  description?: string | null;
  image?: string | null;
};

const IDLE_BEFORE_ATTRACT_MS = 35_000;
const SLIDE_INTERVAL_MS = 9_000;

export default function KioskAttract({ slides }: { slides: KioskAttractSlide[] }) {
  const usableSlides = useMemo(() => slides.filter((slide) => slide.title), [slides]);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!usableSlides.length) return;

    let idleTimer: number | null = null;
    let slideTimer: number | null = null;

    const startSlides = () => {
      setVisible(true);
      setIndex(0);
      if (slideTimer) window.clearInterval(slideTimer);
      slideTimer = window.setInterval(() => {
        setIndex((current) => (current + 1) % usableSlides.length);
      }, SLIDE_INTERVAL_MS);
    };

    const resetIdle = () => {
      setVisible(false);
      if (slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(startSlides, IDLE_BEFORE_ATTRACT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "pointermove", "keydown", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      if (slideTimer) window.clearInterval(slideTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdle));
    };
  }, [usableSlides]);

  if (!visible || !usableSlides.length) return null;
  const slide = usableSlides[index];

  return (
    <button className={styles.overlay} type="button" onClick={() => setVisible(false)} aria-label="Tocca per esplorare">
      <div
        className={styles.image}
        style={slide.image ? { backgroundImage: `url('${slide.image}')` } : undefined}
      />
      <div className={styles.shade} />
      <div className={styles.brand}>Visit Roncegno · Infopoint digitale</div>
      <div className={styles.copy}>
        <p>{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        {slide.description && <span>{slide.description}</span>}
      </div>
      <div className={styles.touch}>
        <strong>Tocca lo schermo</strong>
        <span>per esplorare Roncegno</span>
      </div>
      <div className={styles.dots} aria-hidden="true">
        {usableSlides.map((_, slideIndex) => (
          <span className={slideIndex === index ? styles.activeDot : undefined} key={slideIndex} />
        ))}
      </div>
    </button>
  );
}
