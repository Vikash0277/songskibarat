import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";
import {
  jsonError,
  jsonOk,
  requireUser,
  isValidObjectId,
} from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/playlists/[id]">
) {
  const { id } = await ctx.params;
  const auth = await requireUser(req);
  if (!auth) return jsonError("Not authenticated.", 401);
  if (!isValidObjectId(id)) return jsonError("Invalid playlist id.", 400);

  await connectDb();
  const deleted = await UserPlaylist.findOneAndDelete({
    _id: id,
    ownerId: auth.userId,
  });
  if (!deleted) return jsonError("Playlist not found.", 404);

  return jsonOk({ deleted: true });
}
