"use client";

import { useMemo } from "react";
import styles from "./RouteElevationProfile.module.css";

interface RouteElevationProfileProps {
  gpxText: string;
}

interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number;
  distanceKm: number;
}

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(
  first: Pick<ElevationPoint, "latitude" | "longitude">,
  second: Pick<ElevationPoint, "latitude" | "longitude">
) {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

function readPoints(xml: Document, tagName: "trkpt" | "rtept") {
  return Array.from(xml.getElementsByTagNameNS("*", tagName));
}

function parseElevationProfile(gpxText: string): ElevationPoint[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  if (xml.getElementsByTagName("parsererror").length > 0) {
    return [];
  }

  const trackPoints = readPoints(xml, "trkpt");
  const routePoints = readPoints(xml, "rtept");
  const sourcePoints = trackPoints.length > 0 ? trackPoints : routePoints;

  const points = sourcePoints
    .map((point) => {
      const elevationElement = Array.from(point.children).find(
        (child) => child.localName === "ele"
      );
      const latitude = Number(point.getAttribute("lat"));
      const longitude = Number(point.getAttribute("lon"));
      const elevation = Number(elevationElement?.textContent);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(elevation)
      ) {
        return null;
      }

      return {
        latitude,
        longitude,
        elevation,
      };
    })
    .filter(Boolean) as Omit<ElevationPoint, "distanceKm">[];

  if (points.length < 2) return [];

  let cumulativeDistance = 0;

  return points.map((point, index) => {
    if (index > 0) {
      cumulativeDistance += distanceKm(points[index - 1], point);
    }

    return {
      ...point,
      distanceKm: cumulativeDistance,
    };
  });
}

function thinPoints(points: ElevationPoint[], maxPoints = 220) {
  if (points.length <= maxPoints) return points;

  const step = (points.length - 1) / (maxPoints - 1);
  const thinned = Array.from({ length: maxPoints }, (_, index) => {
    return points[Math.round(index * step)];
  });

  thinned[0] = points[0];
  thinned[thinned.length - 1] = points[points.length - 1];
  return thinned;
}

function formatDistance(value: number) {
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toLocaleString("it-IT", {
    minimumFractionDigits: value < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  })} km`;
}

export default function RouteElevationProfile({
  gpxText,
}: RouteElevationProfileProps) {
  const profile = useMemo(() => parseElevationProfile(gpxText), [gpxText]);

  if (profile.length < 2) return null;

  const points = thinPoints(profile);
  const elevations = profile.map((point) => point.elevation);
  const minElevation = Math.floor(Math.min(...elevations));
  const maxElevation = Math.ceil(Math.max(...elevations));
  const totalDistance = profile[profile.length - 1].distanceKm;

  const width = 1000;
  const height = 270;
  const padding = { top: 24, right: 26, bottom: 42, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const elevationRange = Math.max(maxElevation - minElevation, 20);
  const lowerBound = minElevation - Math.max(Math.round(elevationRange * 0.12), 5);
  const upperBound = maxElevation + Math.max(Math.round(elevationRange * 0.08), 5);
  const chartRange = upperBound - lowerBound;

  const x = (distance: number) =>
    padding.left + (distance / Math.max(totalDistance, 0.001)) * chartWidth;
  const y = (elevation: number) =>
    padding.top + ((upperBound - elevation) / chartRange) * chartHeight;

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(point.distanceKm).toFixed(2)} ${y(
          point.elevation
        ).toFixed(2)}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${x(totalDistance).toFixed(2)} ${(
    padding.top + chartHeight
  ).toFixed(2)} L ${padding.left} ${(padding.top + chartHeight).toFixed(
    2
  )} Z`;

  const elevationTicks = [
    lowerBound,
    Math.round((lowerBound + upperBound) / 2),
    upperBound,
  ];
  const distanceTicks = [0, totalDistance / 2, totalDistance];

  return (
    <section
      className={styles.profile}
      aria-label={`Profilo altimetrico del percorso. Quota minima ${minElevation} metri, quota massima ${maxElevation} metri, lunghezza ${formatDistance(totalDistance)}.`}
    >
      <div className={styles.heading}>
        <div>
          <span>Profilo altimetrico</span>
          <strong>Come cambia la quota lungo il percorso.</strong>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Min</dt>
            <dd>{minElevation} m</dd>
          </div>
          <div>
            <dt>Max</dt>
            <dd>{maxElevation} m</dd>
          </div>
          <div>
            <dt>Sviluppo</dt>
            <dd>{formatDistance(totalDistance)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {elevationTicks.map((tick) => (
            <g key={tick}>
              <line
                className={styles.gridLine}
                x1={padding.left}
                x2={width - padding.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className={styles.axisLabel}
                x={padding.left - 12}
                y={y(tick) + 4}
                textAnchor="end"
              >
                {tick} m
              </text>
            </g>
          ))}

          <path className={styles.area} d={areaPath} />
          <path className={styles.line} d={linePath} />

          {distanceTicks.map((tick, index) => (
            <text
              className={styles.distanceLabel}
              key={`${tick}-${index}`}
              x={x(tick)}
              y={height - 12}
              textAnchor={index === 0 ? "start" : index === 2 ? "end" : "middle"}
            >
              {formatDistance(tick)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
