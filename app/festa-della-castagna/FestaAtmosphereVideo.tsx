"use client";

import { useEffect, useRef, useState } from "react";
import pageStyles from "./page.module.css";
import styles from "./FestaAtmosphereVideo.module.css";

const VIDEO_SRC = "/videos/festa-castagna-atmosfera.mp4";
const POSTER_SRC = "/videos/festa-castagna-atmosfera-poster.jpg";

type Status = "idle" | "playing" | "paused" | "failed";

function isUnplayable(video: HTMLVideoElement) {
  return video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || video.error !== null;
}

// NotAllowedError = autoplay bloccato dal browser: il video resta disponibile con il pulsante.
// Qualsiasi altro errore (formato non supportato, file assente) lascia solo il poster.
function playFailureStatus(error: unknown): Status {
  return error instanceof DOMException && error.name === "NotAllowedError" ? "paused" : "failed";
}

export default function FestaAtmosphereVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const userPaused = useRef(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    // Il browser segnala l'errore sull'elemento <source>, non sul <video>.
    const source = video.querySelector("source");
    const fail = () => setStatus("failed");
    source?.addEventListener("error", fail);
    video.addEventListener("error", fail);

    const onPlay = () => setStatus("playing");
    const onPause = () => setStatus((current) => (current === "failed" ? current : "paused"));
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Riproduce solo quando la sezione è visibile, così non consuma dati e batteria fuori schermo.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Il browser può aver già scartato la sorgente prima dell'idratazione: in quel caso resta il poster.
        if (isUnplayable(video)) {
          setStatus("failed");
          return;
        }
        if (entry.isIntersecting && !reduceMotion && !userPaused.current) {
          video.play().catch((error: unknown) => setStatus(playFailureStatus(error)));
        } else if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(section);


    return () => {
      observer.disconnect();
      source?.removeEventListener("error", fail);
      video.removeEventListener("error", fail);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isUnplayable(video)) {
      setStatus("failed");
      return;
    }
    if (video.paused) {
      userPaused.current = false;
      video.play().catch((error: unknown) => setStatus(playFailureStatus(error)));
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const playing = status === "playing";

  return (
    <section ref={sectionRef} className={pageStyles.videoStory} aria-label="Video: atmosfera della Festa della Castagna">
      {/* Il poster resta sempre sotto al video: è ciò che si vede se la riproduzione è bloccata o non riesce. */}
      <img className={styles.poster} src={POSTER_SRC} alt="" width={694} height={394} loading="lazy" decoding="async" />
      {status !== "failed" && (
        <video
          ref={videoRef}
          className={`${pageStyles.videoStoryMedia} ${status === "idle" ? styles.hidden : styles.visible}`}
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      <div className={pageStyles.videoStoryShade} aria-hidden="true" />
      <div className={`${pageStyles.videoStoryCaption} ${styles.caption}`}>
        <p>Dentro la Festa</p>
        <h2>Roncegno, in un giorno d’autunno.</h2>
      </div>
      {status !== "failed" && (
        <button
          type="button"
          className={styles.control}
          onClick={toggle}
          aria-label={playing ? "Metti in pausa il video" : "Riproduci il video"}
        >
          <span aria-hidden="true" className={playing ? styles.iconPause : styles.iconPlay} />
          <span className={styles.controlText}>{playing ? "Pausa" : "Riproduci"}</span>
        </button>
      )}
    </section>
  );
}
