"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getToken, setToken } from "@/lib/client-auth";
import { apiFetch } from "@/lib/client-api";

interface Playlist {
  id: string;
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  visibility: "public" | "private";
  createdAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none";
const btnGold =
  "rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50";
const btnGhost =
  "rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white";

export default function MyPlaylistsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const refreshPlaylists = useCallback(async () => {
    const { status, body } = await apiFetch<{ playlists: Playlist[] }>(
      "/api/playlists"
    );
    if (status === 200) setPlaylists(body.playlists);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    (async () => {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { status, body } = await apiFetch<{ user: UserInfo }>(
        "/api/auth/me"
      );
      if (cancelled) return;
      if (status === 200) {
        setUser(body.user);
        void refreshPlaylists();
      } else {
        setToken(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshPlaylists]);

  const flash = (msg: string | null) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 4000);
  };

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login" ? { email, password } : { name, email, password };
    const { status, body } = await apiFetch<{
      token?: string;
      user?: UserInfo;
      message?: string;
    }>(path, { method: "POST", body: JSON.stringify(payload) });
    setBusy(false);
    if (status === 200 || status === 201) {
      if (body.token && body.user) {
        setToken(body.token);
        setUser(body.user);
        setPassword("");
        void refreshPlaylists();
      }
    } else {
      flash(body.message ?? "Something went wrong.");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    const { status, body } = await apiFetch<{
      playlist?: Playlist;
      duplicate?: boolean;
      message?: string;
    }>("/api/playlists/youtube", { method: "POST", body: JSON.stringify({ url }) });
    setBusy(false);
    if (status === 200 || status === 201) {
      setUrl("");
      flash(body.duplicate ? "Playlist already added." : "Playlist added.");
      void refreshPlaylists();
    } else {
      flash(body.message ?? "Could not add playlist.");
    }
  }

  async function toggleVisibility(pl: Playlist) {
    const next = pl.visibility === "public" ? "private" : "public";
    const { status } = await apiFetch(`/api/playlists/${pl.id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visibility: next }),
    });
    if (status === 200) void refreshPlaylists();
  }

  async function removePlaylist(id: string) {
    const { status } = await apiFetch(`/api/playlists/${id}`, {
      method: "DELETE",
    });
    if (status === 200) void refreshPlaylists();
  }

  function logout() {
    setToken(null);
    setUser(null);
    setPlaylists([]);
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20">
        <header className="pt-8 text-center sm:pt-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber/80">
            Your collection
          </div>
          <h1 className="glow-neon mt-2 font-cafe text-4xl font-extrabold text-cream sm:text-5xl">
            My Playlists
          </h1>
        </header>

        {message && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-300">
            {message}
          </div>
        )}

        {loading ? (
          <p className="mt-16 text-center text-xs text-white/50">Loading…</p>
        ) : !user ? (
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
            <form onSubmit={handleAuth} className="space-y-3">
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
              <button type="submit" disabled={busy} className={`${btnGold} w-full`}>
                {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 text-xs font-bold text-white">
                Add YouTube Playlist
              </div>
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/playlist?list=…"
                  className={inputClass}
                />
                <button type="submit" disabled={busy || !url.trim()} className={`${btnGold} shrink-0`}>
                  Add
                </button>
              </form>
              <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
                <span>
                  Logged in as <span className="text-amber-300">{user.name}</span>
                </span>
                <button type="button" onClick={logout} className={btnGhost}>
                  Log out
                </button>
              </div>
            </section>

            <section className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {playlists.length === 0 && (
                <p className="col-span-full py-10 text-center text-xs text-white/50">
                  No playlists yet — paste a YouTube playlist URL above.
                </p>
              )}
              {playlists.map((pl) => (
                <article
                  key={pl.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                >
                  <div className="flex items-center gap-3 p-4">
                    {pl.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pl.thumbnail}
                        alt=""
                        className="h-12 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
                        🎵
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-cafe text-sm font-bold text-white">
                        {pl.title}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-amber-400/80">
                        {pl.visibility === "public" ? "Public" : "Private"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3">
                    <Link
                      href={`/playlist/${pl.id}`}
                      className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-black hover:bg-amber-400"
                    >
                      ▶ Play
                    </Link>
                    <button type="button" onClick={() => toggleVisibility(pl)} className={btnGhost}>
                      {pl.visibility === "public" ? "Make private" : "Make public"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(
                          `${window.location.origin}/playlist/${pl.id}`
                        );
                        flash("Share link copied.");
                      }}
                      className={btnGhost}
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlaylist(pl.id)}
                      className="ml-auto rounded-xl px-3 py-1.5 text-[11px] text-pink-400/80 hover:bg-white/5 hover:text-pink-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
