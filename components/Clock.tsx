"use client";

import { useEffect, useState } from "react";

function istTime(d: Date): string {
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
  const date = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${time} · ${date}`;
}

export default function Clock() {
  // Stable values on first render (SSR) to avoid hydration mismatches;
  // real clock starts ticking after mount.
  const [now, setNow] = useState<Date | null>(null);
  const [online, setOnline] = useState(142);

  useEffect(() => {
    const t = window.setTimeout(() => setNow(new Date()), 0);
    const i = window.setInterval(() => setNow(new Date()), 1000);
    const o = window.setInterval(() => {
      setOnline((n) => Math.max(80, Math.min(220, n + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(i);
      window.clearInterval(o);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-cream/70 sm:text-xs">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber pulse-dot" />
        {now ? istTime(now) : "— — · — —"}
      </span>
      <span className="text-cream/30">·</span>
      <span>
        <span className="text-cyber">{online}</span> online
      </span>
    </div>
  );
}
