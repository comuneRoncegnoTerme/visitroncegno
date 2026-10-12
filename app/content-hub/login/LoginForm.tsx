"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/content-hub/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus("error");
        setMessage(result?.error ?? "Accesso non riuscito");
        return;
      }
    } catch {
      setStatus("error");
      setMessage("Connessione non disponibile. Riprova tra poco.");
      return;
    }

    router.replace("/content-hub");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        <span>Email</span>
        <input type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label>
        <span>Password</span>
        <span className={styles.passwordRow}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
          >
            {showPassword ? "Nascondi" : "Mostra"}
          </button>
        </span>
      </label>
      {message && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
      <button type="submit" className={styles.submit} disabled={status === "loading"}>
        {status === "loading" ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
