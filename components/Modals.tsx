"use client";

import { useEffect } from "react";

interface ModalsProps {
  activeModal: "about" | "faq" | "support" | "theme" | null;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export default function Modals({
  activeModal,
  onClose,
  currentTheme,
  onSelectTheme,
}: ModalsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const themes = [
    {
      id: "deluxe",
      name: "Deluxe Saloon",
      desc: "Classic Indian retro street vibe with vintage golden radio accents.",
      color: "bg-amber-500",
    },
    {
      id: "cyber",
      name: "Cyber Café (Cyber Neon)",
      desc: "Neon pink & cyan glow for late-night internet shop feel.",
      color: "bg-pink-500",
    },
    {
      id: "golden",
      name: "Golden 90s",
      desc: "Rich nostalgia cassette tape yellow & dark oak tones.",
      color: "bg-yellow-400",
    },
    {
      id: "sepia",
      name: "Midnight Sepia",
      desc: "Warm ambient dark sepia for soothing nighttime listening.",
      color: "bg-[#d97706]",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#141210]/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>

        {/* Modal Contents based on active tab */}
        {activeModal === "about" && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <span>☕ About songskibarat</span>
            </div>
            <h3 className="mt-2 font-cafe text-3xl font-extrabold text-white">
              songskibarat
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Welcome to songskibarat — an all-night radio of 90s & 2000s Hindi
              melodies. Inspired by the nostalgia of Indian internet parlors
              and neighborhood saloons where timeless songs played
              continuously on old radios.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Curated round-the-clock rotations featuring Kumar Sanu, Udit Narayan, Alka Yagnik, Sonu Nigam, Pankaj Udhas, and more.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                Enjoy Music
              </button>
            </div>
          </div>
        )}

        {activeModal === "faq" && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <span>❓ Frequently Asked Questions</span>
            </div>
            <h3 className="mt-2 font-cafe text-2xl font-bold text-white">
              FAQ & Help
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <h4 className="font-semibold text-white">How does the Radio work?</h4>
                <p className="mt-1 text-xs text-white/70">
                  Our embedded player plays curated 90s & 2000s Bollywood song rotations via YouTube Audio without interruptions.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <h4 className="font-semibold text-white">Can I choose my own playlist?</h4>
                <p className="mt-1 text-xs text-white/70">
                  Yes! You can select any rotation below or paste your own YouTube Music playlist URL into the player.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <h4 className="font-semibold text-white">Is it completely free?</h4>
                <p className="mt-1 text-xs text-white/70">
                  100% free with zero ads added by us. Open all night for your working, studying, or relaxing sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeModal === "support" && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/20 text-3xl text-pink-400">
              ❤️
            </div>
            <h3 className="mt-3 font-cafe text-3xl font-extrabold text-white">
              Support songskibarat
            </h3>
            <p className="mt-2 text-xs text-white/70">
              Help keep the late-night radio streaming and servers running smoothly.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Buy a Cup of Chai ☕
              </div>
              <p className="mt-1 text-xs text-white/80">
                Your support helps us keep adding classic tracks and maintaining high quality streams.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://razorpay.me/@vikashprasad4634"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-center text-xs font-bold text-black shadow-lg hover:brightness-110"
                >
                  Pay using UPI / Card
                </a>
              </div>
              <div className="mt-3 text-center text-[11px] text-white/50">
                Razorpay · @vikashprasad4634
              </div>
            </div>
          </div>
        )}

        {activeModal === "theme" && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <span>🎨 Color Themes</span>
            </div>
            <h3 className="mt-2 font-cafe text-2xl font-bold text-white">
              Select Theme Vibe
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {themes.map((t) => {
                const selected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectTheme(t.id);
                      onClose();
                    }}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      selected
                        ? "border-amber-400 bg-amber-500/15"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span className={`mt-0.5 h-3.5 w-3.5 rounded-full ${t.color}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{t.name}</div>
                      <div className="mt-0.5 text-[11px] text-white/60">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
