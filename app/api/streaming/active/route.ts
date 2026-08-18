import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, rateLimit, clientIp, requireUser } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { ActivePlaylist } from "@/models/ActivePlaylist";
import { LibraryPlaylist } from "@/models/LibraryPlaylist";
import { extractPlaylistId } from "@/lib/youtube";

/**
 * GET — returns the currently active DJ playlist (public, no auth).
 * POST — public (no auth required). Rate-limited per IP.
 *   { playlistId, playlistLabel } to go live, or { clear: true } to stop.
 */

export async function GET() {
  await connectDb();
  const doc = await ActivePlaylist.findOne().sort({ updatedAt: -1 });
  if (!doc) return jsonOk({ active: null });
  return jsonOk({
    active: {
      playlistId: doc.playlistId,
      playlistLabel: doc.playlistLabel,
      setAt: doc.updatedAt.toISOString(),
    },
  });
}

const setSchema = z.object({
  playlistId: z.string().trim().min(1),
  playlistLabel: z.string().trim().min(1).max(120),
  playlistUrl: z.string().trim().optional(),
});

const clearSchema = z.object({
  clear: z.literal(true),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`dj:${clientIp(req)}`, 5, 60);
  if (!rl.success) {
    return jsonError("Slow down — try again in a minute.", 429);
  }

  const raw = await req.json().catch(() => null);
  const cleared = clearSchema.safeParse(raw);
  if (cleared.success) {
    await connectDb();
    await ActivePlaylist.deleteMany({});
    return jsonOk({ active: null });
  }

  const body = setSchema.safeParse(raw);
  if (!body.success) {
    return jsonError("Provide a playlistId and playlistLabel.", 400);
  }

  const ytId = extractPlaylistId(
    `https://music.youtube.com/playlist?list=${body.data.playlistId}`
  );
  if (!ytId) {
    return jsonError("That doesn't look like a valid YouTube playlist.", 400);
  }

  await connectDb();

  const auth = await requireUser(req);

  await ActivePlaylist.deleteMany({});
  await ActivePlaylist.create({
    playlistId: body.data.playlistId,
    playlistLabel: body.data.playlistLabel,
    setBy: auth?.userId ?? null,
  });

  // Auto-save to library (upsert — avoids duplicates).
  const url = body.data.playlistUrl ?? `https://music.youtube.com/playlist?list=${body.data.playlistId}`;
  await LibraryPlaylist.findOneAndUpdate(
    { playlistId: body.data.playlistId },
    {
      playlistId: body.data.playlistId,
      playlistLabel: body.data.playlistLabel,
      playlistUrl: url,
    },
    { upsert: true, new: true }
  );

  return jsonOk({
    active: {
      playlistId: body.data.playlistId,
      playlistLabel: body.data.playlistLabel,
      setAt: new Date().toISOString(),
    },
  });
}
