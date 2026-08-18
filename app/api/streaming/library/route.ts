import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, rateLimit, clientIp } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { LibraryPlaylist } from "@/models/LibraryPlaylist";

/**
 * GET  — public. Returns all library playlists. Optional ?search= to filter by label.
 * POST — public, rate-limited. Adds a playlist to the library.
 */

export async function GET(req: NextRequest) {
  await connectDb();
  const search = req.nextUrl.searchParams.get("search")?.trim();
  const filter = search
    ? { playlistLabel: { $regex: search, $options: "i" } }
    : {};
  const docs = await LibraryPlaylist.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return jsonOk({
    playlists: docs.map((d) => ({
      playlistId: d.playlistId,
      playlistLabel: d.playlistLabel,
      playlistUrl: d.playlistUrl,
      createdAt: d.createdAt,
    })),
  });
}

const schema = z.object({
  playlistId: z.string().trim().min(1),
  playlistLabel: z.string().trim().min(1).max(120),
  playlistUrl: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`library:${clientIp(req)}`, 10, 60);
  if (!rl.success) {
    return jsonError("Slow down — try again in a minute.", 429);
  }

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return jsonError("Provide playlistId, playlistLabel, and playlistUrl.", 400);
  }

  await connectDb();

  await LibraryPlaylist.findOneAndUpdate(
    { playlistId: body.data.playlistId },
    {
      playlistId: body.data.playlistId,
      playlistLabel: body.data.playlistLabel,
      playlistUrl: body.data.playlistUrl,
    },
    { upsert: true, new: true }
  );

  return jsonOk({ ok: true });
}
