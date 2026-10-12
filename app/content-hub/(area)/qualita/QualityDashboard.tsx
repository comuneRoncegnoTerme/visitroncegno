"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../PageHeader";
import styles from "./page.module.css";

type Item = Record<string, unknown> & {
  id: number;
  title?: string;
  slug?: string;
  status?: string;
};

type Data = { events: Item[]; places: Item[]; routes: Item[] };
type Problem = {
  key: string;
  group: string;
  title: string;
  detail: string;
  href: string;
};

type CollectionResult = {
  unauthorized: boolean;
  collection: keyof Data;
  data: Item[];
  serverTime: number | null;
};

async function fetchCollection(
  collection: keyof Data,
  signal: AbortSignal
): Promise<CollectionResult> {
  const response = await fetch(`/api/content-hub/items/${collection}`, {
    cache: "no-store",
    signal,
  });
  const json = await response.json().catch(() => null);
  const responseDate = response.headers.get("date");
  const parsedTime = responseDate ? Date.parse(responseDate) : Number.NaN;
  const serverTime = Number.isNaN(parsedTime) ? null : parsedTime;

  if (response.status === 401) {
    return { unauthorized: true, collection, data: [], serverTime };
  }
  if (!response.ok) throw new Error(json?.error ?? `Errore ${collection}`);
  return {
    unauthorized: false,
    collection,
    data: json?.data ?? [],
    serverTime,
  };
}

export default function QualityDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Data>({ events: [], places: [], routes: [] });
  const [referenceTime, setReferenceTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const collections = ["events", "places", "routes"] as const;

    void Promise.all(
      collections.map((collection) => fetchCollection(collection, controller.signal))
    )
      .then((results) => {
        if (results.some((result) => result.unauthorized)) {
          router.replace("/content-hub/login");
          return;
        }

        setData(
          Object.fromEntries(
            results.map((result) => [result.collection, result.data])
          ) as Data
        );
        setReferenceTime(
          results.find((result) => result.serverTime !== null)?.serverTime ?? null
        );
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(
          reason instanceof Error ? reason.message : "Impossibile caricare i contenuti"
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  const problems = useMemo(() => {
    const list: Problem[] = [];

    const add = (
      item: Item,
      group: string,
      detail: string,
      href: string,
      code: string
    ) => {
      list.push({
        key: `${group}-${item.id}-${code}`,
        group,
        title: String(item.title ?? item.slug ?? `#${item.id}`),
        detail,
        href: `${href}?id=${item.id}`,
      });
    };

    for (const place of data.places) {
      if (place.status !== "published") continue;
      if (!place.image) add(place, "Luoghi", "Manca l'immagine principale", "/content-hub/luoghi", "image");
      if (place.show_on_map && (place.latitude == null || place.longitude == null)) {
        add(place, "Luoghi", "Visibile in mappa ma senza coordinate", "/content-hub/luoghi", "coordinates");
      }
      if (!place.summary) add(place, "Luoghi", "Manca la descrizione breve", "/content-hub/luoghi", "summary");
    }

    for (const route of data.routes) {
      if (route.status !== "published") continue;
      if (!route.image) add(route, "Percorsi", "Manca l'immagine principale", "/content-hub/percorsi", "image");
      if (!route.gpx_file) add(route, "Percorsi", "Manca il file GPX", "/content-hub/percorsi", "gpx");
      if (route.start_latitude == null || route.start_longitude == null) {
        add(route, "Percorsi", "Manca il punto di partenza", "/content-hub/percorsi", "start");
      }
      if (!route.summary) add(route, "Percorsi", "Manca la descrizione breve", "/content-hub/percorsi", "summary");
    }

    for (const event of data.events) {
      if (event.status !== "published") continue;
      if (!event.image) add(event, "Eventi", "Manca l'immagine", "/content-hub/eventi", "image");
      if (!event.location_name) add(event, "Eventi", "Manca il luogo", "/content-hub/eventi", "location");
      if (
        referenceTime !== null &&
        event.end_date &&
        new Date(String(event.end_date)).getTime() < referenceTime
      ) {
        add(event, "Eventi", "Evento terminato ancora pubblicato", "/content-hub/eventi", "expired");
      }
    }

    return list;
  }, [data, referenceTime]);

  const groups = ["Eventi", "Luoghi", "Percorsi"]
    .map((group) => ({ group, problems: problems.filter((problem) => problem.group === group) }))
    .filter((entry) => entry.problems.length > 0);

  const checked = data.events.length + data.places.length + data.routes.length;

  return (
    <main className={styles.page}>
      <PageHeader
        title="Cose da sistemare"
        intro="Contenuti pubblicati a cui manca qualcosa: foto, testo breve, coordinate, GPX o luogo. Segnala anche gli eventi già finiti ma ancora online."
      />

      {loading && <p className={styles.muted}>Controllo in corso…</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <p className={styles.summary}>
          {problems.length === 0
            ? `Tutto a posto: ${checked} contenuti controllati.`
            : `${problems.length === 1 ? "1 cosa" : `${problems.length} cose`} da sistemare su ${checked} contenuti controllati.`}
        </p>
      )}
      {!loading &&
        !error &&
        groups.map(({ group, problems: groupProblems }) => (
          <section className={styles.group} key={group}>
            <h2>
              {group} <span>{groupProblems.length}</span>
            </h2>
            <ul className={styles.list}>
              {groupProblems.map((problem) => (
                <li key={problem.key}>
                  <div>
                    <strong>{problem.title}</strong>
                    <small>{problem.detail}</small>
                  </div>
                  <Link href={problem.href}>Apri</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </main>
  );
}
