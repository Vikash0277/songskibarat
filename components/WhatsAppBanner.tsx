"use client";

interface WhatsAppBannerProps {
  theme?: string;
}

export default function WhatsAppBanner({ theme = "deluxe" }: WhatsAppBannerProps) {
  const getSubText = () => {
    switch (theme) {
      case "cyber":
        return "Join the songskibarat crew on WhatsApp — ...";
      case "golden":
        return "Join the 90s Cassette Club on WhatsApp — ...";
      case "sepia":
        return "Join the Midnight Radio crew on WhatsApp — ...";
      case "deluxe":
      default:
        return "Join the Saloon crew on WhatsApp — ...";
    }
  };

  return (
    <div className="w-full px-4">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#121619]/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20">
        <div className="flex items-center justify-between gap-3">
          {/* Left: WhatsApp icon + Info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-[#25D366]/20">
              {/* WhatsApp Icon SVG */}
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-semibold tracking-wide text-white">
                Get new songs before every...
              </h4>
              <p className="truncate text-[11px] text-white/60 transition-all">
                {getSubText()}
              </p>
            </div>
          </div>

          {/* Right: Join Free Button */}
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-[#25D366] px-4 py-1.5 text-xs font-bold text-black shadow-md shadow-[#25D366]/20 transition-transform hover:scale-105 hover:bg-[#20bd5a] active:scale-95"
          >
            Join Free
          </a>
        </div>
      </div>
    </div>
  );
}
