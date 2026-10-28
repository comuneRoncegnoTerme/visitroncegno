"use client";

import { useEffect, useRef } from "react";
import type { ScarecrowName } from "./Scarecrow";
import styles from "./page.module.css";

const FIGURES: { name: ScarecrowName; x: number; h: number }[] = [
  { name: "righe", x: 0.03, h: 0.78 },
  { name: "giacca", x: 0.33, h: 0.7 },
  { name: "legno", x: 0.53, h: 0.84 },
  { name: "grigio", x: 0.76, h: 0.72 },
];

type Leaf = { el: HTMLSpanElement; x: number; y: number; vx: number; vy: number; r: number; life: number };

/** Un campo con quattro spaventapasseri: il dito o il mouse fanno vento, il pulsante manda una raffica. */
export default function ScarecrowField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const figureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gustRef = useRef<() => void>(() => {});

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const figs = figureRefs.current.map((el) => ({ el, a: 0, v: 0, cx: 0 }));
    const leaves: Leaf[] = [];
    let wind = 0;
    let px: number | null = null;

    const measure = () => {
      const fr = field.getBoundingClientRect();
      figs.forEach((f) => {
        const r = f.el?.getBoundingClientRect();
        if (r) f.cx = (r.left - fr.left + r.width / 2) / fr.width;
      });
    };
    const spawnLeaf = (x: number, y: number, vx: number) => {
      if (reduce || leaves.length > 24) return;
      const el = document.createElement("span");
      el.className = styles.leaf;
      field.appendChild(el);
      leaves.push({ el, x, y, vx: vx * 4 + (Math.random() - 0.5) * 2, vy: -1 - Math.random() * 1.5, r: Math.random() * 360, life: 1 });
    };
    const onMove = (e: PointerEvent) => {
      const r = field.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (px !== null) {
        const vx = (x - px) * 60;
        figs.forEach((f) => { f.v += vx * Math.max(0, 1 - Math.abs(f.cx - x) * 3.2) * 1.6; });
        if (Math.abs(vx) > 0.6) spawnLeaf(e.clientX - r.left, e.clientY - r.top, vx);
      }
      px = x;
    };
    const onLeave = () => { px = null; };
    field.addEventListener("pointermove", onMove);
    field.addEventListener("pointerleave", onLeave);
    gustRef.current = () => {
      wind = 3.2;
      const r = field.getBoundingClientRect();
      for (let i = 0; i < 14; i++) spawnLeaf(Math.random() * r.width * 0.3, r.height * (0.2 + Math.random() * 0.5), 1.5 + Math.random());
    };

    let frame = 0, previous = 0, visible = false;
    const loop = (now: number) => {
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      wind *= 0.985;
      const breeze = reduce ? 0 : Math.sin(now / 1300) * 0.6 + Math.sin(now / 530) * 0.25;
      figs.forEach((f, i) => {
        const force = (breeze + wind * (1 + Math.sin(now / 180 + i) * 0.4)) * 6;
        f.v += (force - f.a * 24 - f.v * 3.2) * dt;
        f.a = Math.max(-16, Math.min(16, f.a + f.v * dt * 6));
        if (f.el) f.el.style.transform = `rotate(${f.a}deg) skewX(${-f.v * 0.35}deg)`;
      });
      for (let i = leaves.length - 1; i >= 0; i--) {
        const L = leaves[i];
        L.x += L.vx; L.y += L.vy; L.vy += 0.05; L.vx *= 0.985; L.r += L.vx * 3; L.life -= 0.012;
        L.el.style.transform = `translate(${L.x}px,${L.y}px) rotate(${L.r}deg)`;
        L.el.style.opacity = String(Math.max(0, L.life));
        if (L.life <= 0) { L.el.remove(); leaves.splice(i, 1); }
      }
      frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) { visible = true; previous = 0; measure(); frame = requestAnimationFrame(loop); }
      if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(frame); }
    });
    observer.observe(field);
    addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("resize", measure);
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onLeave);
      leaves.forEach((L) => L.el.remove());
    };
  }, []);

  return (
    <>
      <div ref={fieldRef} className={styles.field} role="img" aria-label="Campo con quattro spaventapasseri. Muovi il dito o il mouse sul campo per fare vento.">
        <svg className={styles.ridge} viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 100 L0 58 C 120 30, 210 52, 300 40 S 470 8, 560 26 S 760 50, 840 30 S 960 22, 1000 34 L1000 100Z" fill="#1d3b38" />
        </svg>
        {FIGURES.map((figure, index) => (
          <div
            key={figure.name}
            ref={(el) => { figureRefs.current[index] = el; }}
            className={styles.scfig}
            style={{ left: `${figure.x * 100}%`, height: `${figure.h * 88}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ritaglio decorativo animato */}
            <img src={`/images/musei/mulino-angeli/sp_${figure.name}.webp`} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <div className={styles.fieldUi}>
        <button className={styles.btn} type="button" onClick={() => gustRef.current()}>Manda una raffica</button>
        <span className={styles.label}>Passa il dito o il mouse sul campo per fare vento</span>
      </div>
    </>
  );
}
