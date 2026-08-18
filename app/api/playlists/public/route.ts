import { connectDb } from "@/lib/db";
import { UserPlaylist } from "@/models/UserPlaylist";
import { toPublicPlaylist } from "@/lib/playlists";
import { jsonOk } from "@/lib/api";

export async function GET() {
  await connectDb();
  const playlists = await UserPlaylist.find({ visibility: "public" })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("ownerId", "name")
    .lean();

  return jsonOk({ playlists: playlists.map(toPublicPlaylist) });
}
