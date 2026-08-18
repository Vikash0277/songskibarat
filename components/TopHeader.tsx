"use client";

import { useState, useEffect, useRef } from "react";

interface TopHeaderProps {
  onOpenModal: (modal: "about" | "faq" | "support" | "theme") => void;
  onOpenLibrary: () => void;
  currentTheme: string;
}

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function TopHeader({ onOpenModal, onOpenLibrary, currentTheme }: TopHeaderProps) {
  const [onlineCount, setOnlineCount] = useState(1000);
  const baseRef = useRef(1000);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    const id = makeSessionId();
    sessionIdRef.current = id;

    const beat = () => {
      fetch("/api/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    };
    const poll = () => {
      fetch("/api/online")
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.online === "number") baseRef.current = d.online;
        })
        .catch(() => {});
    };

    const tick = () => {
      setOnlineCount((prev) => {
        if (Math.random() < 0.08) {
          return 1000 + Math.floor(Math.random() * 1001);
        }
        const delta = Math.floor(Math.random() * 31) - 15; // -15..+15
        return Math.max(1000, Math.min(2000, prev + delta));
      });
    };

    beat();
    poll();
    // Start the random walk almost immediately so the badge doesn't sit at the base.
    const beatTimer = window.setInterval(beat, 15_000);
    const pollTimer = window.setInterval(poll, 8_000);
    // Random walk so the badge visibly ticks up and down across 1000-2000.
    const driftTimer = window.setInterval(tick, 2_500);
    window.setTimeout(tick, 300);
    let beatHandle = beatTimer;
    let pollHandle = pollTimer;
    let driftHandle = driftTimer;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        window.clearInterval(beatHandle);
        window.clearInterval(pollHandle);
        window.clearInterval(driftHandle);
      } else {
        beat();
        poll();
        beatHandle = window.setInterval(beat, 15_000);
        pollHandle = window.setInterval(poll, 8_000);
        driftHandle = window.setInterval(tick, 2_500);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(beatHandle);
      window.clearInterval(pollHandle);
      window.clearInterval(driftHandle);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <header className="relative z-30 w-full px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left items: Online counter & Theme dropdown */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Live Online Badge */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-white/20">
            <span className="pulse-dot relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium tracking-tight">
              <strong className="font-bold text-white">{onlineCount}</strong> online
            </span>
          </div>

          {/* Theme Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => onOpenModal("theme")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/60 active:scale-95"
            >
              <span>Change Theme</span>
              <span className="text-[10px] text-white/60">▾</span>
            </button>
          </div>
        </div>

        {/* Right items: Pill navigation buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onOpenModal("about")}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/60 hover:text-white active:scale-95"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => onOpenModal("faq")}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/60 hover:text-white active:scale-95"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-black/60 hover:text-amber-300 active:scale-95"
          >
            <span className="text-amber-400">♫</span> Library
          </button>
          <button
            type="button"
            onClick={() => onOpenModal("support")}
            className="flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition-all hover:border-pink-500/40 hover:bg-black/60 hover:text-pink-300 active:scale-95"
          >
            <span className="text-pink-400">❤️</span> Support
          </button>
        </div>
      </div>

      {/* Center: Brand name — absolutely positioned for true center */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center sm:block">
        <span className="font-cafe text-base font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
          songskibarat
        </span>
      </div>
    </header>
  );
}
