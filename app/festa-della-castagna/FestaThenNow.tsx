"use client";

import { useState, type CSSProperties } from "react";
import styles from "./FestaExtras.module.css";

// Ieri e oggi: si trascina la linea per passare dalla foto d'epoca del castagno alle caldarroste in piazza.
export default function FestaThenNow() {
  const [position, setPosition] = useState(50);

  return (
    <figure className={styles.thenNow}>
      <div className={styles.thenNowFrame} style={{ "--split": `${position}%` } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.thenNowToday}
          src="/images/festa-castagna/caldarroste-fuoco-piazza.webp"
          width={1066}
          height={1600}
          loading="lazy"
          alt="Oggi: il fuoco sotto il tamburo delle caldarroste, con la piazza piena di gente"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.thenNowPast}
          src="/images/festa-castagna/castagno-foto-epoca.webp"
          width={1060}
          height={1280}
          loading="lazy"
          alt="Ieri: un uomo con il cappello accanto a un grande castagno, su un pendio erboso"
        />
        <span className={styles.thenNowLabel} data-side="past">Ieri</span>
        <span className={styles.thenNowLabel} data-side="today">Oggi</span>
        <span className={styles.thenNowHandle} aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Confronta la foto d’epoca con la Festa di oggi"
        />
      </div>
      <figcaption>
        <span>Ieri e oggi</span>
        Il castagno sul pendio e le caldarroste in piazza: trascina per passare da una all’altra.
      </figcaption>
    </figure>
  );
}
