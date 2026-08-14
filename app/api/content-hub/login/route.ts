import { NextResponse } from "next/server";
import { authenticateContentHub, setContentHubSession } from "@/lib/content-hub-auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email e password sono obbligatorie" }, { status: 400 });
  }

  try {
    const user = await authenticateContentHub(email.trim(), password);
    if (!user) {
      return NextResponse.json(
        { error: "Credenziali non valide o utente non autorizzato al Content Hub" },
        { status: 401 }
      );
    }

    await setContentHubSession(user);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Content Hub login error", error);
    return NextResponse.json(
      { error: "Login temporaneamente non disponibile" },
      { status: 503 }
    );
  }
}
