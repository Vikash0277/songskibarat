import { describe, it, expect } from "vitest";
import { extractPlaylistId } from "@/lib/youtube";

describe("extractPlaylistId", () => {
  it("extracts from a standard playlist URL", () => {
    expect(
      extractPlaylistId("https://www.youtube.com/playlist?list=PLTJ1PnzCWyFw")
    ).toBe("PLTJ1PnzCWyFw");
  });

  it("extracts from a music.youtube.com URL with extra params", () => {
    expect(
      extractPlaylistId(
        "https://music.youtube.com/playlist?list=RDCLAK5uy_ltBUnE76-ol1ufdgUWN4T7WtFljvu8gYM&playnext=1&si=O43Nd4h3rtESqCVe"
      )
    ).toBe("RDCLAK5uy_ltBUnE76-ol1ufdgUWN4T7WtFljvu8gYM");
  });

  it("accepts a bare playlist id", () => {
    expect(extractPlaylistId("PLTJ1PnzCWyFw")).toBe("PLTJ1PnzCWyFw");
  });

  it("rejects a plain video URL without a list param", () => {
    expect(extractPlaylistId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(extractPlaylistId("https://youtu.be/dQw4w9WgXcQ")).toBeNull();
  });

  it("rejects non-YouTube domains even with a list param", () => {
    expect(
      extractPlaylistId("https://evil.com/?list=PLTJ1PnzCWyFw")
    ).toBeNull();
    expect(
      extractPlaylistId("https://youtube.com.evil.com/playlist?list=PLTJ1PnzCWyFw")
    ).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(extractPlaylistId("not a url")).toBeNull();
    expect(extractPlaylistId("")).toBeNull();
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=short")).toBeNull();
  });
});
