import crypto from "node:crypto";
import { cookies } from "next/headers";
import { DIRECTUS_URL } from "@/lib/directus";

const SESSION_COOKIE = "roncegno_content_hub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  email: string;
  name: string;
  role: string;
  exp: number;
};

type DirectusLoginResponse = {
  data?: { access_token?: string };
};

type DirectusMeResponse = {
  data?: {
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    status?: string;
    role?: {
      name?: string | null;
      admin_access?: boolean;
    } | null;
  };
};

function getSessionSecret() {
  const secret = process.env.CONTENT_HUB_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CONTENT_HUB_SESSION_SECRET non configurato o troppo corto");
  }
  return secret;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createSessionToken(payload: SessionPayload) {
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function parseSessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !timingSafeEqual(sign(encoded), signature)) return null;

  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if (!payload.email || !payload.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function allowedRole(roleName: string, adminAccess: boolean) {
  if (adminAccess) return true;
  const configured = process.env.CONTENT_HUB_ALLOWED_ROLES;
  if (!configured) return false;
  const roles = configured.split(",").map((role) => role.trim().toLowerCase()).filter(Boolean);
  return roles.includes(roleName.toLowerCase());
}

export async function authenticateContentHub(email: string, password: string) {
  const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "json" }),
    cache: "no-store",
  });

  if (!loginResponse.ok) return null;
  const login = (await loginResponse.json()) as DirectusLoginResponse;
  const accessToken = login.data?.access_token;
  if (!accessToken) return null;

  const meResponse = await fetch(
    `${DIRECTUS_URL}/users/me?fields=email,first_name,last_name,status,role.name,role.admin_access`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!meResponse.ok) return null;
  const me = (await meResponse.json()) as DirectusMeResponse;
  const user = me.data;
  const roleName = user?.role?.name ?? "Redazione";

  if (!user?.email || user.status !== "active") return null;
  if (!allowedRole(roleName, user.role?.admin_access === true)) return null;

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  return { email: user.email, name, role: roleName };
}

export async function setContentHubSession(user: { email: string; name: string; role: string }) {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = createSessionToken({ ...user, exp });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.CONTENT_HUB_COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearContentHubSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.CONTENT_HUB_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 0,
  });
}

export async function getContentHubSession() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    return token ? parseSessionToken(token) : null;
  } catch {
    return null;
  }
}
