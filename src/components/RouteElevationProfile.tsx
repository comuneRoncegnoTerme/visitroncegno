"use client";

import { useMemo } from "react";

import {
  buildElevationProfile,
  parseGpxSegments,
  thinPoints,
  type ElevationPoint,
} from "@/lib/gpx-client";
import styles from "./RouteElevationProfile.module.css";

interface RouteElevationProfileProps {
  gpxText: string;
}

function formatDistance(value: number) {
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toLocaleString("it-IT", {
    minimumFractionDigits: value < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  })} km`;
}

function smoothElevations(points: ElevationPoint[], radius = 2) {
  return points.map((point, index) => {
    const from = Math.max(0, index - radius);
    const to = Math.min(points.length - 1, index + radius);
    const window = points.slice(from, to + 1);
    const elevation =
      window.reduce((sum, current) => sum + current.elevation, 0) /
      window.length;

    return {
      ...point,
      elevation,
    };
  });
}

export default function RouteElevationProfile({
  gpxText,
}: RouteElevationProfileProps) {
  const profile = useMemo(() => {
    const segments = parseGpxSegments(gpxText);
    return buildElevationProfile(segments);
  }, [gpxText]);

  if (profile.length < 2) return null;

  const rawElevations = profile.map((point) => point.elevation);
  const minElevation = Math.round(Math.min(...rawElevations));
  const maxElevation = Math.round(Math.max(...rawElevations));
  const middleElevation = Math.round((minElevation + maxElevation) / 2);
  const totalDistance = profile[profile.length - 1].distanceKm;

  const displayPoints = smoothElevations(thinPoints(profile, 260));
  const width = 1000;
  const height = 180;
  const elevationRange = Math.max(maxElevation - minElevation, 1);

  const x = (distance: number) =>
    (distance / Math.max(totalDistance, 0.001)) * width;
  const y = (elevation: number) =>
    ((maxElevation - elevation) / elevationRange) * height;

  const linePath = displayPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(point.distanceKm).toFixed(
          2
        )} ${y(point.elevation).toFixed(2)}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <section
      className={styles.profile}
      aria-label={`Profilo altimetrico del percorso. Quota minima ${minElevation} metri, quota massima ${maxElevation} metri, lunghezza ${formatDistance(totalDistance)}.`}
    >
      <div className={styles.heading}>
        <div className={styles.titleBlock}>
          <span>Profilo altimetrico</span>
          <strong>Quota lungo il percorso</strong>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Quota min</dt>
            <dd>{minElevation} m</dd>
          </div>
          <div>
            <dt>Quota max</dt>
            <dd>{maxElevation} m</dd>
          </div>
          <div>
            <dt>Lunghezza</dt>
            <dd>{formatDistance(totalDistance)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.chart}>
        <div className={styles.yAxis} aria-hidden="true">
          <span>{maxElevation} m</span>
          <span>{middleElevation} m</span>
          <span>{minElevation} m</span>
        </div>

        <div className={styles.plotColumn}>
          <div className={styles.plot}>
            <i className={`${styles.gridLine} ${styles.gridTop}`} />
            <i className={`${styles.gridLine} ${styles.gridMiddle}`} />
            <i className={`${styles.gridLine} ${styles.gridBottom}`} />
            <svg
              className={styles.svg}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className={styles.area} d={areaPath} />
              <path className={styles.line} d={linePath} />
            </svg>
          </div>

          <div className={styles.xAxis} aria-hidden="true">
            <span>0 km</span>
            <span>{formatDistance(totalDistance / 2)}</span>
            <span>{formatDistance(totalDistance)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
