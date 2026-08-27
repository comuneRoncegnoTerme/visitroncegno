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

function isSafeHotspot(hotspot: HeroHotspot) {
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const update = () => setPeriod(getRoncegnoPeriod());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const safeHotspots = useMemo(
    () => (hotspots ?? []).filter(isSafeHotspot),
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
        <div
          className={`${styles.atmosphere} ${styles[period]}`}
          aria-hidden="true"
        />
      )}

      {hotspotsEnabled && safeHotspots.length > 0 && (
        <div className={styles.hotspots} aria-label="Punti da scoprire">
          {safeHotspots.map((hotspot) => (
            <a
              className={styles.hotspot}
              href={hotspot.href}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              key={`${hotspot.label}-${hotspot.href}`}
              aria-label={hotspot.label}
            >
              <span className={styles.hotspotDot} aria-hidden="true" />
              <span className={styles.hotspotLabel}>{hotspot.label}</span>
            </a>
          ))}
        </div>
      )}

      {ambientAudioEnabled && ambientAudioUrl && (
        <div className={styles.audioControl}>
          <audio ref={audioRef} src={ambientAudioUrl} loop preload="none" />
          <button type="button" onClick={toggleAudio} aria-pressed={playing}>
            {playing ? "Silenzia il paesaggio" : "Ascolta il paesaggio"}
          </button>
        </div>
      )}
    </>
  );
}
