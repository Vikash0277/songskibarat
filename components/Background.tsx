"use client";

interface BackgroundProps {
  theme?: string;
}

const THEME_BACKGROUNDS: Record<string, string> = {
  deluxe: "/deluxesaloon.png",
  cyber: "/cybercafe.png",
  golden: "/cybercafe.png",
  sepia: "/cybercafe.png",
};

export default function Background({ theme = "deluxe" }: BackgroundProps) {
  const bgImage = THEME_BACKGROUNDS[theme] ?? THEME_BACKGROUNDS.deluxe;

  const getThemeOverlay = () => {
    switch (theme) {
      case "cyber":
        return "from-black/70 via-purple-950/30 to-black/90";
      case "golden":
        return "from-black/60 via-amber-950/25 to-black/90";
      case "sepia":
        return "from-black/75 via-yellow-950/35 to-black/95";
      case "deluxe":
      default:
        return "from-black/55 via-black/35 to-black/85";
    }
  };

  return (
    <>
      {/* Fullscreen background image — switches per theme */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Theme gradient overlay */}
      <div
        aria-hidden
        className={`fixed inset-0 -z-10 bg-gradient-to-b ${getThemeOverlay()} transition-colors duration-700`}
      />

      {/* Subtle retro scanlines */}
      <div aria-hidden className="scanlines fixed inset-0 -z-10 opacity-40 pointer-events-none" />

      {/* Deep vignette around edges */}
      <div aria-hidden className="vignette fixed inset-0 -z-10 pointer-events-none" />
    </>
  );
}
