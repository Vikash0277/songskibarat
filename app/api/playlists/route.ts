import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";
import { toPublicPlaylist } from "@/lib/playlists";
import { jsonError, jsonOk, requireUser } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth) return jsonError("Not authenticated.", 401);

  await connectDb();
  const playlists = await UserPlaylist.find({ ownerId: auth.userId })
    .sort({ createdAt: -1 })
    .lean();

  return jsonOk({ playlists: playlists.map(toPublicPlaylist) });
}
