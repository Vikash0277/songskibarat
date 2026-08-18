import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";

const ID_RE = /^[a-f\d]{24}$/i;

async function getPublicPlaylist(id: string) {
  if (!ID_RE.test(id)) return null;
  await connectDb();
  return UserPlaylist.findOne({ _id: id, visibility: "public" })
    .populate("ownerId", "name")
    .lean();
}

export async function generateMetadata({
  params,
}: PageProps<"/playlist/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pl = await getPublicPlaylist(id);
  if (!pl) return { title: "Playlist not found — songskibarat" };

  const url = `/playlist/${id}`;
  return {
    title: `${pl.title} — songskibarat`,
      description: pl.description || "A shared YouTube playlist on songskibarat Radio.",
    alternates: { canonical: url },
    openGraph: {
      type: "music.playlist",
      title: pl.title,
    description: pl.description || "A shared YouTube playlist on songskibarat Radio.",
      url,
      ...(pl.thumbnail ? { images: [{ url: pl.thumbnail }] } : {}),
    },
  };
}

export default function PlaylistPage({ params }: PageProps<"/playlist/[id]">) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20">
        <Suspense
          fallback={
            <div className="pt-16 text-center text-xs text-white/60">
              Loading playlist…
            </div>
          }
        >
          <Content params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pl = await getPublicPlaylist(id);
  if (!pl) notFound();

  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
    pl.playlistId
  )}`;
  const ownerName =
    pl.ownerId && typeof pl.ownerId === "object" && "name" in pl.ownerId
      ? pl.ownerId.name
      : null;

  return (
    <header className="pt-8 text-center sm:pt-12">
      <div className="text-[10px] uppercase tracking-[0.3em] text-amber/80">
        Shared playlist{ownerName ? ` · ${ownerName}` : ""}
      </div>
      <h1 className="glow-neon mt-2 font-cafe text-4xl font-extrabold text-cream sm:text-5xl">
        {pl.title}
      </h1>
      {pl.description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
          {pl.description}
        </p>
      )}

      <div className="mx-auto mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-black shadow-2xl">
        <iframe
          className="h-full w-full"
          src={embedUrl}
          title={pl.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`https://music.youtube.com/playlist?list=${encodeURIComponent(
            pl.playlistId
          )}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line bg-black/40 px-6 py-3 text-sm text-cream/80 transition-colors hover:border-cyber hover:text-cyber"
        >
          Open in YouTube ↗
        </a>
      </div>
    </header>
  );
}
