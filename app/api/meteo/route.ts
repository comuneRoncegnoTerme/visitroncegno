// Meteo attuale a Roncegno per l'etichetta dell'hero.
// Passa dal sito invece che dal browser: l'IP di chi visita non arriva a servizi esterni
// e Open-Meteo viene interrogato al massimo una volta ogni 10 minuti.
export const revalidate = 600;

const SOURCE =
  "https://api.open-meteo.com/v1/forecast?latitude=46.05&longitude=11.41&current=temperature_2m,weather_code&timezone=Europe%2FRome";

export async function GET() {
  try {
    const response = await fetch(SOURCE, { next: { revalidate: 600 } });
    if (!response.ok) return Response.json({ current: null }, { status: 502 });
    const data = (await response.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    const current = data.current;
    if (typeof current?.temperature_2m !== "number" || typeof current.weather_code !== "number") {
      return Response.json({ current: null }, { status: 502 });
    }
    return Response.json(
      { current: { temperature_2m: current.temperature_2m, weather_code: current.weather_code } },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } }
    );
  } catch {
    return Response.json({ current: null }, { status: 502 });
  }
}
