import Link from "next/link";
import { MASTER_YT_MUSIC_URL, playlists } from "@/lib/data";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/60 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 text-xs leading-relaxed text-cream/60 sm:grid-cols-3">
        <div>
          <div className="mb-2 font-cafe text-sm font-bold text-cream">
            songskibarat
          </div>
          <p>
            90s Hindi film songs, playing round the clock — the kind of tape
            that never stops at a neighbourhood café that never sleeps. Audio
            streams through YouTube&apos;s embedded player.
          </p>
        </div>
        <div>
          <div className="mb-2 font-cafe text-sm font-bold text-cream">
            Rotations
          </div>
          <ul className="space-y-1">
            {playlists.map((p) => (
              <li key={p.slug}>
                <Link href={`/playlists/${p.slug}`} className="hover:text-cyber">
                  {p.en}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/playlists/mine"
            className="mt-2 inline-block text-xs text-amber/80 hover:text-amber"
          >
            My Playlists ↗
          </Link>
          <Link
            href="/streaming"
            className="mt-1 inline-block text-xs text-amber/80 hover:text-amber"
          >
            DJ Booth ↗
          </Link>
        </div>
        <div>
          <div className="mb-2 font-cafe text-sm font-bold text-cream">
            Listen elsewhere
          </div>
          <ul className="space-y-1">
            <li>
              <a
                href={MASTER_YT_MUSIC_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyber"
              >
                YouTube Music
              </a>
            </li>
            <li>
              <a
                href="https://music.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyber"
              >
                Open YouTube Music ↗
              </a>
            </li>
          </ul>
          <p className="mt-3 text-[10px] text-cream/40">
            Nothing is hosted on this site. All rights stay with the labels,
            composers and performers.
          </p>
        </div>
      </div>
      <div className="border-t border-line/40 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-cream/40">
        © 2026 songskibarat · songskibarat radio
      </div>
    </footer>
  );
}
