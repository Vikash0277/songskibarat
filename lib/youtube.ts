const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "music.youtube.com",
  "youtu.be",
];

const LIST_ID_RE = /^[A-Za-z0-9_-]{13,}$/;

/**
 * Extracts a YouTube playlist id from a pasted URL (or a bare playlist id).
 * Only accepts known YouTube hosts and refuses everything else.
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return null;

  if (LIST_ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (!YOUTUBE_HOSTS.includes(host)) return null;

  const list = url.searchParams.get("list");
  if (list && LIST_ID_RE.test(list)) return list;
  return null;
}

export interface PlaylistMetadata {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
}

/**
 * Fetches playlist metadata using the YouTube Data API v3. Returns null for
 * playlists that are private, deleted, or otherwise not publicly accessible.
 */
export async function fetchPlaylistMetadata(
  playlistId: string
): Promise<PlaylistMetadata | null> {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_DATA_API_KEY is not set");

  const endpoint =
    "https://www.googleapis.com/youtube/v3/playlists" +
    `?part=snippet&id=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("YouTube Data API request failed");

  const data = (await res.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        description?: string;
        thumbnails?: Record<string, { url?: string } | undefined>;
      };
    }>;
  };

  const item = data.items?.[0];
  if (!item) return null;

  return {
    playlistId,
    title: item.snippet?.title?.trim() || "Untitled playlist",
    description: item.snippet?.description?.trim() || "",
    thumbnail:
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      "",
  };
}
