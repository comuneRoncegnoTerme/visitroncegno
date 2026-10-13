"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HeroExperience.module.css";

export type HeroMode = "photo" | "video" | "illustration" | "minimal";

export type HeroHotspot = {
  label: string;
  href: string;
  x: number;
  y: number;
};

type DayPeriod = "morning" | "day" | "evening" | "night";

type Props = {
  mode?: HeroMode | null;
  imageUrl: string;
  videoUrl?: string | null;
  atmosphereEnabled?: boolean | null;
  hotspotsEnabled?: boolean | null;
  hotspots?: HeroHotspot[] | null;
  ambientAudioEnabled?: boolean | null;
  ambientAudioUrl?: string | null;
};

const PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: "mattino",
  day: "pomeriggio",
  evening: "sera",
  night: "notte",
};

function getRoncegnoPeriod(): DayPeriod {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Rome",
    }).format(new Date())
  );

  if (hour >= 7 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

type Weather = { temperature: number; label: string; snowing: boolean };

// Codici meteo WMO usati da Open-Meteo, ridotti a poche parole.
function weatherLabel(code: number) {
  if (code === 0) return "sereno";
  if (code <= 2) return "poco nuvoloso";
  if (code === 3) return "nuvoloso";
  if (code === 45 || code === 48) return "nebbia";
  if (code >= 51 && code <= 57) return "pioviggine";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "pioggia";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "neve";
  if (code >= 95) return "temporale";
  return null;
}

// Il sito fa da tramite verso Open-Meteo (vedi app/api/meteo/route.ts).
const WEATHER_URL = "/api/meteo";

// Fiocchi con posizioni fisse (niente valori casuali: stesso disegno a ogni visita).
const SNOWFLAKES = Array.from({ length: 36 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: ((index * 53) % 90) / 10,
  duration: 7 + ((index * 29) % 50) / 10,
  size: 2 + ((index * 17) % 4),
}));

function isSafeHotspot(hotspot: HeroHotspot) {
  if (
    !hotspot ||
    typeof hotspot.label !== "string" ||
    typeof hotspot.href !== "string" ||
    typeof hotspot.x !== "number" ||
    typeof hotspot.y !== "number"
  ) {
    return false;
  }

  const safeHref = hotspot.href.startsWith("/") || /^https?:\/\//i.test(hotspot.href);
  return (
    Boolean(hotspot.label.trim()) &&
    safeHref &&
    Number.isFinite(hotspot.x) &&
    hotspot.x >= 0 &&
    hotspot.x <= 100 &&
    Number.isFinite(hotspot.y) &&
    hotspot.y >= 0 &&
    hotspot.y <= 100
  );
}

export default function HeroExperience({
  mode = "photo",
  imageUrl,
  videoUrl,
  atmosphereEnabled = false,
  hotspotsEnabled = false,
  hotspots,
  ambientAudioEnabled = false,
  ambientAudioUrl,
}: Props) {
  const [period, setPeriod] = useState<DayPeriod>("day");
  const [playing, setPlaying] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const update = () => setPeriod(getRoncegnoPeriod());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  // Meteo attuale a Roncegno: se il servizio non risponde, l'etichetta resta com'era.
  useEffect(() => {
    if (!atmosphereEnabled) return;
    const controller = new AbortController();
    fetch(WEATHER_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { current?: { temperature_2m?: number; weather_code?: number } } | null) => {
        const current = data?.current;
        if (typeof current?.temperature_2m !== "number" || typeof current.weather_code !== "number") return;
        const label = weatherLabel(current.weather_code);
        setWeather({
          temperature: Math.round(current.temperature_2m),
          label: label ?? "",
          snowing: label === "neve",
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [atmosphereEnabled]);

  const safeHotspots = useMemo(
    () => (hotspots ?? []).filter(isSafeHotspot).slice(0, 3),
    [hotspots]
  );

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const resolvedMode: HeroMode = mode ?? "photo";
  const showVideo = resolvedMode === "video" && Boolean(videoUrl);

  return (
    <>
      {showVideo ? (
        <video
          className={styles.media}
          src={videoUrl ?? undefined}
          poster={imageUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : (
        <div
          className={`${styles.media} ${resolvedMode === "illustration" ? styles.illustration : ""} ${resolvedMode === "minimal" ? styles.minimal : ""}`}
          style={resolvedMode === "minimal" ? undefined : { backgroundImage: `url('${imageUrl}')` }}
          aria-hidden="true"
        />
      )}

      {atmosphereEnabled && (
        <>
          <div
            className={`${styles.atmosphere} ${styles[period]}`}
            aria-hidden="true"
          />
          {weather?.snowing && (
            <div className={styles.snow} aria-hidden="true">
              {SNOWFLAKES.map((flake, index) => (
                <span
                  key={index}
                  style={{
                    left: `${flake.left}%`,
                    width: flake.size,
                    height: flake.size,
                    animationDelay: `-${flake.delay}s`,
                    animationDuration: `${flake.duration}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div
            className={styles.contextLabel}
            aria-label={`Adesso a Roncegno Terme: ${PERIOD_LABELS[period]}${weather ? `, ${weather.temperature} gradi${weather.label ? `, ${weather.label}` : ""}` : ""}`}
          >
            <span>Adesso a Roncegno</span>
            <span aria-hidden="true">·</span>
            <span>{PERIOD_LABELS[period]}</span>
            {weather && (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.weather}>
                  {weather.temperature}°{weather.label ? ` ${weather.label}` : ""}
                </span>
              </>
            )}
          </div>
        </>
      )}

      {hotspotsEnabled && safeHotspots.length > 0 && (
        <>
          <div className={styles.hotspots} role="group" aria-label="Punti da scoprire">
            {safeHotspots.map((hotspot) => (
              <a
                className={styles.hotspot}
                href={hotspot.href}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                key={`${hotspot.label}-${hotspot.href}`}
                aria-label={hotspot.label}
              >
                <span className={styles.hotspotMarker} aria-hidden="true">
                  <span className={styles.hotspotDot} />
                  <span className={styles.hotspotLine} />
                </span>
                <span className={styles.hotspotLabel}>{hotspot.label}</span>
              </a>
            ))}
          </div>

          <nav className={styles.mobileHotspots} aria-label="Da qui puoi partire per">
            <span className={styles.mobileHotspotsLead}>Da qui puoi partire per</span>
            {safeHotspots.map((hotspot) => (
              <a href={hotspot.href} key={`mobile-${hotspot.label}-${hotspot.href}`}>
                {hotspot.label}
              </a>
            ))}
          </nav>
        </>
      )}

      {ambientAudioEnabled && ambientAudioUrl && (
        <div className={styles.audioControl}>
          <audio ref={audioRef} src={ambientAudioUrl} loop preload="none" />
          <button type="button" onClick={toggleAudio} aria-pressed={playing}>
            {playing ? "Disattiva l’audio" : "Attiva i suoni del paese"}
          </button>
        </div>
      )}
    </>
  );
}
