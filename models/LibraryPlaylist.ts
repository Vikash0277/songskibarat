import { Schema, model, models } from "mongoose";

const libraryPlaylistSchema = new Schema(
  {
    playlistId: { type: String, required: true, trim: true, unique: true },
    playlistLabel: { type: String, required: true, trim: true },
    playlistUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const LibraryPlaylist =
  models.LibraryPlaylist ??
  model("LibraryPlaylist", libraryPlaylistSchema);
