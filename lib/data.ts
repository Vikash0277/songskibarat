export type Playlist = {
  slug: string;
  hi: string;
  en: string;
  hours: string;
  blurb: string;
  playlistId: string;
  ytMusicUrl: string;
};

// The rotations below each point at their own YouTube Music playlist. The
// master playlist is verified embeddable; every new playlistId added must be
// checked for embed permissions before it will play inside the radio.
export const MASTER_PLAYLIST_ID = "PLTJ1PnzCWyFw";
export const MASTER_YT_MUSIC_URL = `https://music.youtube.com/playlist?list=${MASTER_PLAYLIST_ID}`;

export const playlists: Playlist[] = [
  {
    slug: "dard-90s",
    hi: "90s Dard",
    en: "90s Dard",
    hours: "18:00–22:00 IST",
    blurb:
      "The heartbreak half of the nineties: slow, melodic and completely unembarrassed, fading into the evening shift.",
    playlistId: MASTER_PLAYLIST_ID,
    ytMusicUrl: MASTER_YT_MUSIC_URL,
  },
  {
    slug: "deluxe-saloon",
    hi: "Deluxe Saloon",
    en: "Deluxe Saloon",
    hours: "All Day · 24/7",
    blurb:
      "The flagship rotation — the all-open-hours crowd pleasers that never leave the saloon speakers, start to finish.",
    playlistId: MASTER_PLAYLIST_ID,
    ytMusicUrl: MASTER_YT_MUSIC_URL,
  },
  {
    slug: "truck-driver",
    hi: "Truck Driver",
    en: "Truck Driver",
    hours: "All Day · 24/7",
    blurb:
      "Highway hours — distance, letters from home and long open roads, moving the same way the wheels do.",
    playlistId: "PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    ytMusicUrl: "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
  },
  {
    slug: "bus-driver",
    hi: "Bus Driver",
    en: "Bus Driver",
    hours: "All Day · 24/7",
    blurb:
      "Long routes and full coaches — travel anthems that keep the wheels rolling through every stop and start.",
    playlistId: "PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    ytMusicUrl: "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
  },
  {
    slug: "bhojpuri",
    hi: "Bhojpuri",
    en: "Bhojpuri",
    hours: "All Day · 24/7",
    blurb:
      "High-voltage Bhojpuri numbers for the loud hours — wedding-floor beats and train-bunk energy at full volume.",
    playlistId: "RDCLAK5uy_ltBUnE76-ol1ufdgUWN4T7WtFljvu8gYM",
    ytMusicUrl: "https://music.youtube.com/playlist?list=RDCLAK5uy_ltBUnE76-ol1ufdgUWN4T7WtFljvu8gYM",
  },
];

export function getPlaylistBySlug(slug: string): Playlist | undefined {
  return playlists.find((p) => p.slug === slug);
}
