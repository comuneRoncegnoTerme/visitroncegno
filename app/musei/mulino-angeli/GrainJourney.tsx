"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const NS = "http://www.w3.org/2000/svg";

const NAMES: Record<string, string> = {
  "1": "Mulino a cilindri",
  "2": "Mulino a palmenti",
  "3": "Contenitore per la raccolta delle granaglie",
  "4": "Ingranaggi di movimento, sotto il castello",
  "5.1": "Tramoggia semplice",
  "5.2": "Tramoggia con buratto",
  "6": "Vite senza fine",
  "7": "Buratto per farina",
  "8": "Albero di trasmissione del movimento ai buratti e al ventilabro",
  "9": "Mensola con i tubi di raccolta degli scarti dal ventilabro",
  "10": "Ventilabro con staccio piano",
  "11": "Buratto per farina",
  "12": "Buratto per farina",
  "13": "Canali elevatori con cinghie in tela e cassettine metalliche, le tazete",
};

const SPOTS: Record<string, [number, number]> = {
  "3": [82, 446], "4": [215, 440], "2": [146, 398], "1": [278, 398], "5.2": [134, 322], "5.1": [288, 336], "8": [255, 262],
  "6": [230, 306], "7": [318, 302], "9": [106, 348], "10": [93, 190], "11": [182, 202], "12": [288, 202], "13": [150, 128],
};

// Il tratto del chicco per arrivare a ciascun passo (il passo 0 è il punto di partenza).
const ROUTES: ([number, number][] | null)[] = [
  null,
  [[82, 466], [134, 466], [134, 180], [110, 196], [93, 212]],
  [[93, 212], [120, 244], [160, 262], [175, 300], [175, 345]],
  [[175, 345], [175, 372], [175, 398]],
  [[175, 398], [200, 476], [338, 476], [338, 180], [300, 206], [288, 228]],
  [[288, 228], [318, 236]],
];
const START: [number, number] = [82, 466];
const PULA: [number, number][] = [[93, 226], [80, 262], [80, 326]];
const ACTIVE = [["3"], ["13", "10"], ["10", "9", "5.1", "5.2"], ["4", "2", "1"], ["13", "11", "12"], ["11", "12", "7", "6", "8"]];
const CAPTION = ["3", "13", "10", "2", "12", "11"];

function Num({ children }: { children: string }) {
  return <span className={children.length > 2 ? `${styles.num} ${styles.numWide}` : styles.num}>{children}</span>;
}

const STEPS: { floor: string; title: string; body: React.ReactNode }[] = [
  {
    floor: "Piano terra",
    title: "Il carico",
    body: <>Il granoturco e gli altri cereali arrivano in sacchi e vengono versati nel contenitore di raccolta <Num>3</Num>.</>,
  },
  {
    floor: "Dal piano terra al secondo",
    title: "Sale con le tazete",
    body: <>Un elevatore porta il grano fino in soffitta. È una cinghia di tela con una fila di <i>tazete</i>, piccoli cucchiai di ferro che salgono pieni e scendono vuoti <Num>13</Num>. In cima il grano entra nel ventilabro <Num>10</Num>.</>,
  },
  {
    floor: "Secondo piano · locale buratti",
    title: "La pulizia",
    body: <>Il ventilabro è un grande cassone di legno con una ventola dentro. Una rete metallica vibra e stacca la pula dai chicchi; la corrente d’aria delle pale spinge pula e pagliuzze giù, fino alla mensola di raccolta degli scarti <Num>9</Num>. I chicchi scivolano su uno staccio inclinato e scendono alle tramogge <Num>5.1</Num> <Num>5.2</Num>.</>,
  },
  {
    floor: "Piano terra · locale molitura",
    title: "Sotto le macine",
    body: <>Dalle tramogge il grano cade per gravità sulle macine. Sul castello, sopra gli ingranaggi <Num>4</Num>, lavorano due sistemi diversi: il mulino a palmenti con le macine di pietra <Num>2</Num> e il mulino a cilindri <Num>1</Num>.</>,
  },
  {
    floor: "Di nuovo in soffitta",
    title: "Risale come farina",
    body: <>Il macinato torna in alto lungo i canali elevatori <Num>13</Num> fino ai due grandi buratti del secondo piano <Num>11</Num> <Num>12</Num>.</>,
  },
  {
    floor: "Secondo e primo piano",
    title: "Farina e crusca",
    body: <>Il buratto separa la farina dalla crusca, con un cilindro coperto di tele di diversa fittezza o con uno staccio piano che oscilla. Al primo piano un altro buratto <Num>7</Num> e la vite senza fine <Num>6</Num> fanno un ultimo vaglio, e la farina finisce nei sacchi agganciati alla struttura. A muovere buratti e ventilabro è l’albero di trasmissione <Num>8</Num>.</>,
  },
];

