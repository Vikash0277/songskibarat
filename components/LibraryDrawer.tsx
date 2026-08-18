"use client";

import { useCallback, useEffect, useState } from "react";

interface LibraryItem {
  playlistId: string;
  playlistLabel: string;
  playlistUrl: string;
  createdAt: string;
}

interface LibraryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function LibraryDrawer({ open, onClose }: LibraryDrawerProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 4000);
  }, []);

  /* ── fetch library ── */
  useEffect(() => {
    if (!open) return;
    let disposed = false;
    const fetchLibrary = async () => {
      try {
        const qs = query ? `?search=${encodeURIComponent(query)}` : "";
        const res = await fetch(`/api/streaming/library${qs}`);
        if (!disposed && res.ok) {
          const body = (await res.json()) as { playlists?: LibraryItem[] };
          setItems(body.playlists ?? []);
        }
      } catch {
        /* ignore */
      }
    };
    void fetchLibrary();
    return () => {
      disposed = true;
    };
  }, [open, query]);

  /* ── close on Esc ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ── lock body scroll ── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSearch = () => {
    setQuery(search.trim());
  };

  const play = async (item: LibraryItem) => {
    setPlaying(item.playlistId);
    try {
      const res = await fetch("/api/streaming/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: item.playlistId,
          playlistLabel: item.playlistLabel,
          playlistUrl: item.playlistUrl,
        }),
      });
      const body = (await res.json()) as { active?: unknown; message?: string };
      if (res.ok && body.active) {
        flash(`Now playing: ${item.playlistLabel}`);
      } else {
        flash(body.message ?? "Could not start playback.");
      }
    } catch {
      flash("Could not reach the server.");
    } finally {
      setPlaying(null);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-[#0a0c10]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-cafe text-lg font-bold text-white">Library</h2>
            <p className="text-[11px] text-white/40">
              Playlists saved by the community
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/5 px-5 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Search playlists…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
            >
              Search
            </button>
          </div>
        </div>

        {/* Flash message */}
        {msg && (
          <div className="mx-5 mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-[11px] text-amber-300">
            {msg}
          </div>
        )}

        {/* Playlist list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <p className="mt-12 text-center text-xs text-white/30">
              No playlists yet. Paste one in the DJ Booth to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.playlistId}
                  className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:border-amber-400/30 hover:bg-white/[0.06]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.playlistLabel}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/30">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => play(item)}
                    disabled={playing === item.playlistId}
                    className="shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
                  >
                    {playing === item.playlistId ? "…" : "Play"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
