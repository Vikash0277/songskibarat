import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlaylistBySlug, playlists } from "@/lib/data";

export function generateStaticParams() {
  return playlists.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/playlists/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pl = getPlaylistBySlug(slug);
  if (!pl) return { title: "Not found" };
  const url = `/playlists/${pl.slug}`;
  return {
    title: `${pl.en} — songskibarat Radio`,
    description: pl.blurb,
    alternates: { canonical: url },
    openGraph: {
      type: "music.playlist",
      title: `${pl.en} — songskibarat Radio`,
      description: pl.blurb,
      url,
      images: [{ url: "/deluxesaloon.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pl.en} — songskibarat Radio`,
      description: pl.blurb,
      images: ["/deluxesaloon.png"],
    },
  };
}

export default async function PlaylistPage({
  params,
}: PageProps<"/playlists/[slug]">) {
  const { slug } = await params;
  const pl = getPlaylistBySlug(slug);
  if (!pl) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    name: pl.en,
    description: pl.blurb,
    url: `https://songskibarat.in/playlists/${pl.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20">
        <header className="pt-6 text-center sm:pt-10">
          <Link
            href="/playlists"
            className="text-[10px] uppercase tracking-[0.3em] text-cyber hover:text-cream"
          >
            ← All rotations
          </Link>
          <div className="mt-3 text-[10px] uppercase tracking-widest text-amber/80">
            {pl.hours}
          </div>
          <h1 className="glow-neon mt-2 font-cafe text-4xl font-extrabold text-cream sm:text-6xl">
            {pl.en}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/60">
            {pl.blurb}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/?playlist=${pl.slug}`}
              className="rounded-full border border-neon bg-neon/20 px-6 py-3 text-sm font-bold text-neon transition-colors hover:bg-neon/40"
            >
              ▶ Play this rotation
            </Link>
            <a
              href={pl.ytMusicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line bg-black/40 px-6 py-3 text-sm text-cream/80 transition-colors hover:border-cyber hover:text-cyber"
            >
              Open in YT Music ↗
            </a>
          </div>
        </header>
      </main>
      <SiteFooter />
    </>
  );
}
