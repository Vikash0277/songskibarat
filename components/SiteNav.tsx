import Link from "next/link";

const links = [
  { href: "/", label: "Radio" },
  { href: "/playlists", label: "Playlists" },
  { href: "/playlists/mine", label: "My Playlists" },
];

export default function SiteNav() {
  return (
    <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
      <Link href="/" className="font-cafe text-lg font-bold tracking-wide text-cream">
        songskibarat<span className="text-neon">_</span>
      </Link>
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-cream/70 transition-colors hover:text-cyber"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
