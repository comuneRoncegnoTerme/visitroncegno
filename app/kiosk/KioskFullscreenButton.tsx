"use client";

import { useEffect, useState } from "react";

export default function KioskFullscreenButton({ className }: { className?: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {
      // Fullscreen can be blocked by the browser/device policy. Kiosk launch flags remain the preferred deployment mode.
    }
  };

  return (
    <button type="button" className={className} onClick={toggle}>
      {active ? "Esci da schermo intero" : "Schermo intero"}
    </button>
  );
}
