import type { MetadataRoute } from "next";
import { playlists } from "@/lib/data";

const BASE_URL = "https://songskibarat.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${BASE_URL}/`, lastModified },
    { url: `${BASE_URL}/playlists`, lastModified },
    ...playlists.map((p) => ({
      url: `${BASE_URL}/playlists/${p.slug}`,
      lastModified,
    })),
  ];
}
