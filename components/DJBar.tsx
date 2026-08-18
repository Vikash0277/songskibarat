"use client";

import { useCallback, useEffect, useState } from "react";

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

async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/streaming/active", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export default function DJBar() {
  const [active, setActive] = useState<ActivePlaylist | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 4000);
  }, []);

  /* ── poll active playlist ── */
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
        /* retry next tick */
      }
    };
    void poll();
    const t = window.setInterval(() => void poll(), 12000);
    return () => {
      disposed = true;
      window.clearInterval(t);
    };
  }, []);

  /* ── actions ── */
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
      const body = await apiPost<{ active?: ActivePlaylist; message?: string }>({
        playlistId: listId,
        playlistLabel: label.trim(),
        playlistUrl: url.trim(),
      });
      if (body.active) {
        setActive(body.active);
        setUrl("");
        setLabel("");
        flash("Live! Everyone's listening now.");
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
      const body = await apiPost<{ active?: ActivePlaylist | null }>({ clear: true });
      if (!body.active) {
        setActive(null);
        flash("Set ended. Back to regular rotations.");
      }
    } catch {
      flash("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  /* ── render ── */
  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-amber-400/80">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        DJ Booth
      </div>

      {active ? (
        /* ── something is on air ── */
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-amber-300">
              {active.playlistLabel}
            </p>
            <p className="text-[11px] text-white/40">
              Set at {new Date(active.setAt).toLocaleTimeString()}
            </p>
          </div>
          <button
            type="button"
            onClick={stop}
            disabled={busy}
            className="shrink-0 rounded-xl border border-pink-500/40 bg-pink-500/10 px-5 py-2 text-[11px] font-bold text-pink-300 hover:bg-pink-500/20 disabled:opacity-40"
          >
            {busy ? "Stopping…" : "Stop Set"}
          </button>
        </div>
      ) : (
        /* ── paste to go live ── */
        <div className="mt-3 space-y-2.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube playlist link…"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Name your set"
              maxLength={120}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={start}
              disabled={busy || !url.trim() || !label.trim()}
              className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-40"
            >
              {busy ? "…" : "Go Live"}
            </button>
          </div>
        </div>
      )}

      {/* flash */}
      {msg && (
        <p className="mt-2 text-center text-[11px] text-amber-300/80">{msg}</p>
      )}
    </div>
  );
}