type Opt = { w?: number; col?: string; close?: boolean; fill?: string; j?: number; op?: number };

/** Disegna la sezione del mulino a mano libera; restituisce i pezzi che si animano. */
function drawMill(svg: SVGSVGElement, reduce: boolean, onSpot: (key: string) => void) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647), seed / 2147483647 - 0.5);
  const layer = document.createElementNS(NS, "g");
  svg.appendChild(layer);

  // Ogni tratto è ripassato due volte, un po' storto, come gli schizzi a sanguigna dei pannelli.
  const sk = (parent: Element, pts: [number, number][], opt: Opt = {}) => {
    const { w = 1.1, col = "var(--sangue)", close = false, fill = "none", j = 1.1, op = 1 } = opt;
    for (let pass = 0; pass < 2; pass++) {
      const P2 = close ? [...pts, pts[0]] : pts;
      let d = "";
      P2.forEach((p, i) => {
        const x = p[0] + rnd() * j, y = p[1] + rnd() * j;
        if (!i) d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
        else {
          const q = P2[i - 1];
          const mx = (q[0] + p[0]) / 2 + rnd() * j * 1.4, my = (q[1] + p[1]) / 2 + rnd() * j * 1.4;
          d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      const e = document.createElementNS(NS, "path");
      e.setAttribute("d", d);
      e.setAttribute("fill", pass ? "none" : fill);
      e.setAttribute("stroke", col);
      e.setAttribute("stroke-width", String(pass ? w * 0.5 : w));
      e.setAttribute("opacity", String(pass ? op * 0.55 : op));
      e.setAttribute("stroke-linecap", "round");
      e.setAttribute("stroke-linejoin", "round");
      parent.appendChild(e);
    }
  };
  const rect = (p: Element, x: number, y: number, w: number, h: number, o: Opt = {}) => sk(p, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { close: true, ...o });
  const circ = (p: Element, cx: number, cy: number, r: number, o: Opt = {}, n = 18) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    sk(p, pts, { close: true, ...o });
  };
  const txt = (p: Element, s: string, x: number, y: number, col = "var(--ink-soft)") => {
    const e = document.createElementNS(NS, "text");
    e.textContent = s;
    e.setAttribute("x", String(x));
    e.setAttribute("y", String(y));
    e.style.fontFamily = "var(--f-type), monospace";
    e.setAttribute("font-size", "8.5");
    e.setAttribute("letter-spacing", ".6");
    e.setAttribute("fill", col);
    p.appendChild(e);
  };

  const L = layer;
  const woodFill = "color-mix(in srgb, var(--sangue) 12%, transparent)";
  // tetto, muri, solai
  sk(L, [[22, 150], [200, 52], [378, 150]], { w: 1.5 });
  sk(L, [[40, 140], [40, 490]], { w: 1.6 });
  sk(L, [[360, 140], [360, 490]], { w: 1.6 });
  [150, 250, 370].forEach((y) => { sk(L, [[40, y], [360, y]], { w: 1.2 }); sk(L, [[40, y + 5], [360, y + 5]], { w: 0.6, op: 0.6 }); });
  sk(L, [[10, 490], [430, 490]], { w: 1.6, col: "var(--ink)" });
  for (let x = 14; x < 430; x += 13) sk(L, [[x, 494], [x - 6, 503]], { w: 0.5, col: "var(--ink-soft)", op: 0.7 });
  // travi del tetto
  for (let i = 1; i < 6; i++) {
    const x = 40 + i * 53;
    const yTop = x < 200 ? 150 - ((x - 22) / 178) * 98 : 52 + ((x - 200) / 178) * 98;
    sk(L, [[x, yTop + 4], [x, 150]], { w: 0.5, op: 0.5 });
  }
  txt(L, "2° PIANO", 48, 166);
  txt(L, "1° PIANO", 48, 266);
  txt(L, "PIANO TERRA", 48, 386);
  // ruota esterna sul Brenta
  const wheel = document.createElementNS(NS, "g");
  svg.appendChild(wheel);
  wheel.style.transformOrigin = "396px 454px";
  circ(wheel, 396, 454, 34, { w: 1.3 }, 22);
  circ(wheel, 396, 454, 8, { w: 0.9 }, 10);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    sk(wheel, [[396 + 8 * Math.cos(a), 454 + 8 * Math.sin(a)], [396 + 38 * Math.cos(a), 454 + 38 * Math.sin(a)]], { w: 0.9 });
  }
  const spin = reduce ? null : wheel.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 9000, iterations: Infinity });
  sk(L, [[364, 416], [428, 410]], { w: 1, col: "var(--ink-soft)" });
  for (let i = 0; i < 5; i++) sk(L, [[372 + i * 12, 500], [378 + i * 12, 508], [384 + i * 12, 500]], { w: 0.8, col: "var(--brenta)" });
  txt(L, "BRENTA", 372, 518, "var(--brenta)");
  // macchine — piano terra
  rect(L, 62, 452, 40, 30, { fill: woodFill }); // 3 contenitore
  rect(L, 132, 420, 176, 10, { fill: woodFill }); // castello
  sk(L, [[150, 430], [150, 490]], { w: 0.8 });
  sk(L, [[290, 430], [290, 490]], { w: 0.8 });
  circ(L, 215, 462, 14, { w: 1 }, 14); // 4 ingranaggi
  circ(L, 215, 462, 4, { w: 0.7 }, 8);
  sk(L, [[156, 420], [156, 404], [194, 404], [194, 420]], { fill: woodFill }); // 2 palmenti
  sk(L, [[160, 404], [166, 394], [184, 394], [190, 404]], { w: 0.8 });
  rect(L, 242, 396, 26, 24, { fill: woodFill }); // 1 cilindri
  circ(L, 255, 408, 6, { w: 0.8 }, 10);
  sk(L, [[165, 375], [185, 375], [178, 392], [172, 392]], { w: 0.8 }); // bocche delle tramogge
  sk(L, [[245, 375], [265, 375], [258, 394], [252, 394]], { w: 0.8 });
  // primo piano
  sk(L, [[150, 300], [200, 300], [184, 368], [166, 368]], { fill: woodFill }); // 5.2
  rect(L, 148, 290, 54, 12, { w: 0.8 }); // buratto sopra la 5.2
  sk(L, [[232, 304], [278, 304], [262, 368], [248, 368]], { fill: woodFill }); // 5.1
  sk(L, [[44, 275], [356, 275]], { w: 1, col: "var(--ink)" }); // 8 albero
  [110, 205, 300].forEach((x) => circ(L, x, 275, 6, { w: 0.8, col: "var(--ink)" }, 10));
  rect(L, 292, 318, 52, 30, { fill: woodFill }); // 7 buratto
  sk(L, [[218, 292], [222, 286], [226, 292], [230, 286], [234, 292], [238, 286], [242, 292]], { w: 0.9 }); // 6 vite
  rect(L, 62, 330, 36, 6, { fill: woodFill }); // 9 mensola
  sk(L, [[70, 336], [70, 350]], { w: 0.7 });
  sk(L, [[90, 336], [90, 350]], { w: 0.7 });
  // secondo piano
  rect(L, 70, 202, 46, 40, { fill: woodFill }); // 10 ventilabro
  circ(L, 93, 214, 7, { w: 0.8 }, 10);
  rect(L, 152, 214, 60, 30, { fill: woodFill }); // 11 buratto
  rect(L, 258, 214, 60, 30, { fill: woodFill }); // 12 buratto
  // 13 elevatori a casetta
  [134, 338].forEach((x) => {
    sk(L, [[x - 5, 490], [x - 5, 184]], { w: 0.9 });
    sk(L, [[x + 5, 490], [x + 5, 184]], { w: 0.9 });
    sk(L, [[x - 11, 184], [x - 11, 170], [x, 162], [x + 11, 170], [x + 11, 184]], { close: true, fill: woodFill });
    circ(L, x, 176, 3.5, { w: 0.7 }, 8);
  });
  // sacco
  sk(L, [[322, 246], [318, 236], [322, 226], [336, 226], [340, 236], [336, 246]], { close: true, w: 0.9, col: "var(--ink)", fill: "color-mix(in srgb, var(--grano) 30%, transparent)" });

  // percorso del chicco
  const routes = ROUTES.map((route) => {
    if (!route) return null;
    const e = document.createElementNS(NS, "path");
    e.setAttribute("d", "M" + route.map((p) => p.join(" ")).join(" L"));
    e.setAttribute("fill", "none");
    e.setAttribute("stroke", "var(--grano)");
    e.setAttribute("stroke-width", "1.4");
    e.setAttribute("stroke-dasharray", "3 4");
    e.setAttribute("opacity", "0");
    svg.appendChild(e);
    return e;
  });
  const pula = document.createElementNS(NS, "path");
  pula.setAttribute("d", "M" + PULA.map((p) => p.join(" ")).join(" L"));
  pula.setAttribute("fill", "none");
  pula.setAttribute("stroke", "var(--ink-soft)");
  pula.setAttribute("stroke-dasharray", "1 4");
  pula.setAttribute("stroke-width", "1.6");
  pula.setAttribute("stroke-linecap", "round");
  pula.setAttribute("opacity", "0");
  svg.appendChild(pula);

  // numeri dei pannelli
  const spots: Record<string, SVGGElement> = {};
  Object.entries(SPOTS).forEach(([key, [x, y]]) => {
    const e = document.createElementNS(NS, "g");
    e.setAttribute("class", styles.spot);
    e.setAttribute("tabindex", "0");
    e.setAttribute("role", "button");
    e.setAttribute("aria-label", `${key}, ${NAMES[key]}`);
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", String(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", key.length > 2 ? "13" : "9.5");
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y + 0.5));
    t.textContent = key;
    e.append(c, t);
    e.addEventListener("click", () => onSpot(key));
    e.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSpot(key); }
    });
    svg.appendChild(e);
    spots[key] = e;
  });

  // il chicco
  const grain = document.createElementNS(NS, "ellipse");
  grain.setAttribute("rx", "5");
  grain.setAttribute("ry", "3.6");
  grain.setAttribute("fill", "var(--grano)");
  grain.setAttribute("stroke", "var(--ink)");
  grain.setAttribute("stroke-width", ".8");
  svg.appendChild(grain);

  let current = -1;
  let anim = 0;
  const placeGrain = (x: number, y: number) => { grain.setAttribute("cx", String(x)); grain.setAttribute("cy", String(y)); };
  const endAt = (n: number) => {
    const p = routes[n];
    if (!p) return placeGrain(...START);
    const pt = p.getPointAtLength(p.getTotalLength());
    placeGrain(pt.x, pt.y);
  };

  const setStep = (n: number) => {
    if (n === current) return;
    const forward = current >= 0 && n > current;
    Object.values(spots).forEach((e) => e.removeAttribute("data-on"));
    ACTIVE[n].forEach((key) => spots[key].setAttribute("data-on", ""));
    routes.forEach((p, i) => p?.setAttribute("opacity", i <= n ? (i === n ? "1" : ".35") : "0"));
    pula.setAttribute("opacity", n >= 2 ? ".8" : "0");
    cancelAnimationFrame(anim);
    const segs = forward ? routes.slice(current + 1, n + 1).filter((p): p is SVGPathElement => p !== null) : [];
    current = n;
    if (reduce || !segs.length) return endAt(n);
    const total = segs.reduce((sum, p) => sum + p.getTotalLength(), 0);
    const duration = Math.min(2600, 500 + total * 5);
    const t1 = performance.now();
    const tick = (now: number) => {
      let d = Math.min(1, (now - t1) / duration);
      d = d < 0.5 ? 2 * d * d : 1 - Math.pow(-2 * d + 2, 2) / 2;
      let left = d * total;
      for (const p of segs) {
        const l = p.getTotalLength();
        if (left <= l || p === segs[segs.length - 1]) {
          const pt = p.getPointAtLength(Math.min(left, l));
          placeGrain(pt.x, pt.y);
          break;
        }
        left -= l;
      }
      if (d < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  };

  const destroy = () => {
    cancelAnimationFrame(anim);
    spin?.cancel();
    svg.replaceChildren();
  };
  return { setStep, destroy };
}

/** Il viaggio del chicco nel mulino: la sezione disegnata resta ferma mentre i passi scorrono accanto. */
export default function GrainJourney() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const millRef = useRef<ReturnType<typeof drawMill> | null>(null);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState(CAPTION[0]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const mill = drawMill(svg, matchMedia("(prefers-reduced-motion: reduce)").matches, setSpot);
    millRef.current = mill;
    mill.setStep(0);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const n = Number((entry.target as HTMLElement).dataset.step);
        setStep(n);
        setSpot(CAPTION[n]);
      }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => { observer.disconnect(); mill.destroy(); millRef.current = null; };
  }, []);

  useEffect(() => {
    millRef.current?.setStep(step);
  }, [step]);

  return (
    <div className={styles.jGrid}>
      <div className={styles.jFig}>
        <svg ref={svgRef} viewBox="0 0 440 520" role="img" aria-label="Sezione del mulino su tre piani con le macchine numerate e il percorso del chicco." />
        <p className={styles.jCaption} aria-live="polite">
          <span className={styles.type}>{spot}</span>
          <span>{NAMES[spot]}</span>
        </p>
      </div>
      <div className={styles.steps}>
        {STEPS.map((item, index) => (
          <article
            key={item.title}
            ref={(el) => { stepRefs.current[index] = el; }}
            className={styles.step}
            data-step={index}
            data-on={step === index || undefined}
          >
            <span className={styles.floor}>{item.floor}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
