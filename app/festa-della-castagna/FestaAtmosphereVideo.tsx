"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function FestaAtmosphereVideo() {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.videoStory} aria-label="Atmosfera della Festa della Castagna">
      {failed ? (
        <div className={styles.videoFallback} role="img" aria-label="Scorcio della Festa della Castagna" />
      ) : (
        <video
          className={styles.videoStoryMedia}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          poster="/images/festa-castagna/benvenuti.jpg"
          onError={() => setFailed(true)}
          aria-label="Video dell'atmosfera della Festa della Castagna"
        >
          <source src="/videos/festa-castagna-atmosfera.mp4" type="video/mp4" />
        </video>
      )}
      <div className={styles.videoStoryShade} aria-hidden="true" />
      <div className={styles.videoStoryCaption}>
        <p>Dentro la Festa</p>
        <h2>Roncegno, in un giorno d’autunno.</h2>
      </div>
    </div>
  );
}
