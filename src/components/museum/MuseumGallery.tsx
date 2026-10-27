"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Museum.module.css";

export type GalleryImage = { src: string; alt: string; caption?: string };

/** Griglia di foto; un clic apre la foto a schermo intero (frecce, Esc, scorrimento sul telefono). */
export default function MuseumGallery({ images, label }: { images: GalleryImage[]; label: string }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);

  const show = useCallback((next: number) => {
    setIndex(((next % images.length) + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (index === null) return;
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  }

  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className={styles.gallery} aria-label={label}>
        {images.map((image, position) => (
          <li key={image.src} className={position === 0 ? styles.galleryLead : undefined}>
            <button type="button" onClick={() => setIndex(position)} aria-label={`Apri la foto: ${image.alt}`}>
              <img src={image.src} alt={image.alt} loading="lazy" />
              {image.caption && <span>{image.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={label}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => {
          if (touchStart.current === null || index === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        {current && index !== null && (
          <figure>
            <img src={current.src} alt={current.alt} />
            <figcaption>
              <span>{current.caption ?? current.alt}</span>
              <small>{index + 1} / {images.length}</small>
            </figcaption>
          </figure>
        )}
        {images.length > 1 && (
          <>
            <button type="button" className={styles.lightboxPrev} onClick={() => index !== null && show(index - 1)} aria-label="Foto precedente">←</button>
            <button type="button" className={styles.lightboxNext} onClick={() => index !== null && show(index + 1)} aria-label="Foto successiva">→</button>
          </>
        )}
        <button type="button" className={styles.lightboxClose} onClick={() => setIndex(null)} aria-label="Chiudi">×</button>
      </dialog>
    </>
  );
}
