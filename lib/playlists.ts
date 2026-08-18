export interface PlaylistDoc {
  _id?: unknown;
  id?: string;
  platform?: string;
  playlistId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  visibility: string;
  ownerId?: { name?: string } | null;
  createdAt?: Date | string;
}

export interface PublicPlaylist {
  id: string;
  platform: string;
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  visibility: string;
  ownerName: string | null;
  createdAt: Date | string | undefined;
}

export function toPublicPlaylist(doc: PlaylistDoc): PublicPlaylist {
  const owner =
    doc.ownerId && typeof doc.ownerId === "object" && "name" in doc.ownerId
      ? doc.ownerId
      : null;
  return {
    id: (doc._id?.toString() ?? doc.id) as string,
    platform: doc.platform ?? "youtube",
    playlistId: doc.playlistId,
    title: doc.title,
    description: doc.description ?? "",
    thumbnail: doc.thumbnail ?? "",
    visibility: doc.visibility,
    ownerName: owner?.name ?? null,
    createdAt: doc.createdAt,
  };
}
