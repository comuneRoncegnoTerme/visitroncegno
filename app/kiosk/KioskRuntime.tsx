"use client";

import { useEffect } from "react";

const REFRESH_EVERY_MS = 5 * 60 * 1000;

function updateClock() {
  const now = new Date();
  const clock = document.querySelector<HTMLElement>("[data-kiosk-clock]");
  const date = document.querySelector<HTMLElement>("[data-kiosk-date]");

  if (clock) {
    clock.textContent = new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Rome",
    }).format(now);
  }

  if (date) {
    date.textContent = new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: "Europe/Rome",
    }).format(now);
  }
}

export default function KioskRuntime() {
  useEffect(() => {
    updateClock();
    const clockTimer = window.setInterval(updateClock, 30_000);
    const refreshTimer = window.setInterval(() => {
      window.location.reload();
    }, REFRESH_EVERY_MS);

    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(refreshTimer);
    };
  }, []);

  return null;
}
