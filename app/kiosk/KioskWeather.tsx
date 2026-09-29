"use client";

import { useEffect, useState } from "react";

type WeatherState = {
  temperature: number | null;
  label: string;
};

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=46.050833&longitude=11.41&current=temperature_2m,weather_code&timezone=Europe%2FRome";

function weatherLabel(code: number) {
  if (code === 0) return "Sereno";
  if (code === 1) return "Prevalentemente sereno";
  if (code === 2) return "Parzialmente nuvoloso";
  if (code === 3) return "Nuvoloso";
  if (code === 45 || code === 48) return "Nebbia";
  if ([51, 53, 55, 56, 57].includes(code)) return "Pioviggine";
  if ([61, 63, 65, 66, 67].includes(code)) return "Pioggia";
  if ([71, 73, 75, 77].includes(code)) return "Neve";
  if ([80, 81, 82].includes(code)) return "Rovesci";
  if ([85, 86].includes(code)) return "Rovesci di neve";
  if ([95, 96, 99].includes(code)) return "Temporale";
  return "Meteo";
}

export default function KioskWeather({ className }: { className?: string }) {
  const [weather, setWeather] = useState<WeatherState>({ temperature: null, label: "Meteo" });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(WEATHER_URL, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        if (!active || payload.current?.temperature_2m == null || payload.current.weather_code == null) return;
        setWeather({
          temperature: Math.round(payload.current.temperature_2m),
          label: weatherLabel(payload.current.weather_code),
        });
      } catch {
        // Keep the compact fallback label if the kiosk temporarily has no network.
      }
    };

    load();
    const timer = window.setInterval(load, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={className}>
      <strong>{weather.temperature == null ? "—" : String(weather.temperature) + "°"}</strong>
      <span>{weather.label}</span>
    </div>
  );
}
