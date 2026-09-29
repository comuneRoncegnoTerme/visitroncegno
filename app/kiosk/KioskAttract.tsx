"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import KioskWeather from "./KioskWeather";
import styles from "./KioskAttract.module.css";

export type KioskAttractSlide = {
  eyebrow: string;
  title: string;
  description?: string | null;
  image?: string | null;
};

type NextEvent = {
  title: string;
  date: string;
  location: string;
  href: string;
};

const IDLE_BEFORE_ATTRACT_MS = 60_000;
const SLIDE_INTERVAL_MS = 12_000;

export default function KioskAttract({
  slides,
  nextEvent,
}: {
  slides: KioskAttractSlide[];
  nextEvent?: NextEvent | null;
}) {
  const usableSlides = useMemo(() => slides.filter((slide) => slide.title), [slides]);
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!usableSlides.length) return;

    if (visible) {
      const slideTimer = window.setInterval(() => {
        setIndex((current) => (current + 1) % usableSlides.length);
      }, SLIDE_INTERVAL_MS);
      return () => window.clearInterval(slideTimer);
    }

    let idleTimer: number | null = null;
    const resetIdle = () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setIndex(0);
        setVisible(true);
      }, IDLE_BEFORE_ATTRACT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "pointermove", "keydown", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdle));
    };
  }, [usableSlides, visible]);

  if (!visible || !usableSlides.length) return null;
  const slide = usableSlides[index];

  return (
    <div
      className={styles.overlay}
      role="button"
      tabIndex={0}
      onClick={() => setVisible(false)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") setVisible(false);
      }}
      aria-label="Tocca per esplorare Roncegno"
    >
      <div
        key={index}
        className={styles.image}
        style={slide.image ? { backgroundImage: `url('${slide.image}')` } : undefined}
      />
      <div className={styles.shade} />

      <div className={styles.topBar}>
        <div className={styles.identity}>
          <span>Infopoint digitale</span>
          <strong>Roncegno Terme</strong>
        </div>

        <div className={styles.ambientInfo}>
          <div className={styles.timeBlock}>
            <strong data-kiosk-clock>--:--</strong>
            <span data-kiosk-date>Roncegno Terme</span>
          </div>
          <KioskWeather className={styles.weather} />
        </div>
      </div>

      <div className={styles.copy}>
        <p>{slide.eyebrow}</p>
        <h2>Roncegno<br />Terme</h2>
        <span>{slide.description ?? slide.title}</span>
      </div>

      <div className={styles.slideCaption}>
        <small>{slide.eyebrow}</small>
        <strong>{slide.title}</strong>
      </div>

      {nextEvent && (
        <Link
          className={styles.nextEvent}
          href={nextEvent.href}
          onClick={(event) => event.stopPropagation()}
        >
          <small>Prossimo appuntamento</small>
          <strong>{nextEvent.title}</strong>
          <span>{nextEvent.date} · {nextEvent.location}</span>
          <b aria-hidden="true">→</b>
        </Link>
      )}

      <div className={styles.touch}>
        <span className={styles.touchDot} aria-hidden="true" />
        <div>
          <strong>Tocca per esplorare</strong>
          <span>Luoghi, percorsi, eventi e informazioni utili</span>
        </div>
      </div>

      <div className={styles.dots} aria-hidden="true">
        {usableSlides.map((_, slideIndex) => (
          <span className={slideIndex === index ? styles.activeDot : undefined} key={slideIndex} />
        ))}
      </div>
    </div>
  );
}
