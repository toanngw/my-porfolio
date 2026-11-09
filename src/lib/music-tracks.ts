/** User-supplied recordings. Only embedded ID3 metadata is treated as verified. */
export const musicTracks = [
  { id: "andriih", src: "/audio/andriih.mp3", title: "Andriih", credit: "" },
  { id: "kyoto", src: "/audio/Nebulite-Kyoto.mp3", title: "Kyoto", credit: "Nebulite" },
] as const;

export const formatPlaybackTime = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};
