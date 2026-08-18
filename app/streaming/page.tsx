"use client";

import { useCallback, useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

interface ActivePlaylist {
  playlistId: string;
  playlistLabel: string;
  setAt: string;
}

function extractListId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  try {
    const url = new URL(v.startsWith("http") ? v : `https://${v}`);
    const list = url.searchParams.get("list");
    return list && list.length > 8 ? list : null;
  } catch {
    return null;
  }
}

export default function StreamingPage() {
  const [active, setActive] = useState<ActivePlaylist | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 5000);
  }, []);

  useEffect(() => {
    let disposed = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/streaming/active");
        if (!disposed && res.ok) {
          const body = (await res.json()) as { active?: ActivePlaylist | null };
          setActive(body.active ?? null);
        }
      } catch {
        /* ignore — next poll retries */
      }
    };
    void poll();
    const t = window.setInterval(() => {
      void poll();
    }, 10000);
    return () => {
      disposed = true;
      window.clearInterval(t);
    };
  }, []);

  const start = async () => {
    const listId = extractListId(url);
    if (!listId) {
      flash("Paste a valid YouTube / YT Music playlist link.");
      return;
    }
    if (!label.trim()) {
      flash("Give your set a name.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/streaming/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: listId, playlistLabel: label.trim(), playlistUrl: url.trim() }),
      });
      const body = (await res.json()) as { active?: ActivePlaylist; message?: string };
      if (res.ok && body.active) {
        setActive(body.active);
        setUrl("");
        setLabel("");
        flash("You're live! Everyone can hear your playlist now.");
      } else {
        flash(body.message ?? "Could not start your set.");
      }
    } catch {
      flash("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/streaming/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      const body = (await res.json()) as { active?: ActivePlaylist | null };
      if (res.ok && !body.active) {
        setActive(null);
        flash("Set ended. Back to regular rotations.");
      } else {
        flash("Could not stop the set.");
      }
    } catch {
      flash("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20">
        <header className="pt-8 text-center sm:pt-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber/80">
            DJ Booth
          </div>
          <h1 className="glow-neon mt-2 font-cafe text-4xl font-extrabold text-cream sm:text-5xl">
            Your Playlist, Live
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
            Paste a YouTube playlist and everyone listening will hear it
            through the radio.
          </p>
        </header>

        {message && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-300">
            {message}
          </div>
        )}

        <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/10 bg-black/40 p-6 text-center">
          <h2 className="text-center font-cafe text-xl font-bold text-white">
            {active ? "On Air" : "Nothing Playing"}
          </h2>
          {active ? (
            <div className="mt-3">
              <p className="text-sm font-bold text-amber-300">
                {active.playlistLabel}
              </p>
              <p className="mt-1 text-[11px] text-cream/50">
                Set at {new Date(active.setAt).toLocaleTimeString()}
              </p>
              <button
                type="button"
                onClick={stop}
                disabled={busy}
                className="mt-4 rounded-xl border border-pink-500/40 bg-pink-500/10 px-6 py-2.5 text-xs font-bold text-pink-300 hover:bg-pink-500/20 disabled:opacity-40"
              >
                {busy ? "Stopping…" : "Stop Set"}
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a YouTube playlist link…"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Name your set (e.g. Midnight Bangers)"
                  maxLength={120}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={start}
                disabled={busy || !url.trim() || !label.trim()}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-40"
              >
                {busy ? "Starting…" : "Go Live"}
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
