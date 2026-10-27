"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 30_000);
  return () => window.clearInterval(timer);
}

// Il valore cambia una volta al minuto: React non ridisegna più spesso del necessario.
function snapshot() {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

/** Ora attuale (al minuto) nel browser; null durante il rendering sul server. */
export function useMinute() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
