"use client";

import { useEffect, useRef } from "react";
import styles from "./FestaExtras.module.css";

type Ember = { x: number; y: number; vx: number; vy: number; size: number; life: number; age: number; wobble: number };

// Braci che salgono dal fuoco delle caldarroste, sopra la foto dell'hero.
// Si ferma quando l'hero esce dallo schermo e non parte con "riduci movimento".
export default function FestaEmbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let last = 0;
    const embers: Ember[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    // Le braci nascono dal tamburo delle caldarroste, in basso a destra nella foto.
    const spawn = (): Ember => ({
      x: width * (0.38 + Math.random() * 0.58),
      y: height * (0.74 + Math.random() * 0.22),
      vx: (Math.random() - 0.5) * 18,
      vy: -(40 + Math.random() * 70),
      size: 1 + Math.random() * 2.4,
      life: 3 + Math.random() * 4,
      age: 0,
      wobble: Math.random() * Math.PI * 2,
    });

    const draw = (time: number) => {
      const delta = Math.min(0.05, (time - last) / 1000 || 0.016);
      last = time;
      const target = Math.round(Math.min(70, width / 18));
      while (embers.length < target && Math.random() < 0.4) embers.push(spawn());

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      for (let index = embers.length - 1; index >= 0; index -= 1) {
        const ember = embers[index];
        ember.age += delta;
        ember.wobble += delta * 2;
        ember.x += (ember.vx + Math.sin(ember.wobble) * 14) * delta;
        ember.y += ember.vy * delta;
        const progress = ember.age / ember.life;
        if (progress >= 1 || ember.y < -10) {
          embers.splice(index, 1);
          continue;
        }
        // Accese all'inizio, si spengono salendo; un leggero tremolio.
        const alpha = Math.sin(Math.PI * Math.min(1, progress * 1.4)) * (0.65 + Math.random() * 0.35);
        const radius = ember.size * (1 - progress * 0.5);
        const glow = context.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, radius * 4);
        glow.addColorStop(0, `rgba(255, 214, 140, ${alpha})`);
        glow.addColorStop(0.35, `rgba(255, 128, 40, ${alpha * 0.6})`);
        glow.addColorStop(1, "rgba(255, 90, 20, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(ember.x, ember.y, radius * 4, 0, Math.PI * 2);
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.embers} aria-hidden="true" />;
}
