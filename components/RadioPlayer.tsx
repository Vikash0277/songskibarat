"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MASTER_PLAYLIST_ID, playlists, type Playlist } from "@/lib/data";
function matchPreset(slug: string | null) {
  return playlists.find((p) => p.slug === slug);
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  loadPlaylist(opts: {
    playlist?: string[];
    list?: string;
    listType: string;
    index?: number;
  }): void;
  setVolume(v: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoData(): { title?: string; video_id?: string };
  getPlayerState(): number;
}

const API_SRC = "https://www.youtube.com/iframe_api";
let apiPromise: Promise<void> | null = null;

function ensureYtApi(): Promise<void> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const tag = document.createElement("script");
      tag.src = API_SRC;
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
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

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface RadioPlayerProps {
  onSongChange?: (title: string, videoId: string) => void;
  externalPlaylistSlug?: string | null;
  externalPlaylistLabel?: string;
  externalPlaylistTrigger?: number;
}

export default function RadioPlayer({
  onSongChange,
  externalPlaylistSlug,
  externalPlaylistLabel,
  externalPlaylistTrigger,
}: RadioPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const tickRef = useRef<number | null>(null);
  const pendingExternalRef = useRef<{ slug: string; label: string } | null>(null);

  const searchParams = useSearchParams();
  const queryPlaylist = searchParams.get("playlist");
  const queryPreset = matchPreset(queryPlaylist);
  const externalPreset = matchPreset(externalPlaylistSlug ?? "");
  const defaultPreset = queryPreset ?? externalPreset ?? playlists[0];
  const initialListIdRef = useRef(defaultPreset?.playlistId ?? MASTER_PLAYLIST_ID);

  const [error, setError] = useState<string | null>(null);

  const [activeSlug, setActiveSlug] = useState(
    queryPreset?.slug ?? playlists[0]?.slug
  );
  const [label, setLabel] = useState(
    queryPreset?.en ?? playlists[0]?.en ?? "Deluxe Saloon Radio"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("v0_IRIFYC0k");
  const [current, setCurrent] = useState(311); // 5:11 default visual initial
  const [duration, setDuration] = useState(385); // 6:25 default visual initial
  const volume = 75;
  const [customUrl, setCustomUrl] = useState("");
  const [scrubbing, setScrubbing] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const updateNowPlaying = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const data = p.getVideoData();
    if (data?.title) {
      setTitle(data.title);
      onSongChange?.(data.title, data.video_id || "");
    }
    if (data?.video_id) setVideoId(data.video_id);
    const d = p.getDuration();
    if (Number.isFinite(d) && d > 0) setDuration(d);
    if (!scrubbing) {
      const cur = p.getCurrentTime();
      if (Number.isFinite(cur)) setCurrent(cur);
    }
  }, [scrubbing, onSongChange]);

  useEffect(() => {
    let disposed = false;

    const start = async () => {
      try {
        await ensureYtApi();
        if (disposed || !hostRef.current) return;
        const player = new window.YT.Player(hostRef.current, {
          height: "100%",
          width: "100%",
          playerVars: {
            list: initialListIdRef.current,
            listType: "playlist",
            autoplay: 0,
            controls: 0,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              if (disposed) return;
              readyRef.current = true;
              playerRef.current = player;
              player.setVolume(volume);
              updateNowPlaying();
              tickRef.current = window.setInterval(updateNowPlaying, 1000);
              const pending = pendingExternalRef.current;
              if (pending) {
                setActiveSlug(pending.slug);
                setLabel(pending.label);
                setError(null);
                const preset = matchPreset(pending.slug);
                if (preset) {
                  player.loadPlaylist({
                    list: preset.playlistId,
                    listType: "playlist",
                    index: 0,
                  });
                  player.playVideo();
                  setIsPlaying(true);
                }
              }
            },
            onStateChange: (e: { data: number }) => {
              setIsPlaying(e.data === 1);
              if (e.data === 1) updateNowPlaying();
              if (e.data === 0) updateNowPlaying();
            },
            onError: () => {
              setError(
                "This track or playlist restricted embed playback. Switching track…"
              );
            },
          },
        });
      } catch {
        if (!disposed) setError("Could not initialize YouTube Radio engine.");
      }
    };

    start();
    return () => {
      disposed = true;
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme selection drives the playlist (unless a deep-link overrides below)
  useEffect(() => {
    const preset = matchPreset(externalPlaylistSlug ?? "");
    if (!preset) return;
    pendingExternalRef.current = {
      slug: preset.slug,
      label: externalPlaylistLabel ?? preset.en,
    };
    const p = playerRef.current;
    if (p && readyRef.current) {
      setActiveSlug(preset.slug);
      setLabel(externalPlaylistLabel ?? preset.en);
      setError(null);
      p.loadPlaylist({
        list: preset.playlistId,
        listType: "playlist",
        index: 0,
      });
      p.playVideo();
      setIsPlaying(true);
    }
  }, [externalPlaylistSlug, externalPlaylistLabel, externalPlaylistTrigger]);

  // Deep-link ?playlist= wins over the theme-driven playlist on mount/navigation.
  useEffect(() => {
    if (!queryPreset) return;
    pendingExternalRef.current = {
      slug: queryPreset.slug,
      label: queryPreset.en,
    };
    const p = playerRef.current;
    if (p && readyRef.current) {
      setActiveSlug(queryPreset.slug);
      setLabel(queryPreset.en);
      setError(null);
      p.loadPlaylist({
        list: queryPreset.playlistId,
        listType: "playlist",
        index: 0,
      });
      p.playVideo();
      setIsPlaying(true);
    }
  }, [queryPreset]);

  // Poll the server for an active DJ playlist and load it into the player.
  useEffect(() => {
    let cancelled = false;
    let lastSeen: string | null = null;

    const poll = async () => {
      try {
        const res = await fetch("/api/streaming/active");
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as {
          active?: { playlistId: string; playlistLabel: string } | null;
        };
        const active = body.active;
        if (cancelled) return;

        const activeId = active?.playlistId ?? null;

        // New playlist appeared — load it.
        if (activeId && activeId !== lastSeen) {
          lastSeen = activeId;
          const djLabel = active?.playlistLabel ?? "Live DJ";
          const p = playerRef.current;
          if (p && readyRef.current) {
            setActiveSlug("dj");
            setLabel(djLabel);
            setError(null);
            try {
              p.stopVideo();
            } catch {
              /* ignore */
            }
            window.setTimeout(() => {
              try {
                p.loadPlaylist({ list: activeId, listType: "playlist", index: 0 });
                p.playVideo();
                setIsPlaying(true);
              } catch {
                setError("Could not load that playlist. It may be embed-restricted.");
              }
            }, 300);
          } else {
            pendingExternalRef.current = {
              slug: "dj",
              label: djLabel,
            };
          }
          return;
        }

        // Cleared — revert to rotation.
        if (!activeId && lastSeen) {
          lastSeen = null;
          const p = playerRef.current;
          const revertPreset = matchPreset(externalPlaylistSlug ?? "") ?? playlists[0];
          if (p && readyRef.current && revertPreset) {
            setActiveSlug(revertPreset.slug);
            setLabel(externalPlaylistLabel ?? revertPreset.en);
            setError(null);
            try {
              p.stopVideo();
            } catch {
              /* ignore */
            }
            window.setTimeout(() => {
              try {
                p.loadPlaylist({
                  list: revertPreset.playlistId,
                  listType: "playlist",
                  index: 0,
                });
                p.playVideo();
                setIsPlaying(true);
              } catch {
                /* ignore */
              }
            }, 300);
          }
        }
      } catch {
        // ignore — next poll retries
      }
    };

    void poll();
    const t = window.setInterval(poll, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [externalPlaylistSlug, externalPlaylistLabel]);

  const play = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.getPlayerState() === 1) {
      p.pauseVideo();
      setIsPlaying(false);
    } else {
      p.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const selectPlaylist = useCallback((pl: Playlist, name: string) => {
    setActiveSlug(pl.slug);
    setLabel(name);
    setError(null);
    const p = playerRef.current;
    if (p && readyRef.current) {
      p.loadPlaylist({
        list: pl.playlistId,
        listType: "playlist",
        index: 0,
      });
      p.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const submitCustom = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const list = extractListId(customUrl);
      if (!list) {
        setError("Paste a valid YouTube playlist link (containing ?list=…).");
        return;
      }
      setCustomUrl("");
      setActiveSlug("custom");
      setLabel("Custom playlist");
      setError(null);
      const p = playerRef.current;
      if (p && readyRef.current) {
        p.loadPlaylist({ list, listType: "playlist", index: 0 });
        p.playVideo();
        setIsPlaying(true);
      }
    },
    [customUrl]
  );

  const seekTo = useCallback((sec: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.pauseVideo();
    // @ts-expect-error seekTo exists on YouTube player
    p.seekTo(sec, true);
    p.playVideo();
    setCurrent(sec);
    setIsPlaying(true);
  }, []);

  return (
    <div className="relative w-full">
      {/* Floating Bottom Audio Player Dock matching screenshot */}
      <div className="mx-auto max-w-2xl px-3">
        {/* Expandable Rotations & Custom Playlist Drawer */}
        {showDrawer && (
          <div className="mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200 rounded-3xl border border-white/15 bg-[#171411]/95 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Radio Rotations
              </span>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="text-xs text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {playlists.map((pl) => {
                const active = pl.slug === activeSlug;
                return (
                  <button
                    key={pl.slug}
                    type="button"
                    onClick={() => {
                      selectPlaylist(pl, pl.en);
                      setShowDrawer(false);
                    }}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="text-[10px] text-amber-400/80">{pl.hours}</div>
                    <div className="mt-0.5 font-cafe text-sm font-bold truncate">{pl.hi}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Playlist URL input */}
            <form onSubmit={submitCustom} className="mt-3 flex gap-2">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste YouTube playlist link..."
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                Play
              </button>
            </form>
          </div>
        )}

        {/* Main Floating Audio Dock Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#171411]/95 px-4 py-3 shadow-2xl backdrop-blur-2xl transition-all hover:border-white/25">
          <div className="flex items-center gap-3.5">
            {/* Left: Artwork / Thumbnail */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black shadow-md sm:h-14 sm:w-14">
              {videoId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Track artwork"
                  className={`h-full w-full object-cover transition-transform duration-500 ${
                    isPlaying ? "scale-105" : "scale-100 opacity-80"
                  }`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-cafe text-xl text-amber-400">
                  📻
                </div>
              )}
              {/* Spinning vinyl ring overlay when playing */}
              {isPlaying && (
                <div className="absolute inset-0 rounded-xl border-2 border-amber-400/40 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Middle: Title, Subtitle, and Golden Seekbar */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs font-bold text-white sm:text-sm tracking-tight">
                  {title || "Deluxe Saloon Radio"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDrawer((v) => !v)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-amber-300/90 transition-all hover:bg-white/15"
                >
                  {label} ▾
                </button>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-medium text-white/60 min-w-[24px]">
                  {fmt(current)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 1)}
                  step={1}
                  value={Math.min(current, duration)}
                  onPointerDown={() => setScrubbing(true)}
                  onPointerUp={(e) => {
                    setScrubbing(false);
                    seekTo(Number((e.target as HTMLInputElement).value));
                  }}
                  onChange={(e) => setCurrent(Number(e.target.value))}
                  className="range-gold min-w-0 flex-1 cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                      (Math.min(current, duration) / Math.max(duration, 1)) * 100
                    }%, rgba(255, 255, 255, 0.15) ${
                      (Math.min(current, duration) / Math.max(duration, 1)) * 100
                    }%, rgba(255, 255, 255, 0.15) 100%)`,
                  }}
                />
                <span className="text-[10px] font-medium text-white/60 min-w-[24px] text-right">
                  {fmt(duration)}
                </span>
              </div>
            </div>

            {/* Right: Audio Control Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => playerRef.current?.previousVideo()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-90"
                aria-label="Previous"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Main Circular Golden Play/Pause Button */}
              <button
                type="button"
                onClick={play}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b] text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:bg-[#d97706] active:scale-95"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => playerRef.current?.nextVideo()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-90"
                aria-label="Next"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-300">
              ⚠ {error}
            </div>
          )}
        </div>
      </div>

      {/* Hidden YouTube player host */}
      <div className="pointer-events-none fixed -left-[9999px] top-0 h-[360px] w-[640px]">
        <div ref={hostRef} className="h-full w-full" />
      </div>
    </div>
  );
}
