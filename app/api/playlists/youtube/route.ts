import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";
import { extractPlaylistId, fetchPlaylistMetadata } from "@/lib/youtube";
import { toPublicPlaylist } from "@/lib/playlists";
import { jsonError, jsonOk, requireUser } from "@/lib/api";

const schema = z.object({
  url: z.string().trim().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth) return jsonError("Not authenticated.", 401);

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return jsonError("A valid YouTube playlist URL is required.", 400);
  }

  const playlistId = extractPlaylistId(body.data.url);
  if (!playlistId) {
    return jsonError("Invalid YouTube playlist URL.", 400);
  }

  const meta = await fetchPlaylistMetadata(playlistId);
  if (!meta) {
    return jsonError("Playlist not found or is private.", 404);
  }

  await connectDb();

  const existing = await UserPlaylist.findOne({
    ownerId: auth.userId,
    playlistId,
  });
  if (existing) {
    return jsonOk({
      playlist: toPublicPlaylist(existing.toObject()),
      duplicate: true,
    });
  }

  const playlist = await UserPlaylist.create({
    ownerId: auth.userId,
    playlistId,
    title: meta.title,
    description: meta.description,
    thumbnail: meta.thumbnail,
  });

  return jsonOk(
    { playlist: toPublicPlaylist(playlist.toObject()), duplicate: false },
    201
  );
}
