"use client";

import { useState } from "react";
import { setToken } from "@/lib/client-auth";
import { apiFetch } from "@/lib/client-api";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface AuthFormsProps {
  onAuthed: (user: UserInfo) => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none";

export default function AuthForms({ onAuthed }: AuthFormsProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login" ? { email, password } : { name, email, password };
    const { status, body } = await apiFetch<{
      token?: string;
      user?: UserInfo;
      message?: string;
    }>(path, { method: "POST", body: JSON.stringify(payload) });
    setBusy(false);
    if ((status === 200 || status === 201) && body?.token && body?.user) {
      setToken(body.token);
      setPassword("");
      onAuthed(body.user);
    } else {
      setError(body?.message ?? "Something went wrong.");
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex gap-2">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === m
                ? "bg-amber-500 text-black"
                : "border border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className={inputClass}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          className={inputClass}
        />
        {error && (
          <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-center text-xs text-pink-300">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </section>
  );
}
