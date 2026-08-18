import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*?playlist="],
    },
    sitemap: "https://songskibarat.in/sitemap.xml",
  };
}
