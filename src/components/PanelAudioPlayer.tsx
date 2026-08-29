"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PanelAudioPlayer.module.css";

type Props = {
  src: string;
  title: string;
  autoPlay?: boolean;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function PanelAudioPlayer({ src, title, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay) return;

    void audio.play().catch(() => {
      // Mobile browsers can reject audible autoplay until the first user gesture.
    });
  }, [autoPlay, src]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  return (
    <div className={styles.player}>
      <div className={styles.heading}>
        <span>Audioguida</span>
        <strong>{title}</strong>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.playButton}
          onClick={togglePlayback}
          aria-label={playing ? "Metti in pausa l’audioguida" : "Riproduci l’audioguida"}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        </button>

        <div className={styles.timeline}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Posizione nell’audioguida"
          />
          <div className={styles.times}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
    </div>
  );
}
