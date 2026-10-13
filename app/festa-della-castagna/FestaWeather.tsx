"use client";

import { useEffect, useState } from "react";
import { FESTA_END, romeDate, useNow } from "./festa-time";
import styles from "./FestaExtras.module.css";

type Day = { date: string; code: number; max: number; min: number; rain: number | null };
type Kind = "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

// Codici meteo WMO di Open-Meteo ridotti a sette disegni.
function kindFor(code: number): Kind {
  if (code <= 1) return "sun";
  if (code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  if (code >= 51) return "rain";
  return "cloud";
}

const LABELS: Record<Kind, string> = {
  sun: "Sole",
  partly: "Sole e nuvole",
  cloud: "Nuvoloso",
  fog: "Nebbia",
  rain: "Pioggia",
  snow: "Neve",
  storm: "Temporale",
};

const SUN = (
  <g className={styles.wxSun}>
    <circle cx="24" cy="24" r="9" fill="#f6b73c" />
    <g stroke="#f6b73c" strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4;
        return (
          <line
            key={index}
            x1={24 + Math.cos(angle) * 14}
            y1={24 + Math.sin(angle) * 14}
            x2={24 + Math.cos(angle) * 19}
            y2={24 + Math.sin(angle) * 19}
          />
        );
      })}
    </g>
  </g>
);

function Cloud({ x = 0, y = 0, fill = "#fff", className }: { x?: number; y?: number; fill?: string; className?: string }) {
  return (
    // La posizione sta sul gruppo: l'animazione CSS sul tracciato non la sovrascrive.
    <g transform={`translate(${x} ${y})`}>
      <path
        className={className}
        d="M14 38h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2 9 9 0 0 0-1 18z"
        fill={fill}
        stroke="#c9b8a6"
        strokeWidth="1.5"
      />
    </g>
  );
}

// Piccole illustrazioni del tempo, colorate e appena animate.
function WeatherIcon({ kind }: { kind: Kind }) {
  return (
    <svg className={styles.wxIcon} viewBox="0 0 48 48" aria-hidden="true">
      {(kind === "sun" || kind === "partly") && (
        <g transform={kind === "partly" ? "translate(-6 -7) scale(.85)" : undefined}>{SUN}</g>
      )}
      {kind === "partly" && <Cloud x={4} y={4} className={styles.wxDrift} />}
      {(kind === "cloud" || kind === "rain" || kind === "snow" || kind === "storm") && (
        <>
          <Cloud x={-6} y={-6} fill="#e6dccf" />
          <Cloud x={2} y={-1} className={styles.wxDrift} />
        </>
      )}
      {kind === "fog" && (
        <g stroke="#b9aa98" strokeWidth="3" strokeLinecap="round" className={styles.wxDrift}>
          <line x1="8" y1="18" x2="40" y2="18" />
          <line x1="4" y1="26" x2="36" y2="26" />
          <line x1="12" y1="34" x2="44" y2="34" />
        </g>
      )}
      {kind === "rain" && (
        <g stroke="#4f8fc0" strokeWidth="2.5" strokeLinecap="round">
          {[16, 24, 32].map((x, index) => (
            <line key={x} className={styles.wxDrop} style={{ animationDelay: `${index * 0.35}s` }} x1={x} y1="40" x2={x - 2} y2="45" />
          ))}
        </g>
      )}
      {kind === "snow" && (
        <g fill="#8fb6d6">
          {[16, 24, 32].map((x, index) => (
            <circle key={x} className={styles.wxDrop} style={{ animationDelay: `${index * 0.5}s` }} cx={x} cy="42" r="2" />
          ))}
        </g>
      )}
      {kind === "storm" && <path d="M25 37l-4 6h4l-3 5 7-8h-4l3-3z" fill="#f6b73c" />}
    </svg>
  );
}

function dayName(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

// Previsioni per i giorni della Festa. Compare solo quando Open-Meteo le ha (entro 16 giorni).
export default function FestaWeather() {
  const [days, setDays] = useState<Day[]>([]);
  const now = useNow();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/meteo/festa", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { days?: Day[] } | null) => setDays(data?.days ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!days.length || now === null || romeDate(now) > FESTA_END) return null;

  return (
    <section className={styles.weather} aria-labelledby="festa-meteo-title">
      <div className={styles.weatherHeading}>
        <h2 id="festa-meteo-title">Che tempo farà</h2>
        <p>Previsioni per Roncegno, aggiornate ogni ora. Più si avvicina la Festa, più sono affidabili.</p>
      </div>
      <ul className={styles.weatherDays}>
        {days.map((day) => {
          const kind = kindFor(day.code);
          return (
            <li key={day.date} className={styles.weatherDay} data-kind={kind}>
              <WeatherIcon kind={kind} />
              <span className={styles.weatherName}>{dayName(day.date)}</span>
              <strong>{LABELS[kind]}</strong>
              <span className={styles.weatherTemp}>
                <b>{Math.round(day.max)}°</b> / {Math.round(day.min)}°
              </span>
              {day.rain !== null && <small>Pioggia {Math.round(day.rain)}%</small>}
            </li>
          );
        })}
      </ul>
      <p className={styles.weatherSource}>Dati Open-Meteo</p>
    </section>
  );
}
