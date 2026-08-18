import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import Link from "next/link";
import { playlists } from "@/lib/data";

export const metadata: Metadata = {
  title: "Playlists — songskibarat Radio",
  description:
    "Five rotations on songskibarat — 90s Dard, Deluxe Saloon, Truck Driver, Bus Driver and Bhojpuri.",
  alternates: { canonical: "/playlists" },
  openGraph: {
    type: "website",
    title: "Playlists — songskibarat Radio",
    description:
      "Five rotations on songskibarat — pick one and it starts playing right here.",
    url: "/playlists",
    images: [{ url: "/deluxesaloon.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playlists — songskibarat Radio",
    description: "Five rotations on songskibarat — pick one and it starts playing.",
    images: ["/deluxesaloon.png"],
  },
};

export default function PlaylistsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20">
        <header className="pt-6 text-center sm:pt-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber/80">
            Rotation
          </div>
          <h1 className="glow-neon mt-2 font-cafe text-4xl font-extrabold text-cream sm:text-6xl">
            Rotations
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-cyber">
            Playlists
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/60">
            The café runs four rotations and picks one by the hour in India.
            Pick one and it starts playing right here.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {playlists.map((p) => (
            <Link
              key={p.slug}
              href={`/playlists/${p.slug}`}
              className="group rounded-xl border border-line bg-black/40 p-6 backdrop-blur-sm transition-colors hover:border-neon"
            >
              <div className="text-[10px] uppercase tracking-widest text-amber/80">
                {p.hours}
              </div>
              <h2 className="mt-2 font-cafe text-3xl font-bold text-cream group-hover:text-neon">
                {p.en}
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-cream/60">
                {p.blurb}
              </p>
              <div className="mt-4 text-xs font-bold uppercase tracking-widest text-neon">
                Open rotation →
              </div>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
