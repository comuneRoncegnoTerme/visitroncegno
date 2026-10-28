"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export type ScarecrowName = "giacca" | "grigio" | "righe" | "legno";

export const SCARECROWS: Record<ScarecrowName, { title: string; text: string }> = {
  giacca: { title: "Giacca della festa", text: "Giacca scura, fazzoletto rosso e cappello di feltro. La testa è un blocco di legno dipinto." },
  grigio: { title: "Giacca da lavoro", text: "Giacca grigia, foulard bianco e un cappello con la penna, sulla stessa testa di legno." },
  righe: { title: "Camicione a righe", text: "Braccia aperte su un bastone, faccia disegnata a pennarello e cappello di tela." },
  legno: { title: "Il manichino", text: "Snodato, di legno, con orecchini di catena, montato su un’asta di ferro." },
};

type Props = { name: ScarecrowName; width: string; left: string; top: string; tilt?: number };

/** Uno spaventapasseri ritagliato: si trascina, ondeggia quando si scorre la pagina e, toccato, mostra il cartellino. */
export default function Scarecrow({ name, width, left, top, tilt = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const motion = useRef({ dx: 0, dy: 0, angle: 0, velocity: 0 });
  const [tag, setTag] = useState<null | "left" | "right">(null);
  const note = SCARECROWS[name];

  // Molla smorzata: lo spaventapasseri oscilla e torna dritto.
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = scrollY;
    let scrollVelocity = 0;
    let previous = performance.now();
    let frame = 0;
    const onScroll = () => { scrollVelocity += (scrollY - lastY) * 0.04; lastY = scrollY; };
    addEventListener("scroll", onScroll, { passive: true });
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      scrollVelocity *= 0.88;
      const m = motion.current;
      m.velocity += (-m.angle * 38 - m.velocity * 6.5) * dt + (reduce ? 0 : scrollVelocity * 0.9);
      m.angle += m.velocity * dt * 6;
      if (wrapRef.current) wrapRef.current.style.transform = `translate(${m.dx}px,${m.dy}px)`;
      if (bodyRef.current) bodyRef.current.style.transform = `rotate(${tilt + Math.max(-28, Math.min(28, m.angle))}deg)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", onScroll); };
  }, [tilt]);

  useEffect(() => {
    if (!tag) return;
    const close = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setTag(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tag]);

  function toggleTag() {
    if (tag) return setTag(null);
    const rect = wrapRef.current?.getBoundingClientRect();
    setTag(rect && rect.left + 250 > document.documentElement.clientWidth ? "right" : "left");
  }

  const drag = useRef<{ id: number; x: number; y: number; dx: number; dy: number; moved: boolean } | null>(null);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const m = motion.current;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: m.dx, dy: m.dy, moved: false };
    wrapRef.current?.setAttribute("data-dragging", "");
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const mx = event.clientX - d.x;
    const my = event.clientY - d.y;
    if (Math.abs(mx) + Math.abs(my) > 5) d.moved = true;
    if (!d.moved) return;
    const m = motion.current;
    m.velocity += (event.movementX || 0) * 0.12;
    m.dx = d.dx + mx;
    m.dy = d.dy + my;
    setTag(null);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    wrapRef.current?.removeAttribute("data-dragging");
    if (!d.moved) toggleTag();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const m = motion.current;
    const step = event.shiftKey ? 30 : 10;
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleTag(); }
    if (event.key === "Escape") setTag(null);
    if (event.key === "ArrowLeft") { event.preventDefault(); m.dx -= step; m.velocity -= 2; }
    if (event.key === "ArrowRight") { event.preventDefault(); m.dx += step; m.velocity += 2; }
    if (event.key === "ArrowUp") { event.preventDefault(); m.dy -= step; }
    if (event.key === "ArrowDown") { event.preventDefault(); m.dy += step; }
  }

  return (
    <div ref={wrapRef} className={styles.sticker} style={{ width, left, top }}>
      <div
        ref={bodyRef}
        className={styles.stickerBody}
        role="button"
        tabIndex={0}
        aria-expanded={tag !== null}
        aria-label={`Spaventapasseri: ${note.title}. Trascina per spostarlo, tocca per leggere.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ritaglio decorativo che si trascina */}
        <img src={`/images/musei/mulino-angeli/sp_${name}.webp`} alt="" draggable={false} />
      </div>
      {tag && (
        <div className={styles.tag} data-align={tag} role="note">
          <b>{note.title}</b>
          {note.text}
        </div>
      )}
    </div>
  );
}
