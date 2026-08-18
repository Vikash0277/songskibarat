"use client";

import { Suspense, useState } from "react";
import TopHeader from "@/components/TopHeader";
import Background from "@/components/Background";
import WhatsAppBanner from "@/components/WhatsAppBanner";
import RadioPlayer from "@/components/RadioPlayer";
import Modals from "@/components/Modals";
import LibraryDrawer from "@/components/LibraryDrawer";
import DJBar from "@/components/DJBar";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { playlists } from "@/lib/data";

const THEME_DATA = {
  deluxe: {
    line1: "Deluxe",
    line2: "Saloon",
    tagline: "Deluxe Saloon · Open All Hours",
    playlistSlug: "deluxe-saloon",
    playlistLabel: "Deluxe Saloon Radio",
  },
  cyber: {
    line1: "Cyber",
    line2: "Café",
    tagline: "Cyber Café · Open All Hours",
    playlistSlug: "deluxe-saloon",
    playlistLabel: "Cyber Café Radio",
  },
  golden: {
    line1: "Golden",
    line2: "90s",
    tagline: "Golden 90s Radio · 24/7 Cassette Gold",
    playlistSlug: "dard-90s",
    playlistLabel: "Golden 90s Radio",
  },
  sepia: {
    line1: "Midnight",
    line2: "Radio",
    tagline: "Midnight Radio · 24/7 Sepia Beats",
    playlistSlug: "dard-90s",
    playlistLabel: "Midnight Radio",
  },
};

const THEME_KEYS = ["deluxe", "cyber", "golden", "sepia"] as const;

export default function Home() {
  const [activeModal, setActiveModal] = useState<"about" | "faq" | "support" | "theme" | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [theme, setTheme] = useState<typeof THEME_KEYS[number]>("deluxe");
  const [playlistTrigger, setPlaylistTrigger] = useState(0);
  const [djActive, setDjActive] = useState(false);

  const currentHeroText = THEME_DATA[theme] || THEME_DATA.deluxe;

  const handleSetTheme = (t: typeof THEME_KEYS[number]) => {
    setTheme(t);
    // Bump trigger so RadioPlayer reacts even if switching back to same theme
    setPlaylistTrigger((prev) => prev + 1);
  };

  const handleOpenModal = (modal: "about" | "faq" | "support" | "theme") => {
    setActiveModal(modal);
  };

  return (
    <div className="relative min-h-screen flex flex-col select-none">
      {/* Background layer */}
      <Background theme={theme} djActive={djActive} />

      {/* Top Header Navigation */}
      <TopHeader onOpenModal={handleOpenModal} onOpenLibrary={() => setLibraryOpen(true)} currentTheme={theme} />

      {/* Main Fullscreen Hero Area */}
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-end px-4 pb-6 pt-4 text-center">
        {/* Center Hero - just the live indicator */}
        <div className="flex flex-1 flex-col items-center justify-center py-2 sm:py-12">
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <p className="text-xs uppercase tracking-[0.35em] text-white/80 font-mono transition-all duration-300">
              {currentHeroText.tagline}
            </p>
          </div>
        </div>

        {/* Bottom: WhatsApp Banner + Player + Scroll Cue */}
        <div className="w-full space-y-2 sm:space-y-3.5 pb-2">
          {/* <WhatsAppBanner theme={theme} /> */}
          <Suspense
            fallback={
              <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-black/60 p-4 text-center text-xs text-white/60 backdrop-blur-md">
                Loading radio engine…
              </div>
            }
          >
            <RadioPlayer
              externalPlaylistSlug={currentHeroText.playlistSlug}
              externalPlaylistLabel={currentHeroText.playlistLabel}
              externalPlaylistTrigger={playlistTrigger}
              onDjActiveChange={setDjActive}
            />
          </Suspense>
        </div>

        <div className="mt-1 sm:mt-3 flex flex-col items-center gap-1.5 text-center">
          <a
            href="https://www.sorabyte.in/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono tracking-wider text-white/50 transition-colors hover:text-white/80"
          >
            Contact: sorabyte.in
          </a>
          
          <a
            href="#rotations"
            className="group flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-amber-400"
          >
            <span>SCROLL</span>
            <span className="text-sm animate-bounce text-amber-400/70">⌄</span>
          </a>
        </div>
      </main>

      {/* Below-the-fold content sections */}
      <div id="rotations" className="relative z-10 border-t border-white/10 bg-[#0a0c10]/90 px-4 py-16 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl">
          {/* DJ Booth – go live with your own playlist */}
          <DJBar />

          {/* Section 1: Rotations */}
          <div className="text-center">
            <h2 className="font-cafe text-2xl font-extrabold text-white sm:text-3xl">
              Radio Rotations
            </h2>
            <p className="mt-2 text-xs uppercase tracking-widest text-amber-400/90">
              Curated 90s & 2000s Bollywood Time Slots
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <Link
                key={p.slug}
                href={`/?playlist=${p.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-white/10 hover:shadow-xl"
              >
                <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                  <span>{p.hours}</span>
                </div>
                <div className="mt-3 font-cafe text-2xl font-bold text-white group-hover:text-amber-300">
                  {p.hi}
                </div>
                <div className="text-xs text-white/70">{p.en}</div>
                <p className="mt-3 text-xs leading-relaxed text-white/60">
                  {p.blurb}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16">
          <SiteFooter />
        </div>
      </div>

      {/* Interactive Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        currentTheme={theme}
        onSelectTheme={(t) => handleSetTheme(t as typeof THEME_KEYS[number])}
      />

      {/* Library Drawer */}
      <LibraryDrawer open={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </div>
  );
}
