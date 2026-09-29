"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REFRESH_EVERY_MS = 5 * 60 * 1000;
const IDLE_RETURN_MS = 60 * 1000;

function updateClock() {
  const now = new Date();
  document.querySelectorAll<HTMLElement>("[data-kiosk-clock]").forEach((clock) => {
    clock.textContent = new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Rome",
    }).format(now);
  });
  document.querySelectorAll<HTMLElement>("[data-kiosk-date]").forEach((date) => {
    date.textContent = new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: "Europe/Rome",
    }).format(now);
  });
}

export default function KioskRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    updateClock();
    const clockTimer = window.setInterval(updateClock, 30_000);
    const refreshTimer = pathname === "/kiosk"
      ? window.setInterval(() => window.location.reload(), REFRESH_EVERY_MS)
      : null;

    let idleTimer: number | null = null;
    const resetIdle = () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      if (pathname !== "/kiosk") {
        idleTimer = window.setTimeout(() => {
          window.location.assign("/kiosk");
        }, IDLE_RETURN_MS);
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "pointermove", "keydown", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      window.clearInterval(clockTimer);
      if (refreshTimer) window.clearInterval(refreshTimer);
      if (idleTimer) window.clearTimeout(idleTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetIdle));
    };
  }, [pathname]);

  return null;
}
