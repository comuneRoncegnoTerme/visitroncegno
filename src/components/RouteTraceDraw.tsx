"use client";

import { useEffect, useRef, useState } from "react";
import type { RouteTrace } from "@/lib/route-trace";
import styles from "./RouteTraceDraw.module.css";

// La traccia GPX del percorso si disegna la prima volta che la scheda entra nello schermo.
export default function RouteTraceDraw({ trace, className }: { trace: RouteTrace; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`${styles.trace} ${visible ? styles.drawn : ""} ${className ?? ""}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path className={styles.shadow} d={trace.path} pathLength={1} />
      <path className={styles.line} d={trace.path} pathLength={1} />
      <circle className={styles.start} cx={trace.start[0]} cy={trace.start[1]} r={2.6} />
      <circle className={styles.end} cx={trace.end[0]} cy={trace.end[1]} r={2.6} />
    </svg>
  );
}
