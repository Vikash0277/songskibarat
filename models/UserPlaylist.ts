import { Schema, model, models } from "mongoose";

const userPlaylistSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, enum: ["youtube"], default: "youtube" },
    playlistId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    thumbnail: { type: String, default: "" },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

userPlaylistSchema.index({ ownerId: 1, playlistId: 1 }, { unique: true });
userPlaylistSchema.index({ visibility: 1, createdAt: -1 });

export const UserPlaylist =
  models.UserPlaylist ?? model("UserPlaylist", userPlaylistSchema);
