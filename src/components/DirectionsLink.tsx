"use client";

import { useEffect, useState } from "react";

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  className?: string;
  children?: React.ReactNode;
};

function destination(latitude?: number | null, longitude?: number | null, address?: string | null) {
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `${latitude},${longitude}`;
  }
  return address?.trim() || "Roncegno Terme";
}

function googleMapsUrl(value: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(value)}`;
}

function appleMapsUrl(value: string) {
  return `https://maps.apple.com/?daddr=${encodeURIComponent(value)}&dirflg=d`;
}

export default function DirectionsLink({ latitude, longitude, address, className, children }: Props) {
  const target = destination(latitude, longitude, address);
  const [href, setHref] = useState(() => googleMapsUrl(target));

  useEffect(() => {
    const appleDevice = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    setHref(appleDevice ? appleMapsUrl(target) : googleMapsUrl(target));
  }, [target]);

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children ?? "Ottieni indicazioni ↗"}
    </a>
  );
}
