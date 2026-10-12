"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CARTINA_POINTS } from "@/lib/cartina-points";
import styles from "./CartinaTeaser.module.css";

// I nomi che si accendono mentre la cartina scorre: tutti nella fascia del paese.
const TEASER_POINT_IDS = [
  "mulino-angeli",
  "marter",
  "chiesa-santi-pietro-paolo",
  "centro",
  "museo-musica",
  "chiesa-santa-brigida",
];

const TEASER_POINTS = TEASER_POINT_IDS
  .map((id) => CARTINA_POINTS.find((point) => point.id === id))
  .filter((point): point is (typeof CARTINA_POINTS)[number] => Boolean(point));

// L'illustrazione è più larga del riquadro: in verticale si mostra la fascia del paese.
const IMAGE_ASPECT = 2000 / 1429;
const WIDTH_FACTOR = 1.7;
const VERTICAL_FOCUS = 0.58;

type Props = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
};

export default function CartinaTeaser(props: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0.5);
  const [staticView, setStaticView] = useState(false);
  const [size, setSize] = useState({ width: 1200, height: 640 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const measure = () => setSize({ width: section.clientWidth, height: section.clientHeight });
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0 quando la sezione entra dal basso, 1 quando esce dall'alto.
      const value = (viewport - rect.top) / (viewport + rect.height);
      setProgress(Math.min(1, Math.max(0, value)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const applyMotionPreference = () => {
      setStaticView(reduced.matches);
      if (reduced.matches) setProgress(0.5);
    };

    measure();
    applyMotionPreference();
    const observer = new ResizeObserver(measure);
    observer.observe(section);

    // Il calcolo gira solo mentre la sezione è vicina allo schermo.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduced.matches) {
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    }, { rootMargin: "200px 0px" });
    visibility.observe(section);
    reduced.addEventListener("change", applyMotionPreference);

    return () => {
      observer.disconnect();
      visibility.disconnect();
      reduced.removeEventListener("change", applyMotionPreference);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const imageWidth = Math.max(size.width * WIDTH_FACTOR, size.height * IMAGE_ASPECT);
  const imageHeight = imageWidth / IMAGE_ASPECT;
  const travel = imageWidth - size.width;
  const offsetX = -travel * progress;
  const offsetY = -Math.min(imageHeight - size.height, Math.max(0, imageHeight * VERTICAL_FOCUS - size.height / 2));

  // Un nome è "acceso" quando il suo punto è nella parte centrale del riquadro.
  // Su telefono il testo occupa la parte bassa: lì i nomi restano spenti.
  const isLit = (x: number, y: number) => {
    const screenX = imageWidth * (x / 100) + offsetX;
    const screenY = imageHeight * (y / 100) + offsetY;
    const narrow = size.width < 760;
    if (narrow && screenY > size.height * 0.52) return false;
    return staticView || (screenX > size.width * 0.08 && screenX < size.width * 0.92);
  };

  // La formica attraversa il riquadro con il proprio ritmo, un po' più veloce della cartina.
  const antX = 6 + progress * 74;
  const antY = 14 + Math.sin(progress * Math.PI * 2.2) * 5;
  const antTilt = Math.cos(progress * Math.PI * 2.2) * -6;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="cartina-teaser-title">
      <div
        className={styles.illustration}
        style={{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/cartina/cartina-roncegno-home.webp" alt="" loading="lazy" decoding="async" />
        {TEASER_POINTS.map((point) => (
          <Link
            key={point.id}
            href={`/cartina?punto=${point.id}`}
            className={`${styles.tag} ${isLit(point.x, point.y) ? styles.tagLit : ""}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            tabIndex={isLit(point.x, point.y) ? 0 : -1}
          >
            <span>{point.title}</span>
          </Link>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.ant}
        src="/images/cartina/formica-parapendio.webp"
        alt=""
        aria-hidden="true"
        style={{ left: `${antX}%`, top: `${antY}%`, transform: `rotate(${antTilt}deg)` }}
      />

      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.copy}>
        <h2 id="cartina-teaser-title">{props.title}</h2>
        <p>{props.description}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={props.primaryUrl}>{props.primaryLabel}</Link>
          <Link className={styles.secondary} href={props.secondaryUrl}>{props.secondaryLabel}</Link>
        </div>
        <small>Illustrazione di Fabio Vettori</small>
      </div>
    </section>
  );
}
