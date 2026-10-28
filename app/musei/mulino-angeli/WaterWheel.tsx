"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

const RATIO = 6; // lubecchio 48 denti / lanterna 8 fusi, indicativo

// Mondo: X lungo l'albero, Y in alto, Z verso chi guarda.
const WHEEL = { X: 0, R: 112 };
const LUB = { X: 250, R: 86, cog: 13 };
const LAN = { r: 26, X: 250 + 13 + 26 + 2, Y: 86 };
const MAC = { R: 84, Y: 86 + 128 };

type Drop = { x: number; y: number; z: number; vx: number; vy: number };

/** Ruota idraulica → lubecchio → lanterna → macina, disegnati a sanguigna. La chiusa regola l'acqua; si può girare a mano. */
export default function WaterWheel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const wheelTurnsRef = useRef<HTMLElement | null>(null);
  const stoneTurnsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const slider = sliderRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !slider || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) slider.value = "0";

    const css = (name: string) => getComputedStyle(cv).getPropertyValue(name).trim();
    const colors = { ink: css("--ink"), soft: css("--ink-soft"), s: css("--sangue"), b: css("--brenta"), g: css("--grano"), font: css("--f-display") || "Georgia" };

    let W = 0, H = 0, dpr = 1, S = 1, OX = 0, OY = 0;
    let theta = 0, omega = 0, handV = 0, totalR = 0;
    let drops: Drop[] = [];
    let dragX: number | null = null;

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    };
    size();
    addEventListener("resize", size);

    const P = (X: number, Y: number, Z: number): [number, number] => [OX + (X + Z * 0.42) * S, OY + (-Y + Z * 0.22) * S];
    const fit = () => {
      const minX = -WHEEL.R - 60 - 30 * 0.42 - 30, maxX = LAN.X + MAC.R + MAC.R * 0.42 + 60, minY = -(MAC.Y + 40), maxY = WHEEL.R + WHEEL.R * 0.22 + 40;
      S = Math.min(W / (maxX - minX), H / (maxY - minY));
      OX = (W - (maxX - minX) * S) / 2 - minX * S;
      OY = (H - (maxY - minY) * S) / 2 - minY * S;
    };
    const line = (pts: [number, number][], col: string, w = 1.2) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    };
    const ring = (fn: (a: number) => [number, number], n: number, col: string, w: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= n; i++) pts.push(fn((i / n) * Math.PI * 2));
      line(pts, col, w);
    };
    const label = (txt: string, X: number, Y: number, Z: number, dx: number, dy: number) => {
      const [x, y] = P(X, Y, Z);
      ctx.strokeStyle = colors.soft; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
      ctx.fillStyle = colors.ink;
      ctx.font = `italic ${Math.max(13, 15 * S)}px ${colors.font}, Georgia, serif`;
      ctx.textAlign = dx < 0 ? "right" : "left";
      ctx.fillText(txt, x + dx + (dx < 0 ? -4 : 4), y + dy + 4);
    };

    const draw = (dt: number) => {
      if (!W) return;
      const flow = Number(slider.value) / 100;
      omega += (flow * 1.6 - omega) * dt * 1.2 + handV;
      handV *= 0.6;
      if (dragX !== null) omega *= 0.96;
      theta += omega * dt;
      totalR += Math.abs(omega * dt) / (Math.PI * 2);
      if (wheelTurnsRef.current) wheelTurnsRef.current.textContent = String(Math.floor(totalR));
      if (stoneTurnsRef.current) stoneTurnsRef.current.textContent = String(Math.floor(totalR * RATIO));
      const phi = theta * RATIO;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      fit();
      const ink = colors.s, inkS = colors.ink;

      // muro
      const wx = 150;
      line([P(wx, -WHEEL.R - 10, -60), P(wx, MAC.Y + 30, -60)], colors.soft, 0.8);
      line([P(wx, -WHEEL.R - 10, 60), P(wx, MAC.Y + 30, 60)], colors.soft, 0.8);
      for (let y = -WHEEL.R; y < MAC.Y + 20; y += 22) line([P(wx, y, -60), P(wx, y + 14, 60)], colors.soft, 0.5);

      // acqua: canaletta e gocce
      line([P(-WHEEL.R - 60, WHEEL.R + 30, -30), P(-20, WHEEL.R + 16, -30)], colors.b, 2);
      line([P(-WHEEL.R - 60, WHEEL.R + 30, 30), P(-20, WHEEL.R + 16, 30)], colors.b, 2);
      if (!reduce && Math.random() < flow * 1.4) drops.push({ x: -20 + Math.random() * 10, y: WHEEL.R + 14, z: (Math.random() - 0.5) * 50, vy: 0, vx: 28 });
      ctx.fillStyle = colors.b;
      drops = drops.filter((d) => {
        d.vy -= 420 * dt; d.y += d.vy * dt; d.x += d.vx * dt;
        const [x, y] = P(d.x, d.y, d.z);
        ctx.fillRect(x, y, 1.6, 3.2);
        return d.y > -WHEEL.R - 30;
      });

      // ruota idraulica (piano Y-Z)
      const wpt = (r: number, a: number) => P(WHEEL.X, r * Math.cos(a), r * Math.sin(a));
      for (const side of [-8, 8]) ring((a) => P(WHEEL.X + side, WHEEL.R * Math.cos(a), WHEEL.R * Math.sin(a)), 64, ink, 1.3);
      ring((a) => wpt(WHEEL.R * 0.58, a), 48, ink, 0.9);
      for (let i = 0; i < 16; i++) {
        const a = theta + (i * Math.PI) / 8, c = Math.cos(a), s = Math.sin(a);
        line([wpt(0, a), wpt(WHEEL.R * 0.58, a)], ink, 0.8);
        line([
          P(WHEEL.X - 8, WHEEL.R * 0.58 * c, WHEEL.R * 0.58 * s),
          P(WHEEL.X - 8, (WHEEL.R + 14) * c, (WHEEL.R + 14) * s),
          P(WHEEL.X + 8, (WHEEL.R + 14) * c, (WHEEL.R + 14) * s),
          P(WHEEL.X + 8, WHEEL.R * 0.58 * c, WHEEL.R * 0.58 * s),
        ], ink, 1);
      }

      // albero orizzontale
      line([P(WHEEL.X - 20, 3, 0), P(LUB.X + 8, 3, 0)], inkS, 1.4);
      line([P(WHEEL.X - 20, -3, 0), P(LUB.X + 8, -3, 0)], inkS, 1.4);

      // lubecchio (piano Y-Z, denti verso +X)
      ring((a) => P(LUB.X, LUB.R * Math.cos(a), LUB.R * Math.sin(a)), 64, ink, 1.4);
      ring((a) => P(LUB.X, LUB.R * 0.86 * Math.cos(a), LUB.R * 0.86 * Math.sin(a)), 64, ink, 0.8);
      for (let i = 0; i < 4; i++) {
        const a = theta + (i * Math.PI) / 4, r = LUB.R * 0.86;
        line([P(LUB.X, r * Math.cos(a), r * Math.sin(a)), P(LUB.X, -r * Math.cos(a), -r * Math.sin(a))], ink, 0.9);
      }
      for (let i = 0; i < 48; i++) {
        const a = theta + (i * Math.PI) / 24, c = Math.cos(a), s = Math.sin(a), r = LUB.R * 0.93;
        line([P(LUB.X, r * c, r * s), P(LUB.X + LUB.cog, r * c, r * s)], inkS, s > 0 ? 1.3 : 0.6);
      }

      // lanterna (asse verticale)
      const lanY0 = LAN.Y - 16, lanY1 = LAN.Y + 16;
      ring((a) => P(LAN.X + LAN.r * Math.cos(a), lanY0, LAN.r * Math.sin(a)), 40, ink, 1.1);
      ring((a) => P(LAN.X + LAN.r * Math.cos(a), lanY1, LAN.r * Math.sin(a)), 40, ink, 1.1);
      for (let i = 0; i < 8; i++) {
        const a = phi + (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
        line([P(LAN.X + LAN.r * 0.82 * c, lanY0, LAN.r * 0.82 * s), P(LAN.X + LAN.r * 0.82 * c, lanY1, LAN.r * 0.82 * s)], inkS, s > 0 ? 1.6 : 0.6);
      }

      // fuso verticale
      line([P(LAN.X - 3, lanY0 - 6, 0), P(LAN.X - 3, MAC.Y, 0)], inkS, 1.3);
      line([P(LAN.X + 3, lanY0 - 6, 0), P(LAN.X + 3, MAC.Y, 0)], inkS, 1.3);

      // pavimento del castello
      const fy = MAC.Y - 14, x0 = LAN.X - MAC.R - 30, x1 = LAN.X + MAC.R + 30, z0 = -MAC.R - 10, z1 = MAC.R + 10;
      line([P(x0, fy, z0), P(x1, fy, z0), P(x1, fy, z1), P(x0, fy, z1), P(x0, fy, z0)], colors.soft, 0.8);

      // macina
      ring((a) => P(LAN.X + MAC.R * Math.cos(a), MAC.Y, MAC.R * Math.sin(a)), 64, ink, 1.3);
      ring((a) => P(LAN.X + MAC.R * Math.cos(a), MAC.Y + 16, MAC.R * Math.sin(a)), 64, ink, 1.3);
      [0, Math.PI].forEach((a) => line([P(LAN.X + MAC.R * Math.cos(a), MAC.Y, 0), P(LAN.X + MAC.R * Math.cos(a), MAC.Y + 16, 0)], ink, 1.3));
      ring((a) => P(LAN.X + 12 * Math.cos(a), MAC.Y + 16, 12 * Math.sin(a)), 24, ink, 1);
      for (let i = 0; i < 10; i++) {
        const a = phi + (i * Math.PI) / 5, c = Math.cos(a), s = Math.sin(a);
        line([P(LAN.X + 16 * c, MAC.Y + 16, 16 * s), P(LAN.X + MAC.R * 0.95 * c - 18 * s, MAC.Y + 16, MAC.R * 0.95 * s + 18 * c)], colors.g, 1.1);
      }
      for (let i = 0; i < 6; i++) {
        const a = phi + (i * Math.PI) / 3;
        if (Math.sin(a) > 0) {
          const [x, y] = P(LAN.X + MAC.R * Math.cos(a), MAC.Y + 8, MAC.R * Math.sin(a));
          ctx.fillStyle = ink; ctx.fillRect(x - 1, y - 3, 2, 6);
        }
      }

      // etichette
      label("ruota", WHEEL.X, -WHEEL.R * 0.7, -WHEEL.R * 0.7, -26, 22);
      label("lubecchio", LUB.X, -LUB.R * 0.8, 30, -20, 34);
      label("lanterna", LAN.X + LAN.r, LAN.Y, 0, 40, 4);
      label("macina", LAN.X + MAC.R, MAC.Y + 16, 0, 26, -14);
      label("dal canale", -WHEEL.R - 50, WHEEL.R + 28, -30, 6, -20);
    };

    const onDown = (e: PointerEvent) => { dragX = e.clientX; cv.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { if (dragX === null) return; handV += (e.clientX - dragX) * 0.02; dragX = e.clientX; };
    const onUp = () => { dragX = null; };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);

    // Si disegna solo mentre la ruota è sullo schermo.
    let frame = 0, previous = 0, visible = false;
    const loop = (now: number) => {
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      draw(dt);
      frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) { visible = true; previous = 0; size(); frame = requestAnimationFrame(loop); }
      if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(frame); }
    });
    observer.observe(cv);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("resize", size);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className={styles.stage}>
      <canvas
        ref={canvasRef}
        className={styles.wheelCanvas}
        role="img"
        aria-label="Disegno animato: la ruota ad acqua, il lubecchio, la lanterna e la macina. Trascina per girare la ruota a mano."
      />
      <div className={styles.controls}>
        <label htmlFor="chiusa">Apri la chiusa</label>
        <input ref={sliderRef} id="chiusa" type="range" min="0" max="100" defaultValue="55" />
        <div className={styles.readout}>
          <span>ruota <b ref={wheelTurnsRef}>0</b> giri</span>
          <span>macina <b ref={stoneTurnsRef}>0</b> giri</span>
        </div>
      </div>
      <p className={styles.note}>Puoi anche trascinare il disegno per girare la ruota a mano. Il numero di denti è indicativo.</p>
    </div>
  );
}
