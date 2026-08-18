import { Schema, model, models } from "mongoose";

const activePlaylistSchema = new Schema(
  {
    playlistId: { type: String, required: true, trim: true },
    playlistLabel: { type: String, required: true, trim: true },
    setBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const ActivePlaylist =
  models.ActivePlaylist ??
  model("ActivePlaylist", activePlaylistSchema);
