import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";
import { toPublicPlaylist } from "@/lib/playlists";
import {
  jsonError,
  jsonOk,
  requireUser,
  isValidObjectId,
} from "@/lib/api";

const schema = z.object({
  visibility: z.enum(["public", "private"]),
});

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/playlists/[id]/visibility">
) {
  const { id } = await ctx.params;
  const auth = await requireUser(req);
  if (!auth) return jsonError("Not authenticated.", 401);
  if (!isValidObjectId(id)) return jsonError("Invalid playlist id.", 400);

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return jsonError("Invalid visibility value.", 400);
  }

  await connectDb();
  const playlist = await UserPlaylist.findOneAndUpdate(
    { _id: id, ownerId: auth.userId },
    { $set: { visibility: body.data.visibility } },
    { new: true }
  );
  if (!playlist) return jsonError("Playlist not found.", 404);

  return jsonOk({ playlist: toPublicPlaylist(playlist.toObject()) });
}
