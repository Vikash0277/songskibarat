import type { Metadata, Viewport } from "next";
import { Baloo_2, Space_Mono } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["devanagari", "latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const space = Space_Mono({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://songskibarat.in"),
  title: "songskibarat — Deluxe Saloon Radio",
  description:
    "An always-on radio for the all-night deluxe saloon — retro Hindi favourites playing round the clock over a neon street corner.",
  icons: { icon: "/cybercafe.png" },
  openGraph: {
    type: "website",
    siteName: "songskibarat",
    title: "songskibarat — Deluxe Saloon Radio",
    description:
      "90s & 2000s Hindi songs, playing 24/7 — retro rotations from the saloon speakers, streaming live.",
    url: "https://songskibarat.in/",
    images: [{ url: "/deluxesaloon.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "songskibarat — Deluxe Saloon Radio",
    description:
      "90s & 2000s Hindi songs, playing 24/7 — retro rotations from the saloon speakers, streaming live.",
    images: ["/deluxesaloon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070910",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${space.variable} h-full antialiased`}
    >
      <body className="min-h-full font-mono">
        <Background />
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
