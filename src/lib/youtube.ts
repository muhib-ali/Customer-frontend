/**
 * Get YouTube embed URL from various YouTube URL formats.
 * Returns null if the URL is not a YouTube link.
 */
export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  const watchMatch = s.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = s.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const embedMatch = s.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  return null;
}

export function isYoutubeUrl(url: string | null | undefined): boolean {
  return getYoutubeEmbedUrl(url) !== null;
}

/**
 * Get embed URL for any supported video platform (YouTube, Vimeo, Dailymotion, etc.).
 * Returns null for direct video file URLs (use <video> tag for those).
 */
export function getVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  // YouTube
  const yt = getYoutubeEmbedUrl(s);
  if (yt) return yt;

  // Vimeo: vimeo.com/123456, vimeo.com/channels/xxx/123, player.vimeo.com/video/123
  const vimeoMatch = s.match(/(?:vimeo\.com\/)(?:video\/)?(?:channels\/[^/]+\/)?(?:[\w-]+\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Dailymotion: dailymotion.com/video/xxxxx, dai.ly/xxxxx
  const dmMatch = s.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;

  // Facebook: facebook.com/watch?v= or fb.watch/ or fb.com/.../videos/...
  const fbMatch = s.match(/(?:facebook\.com\/watch\/\?v=|fb\.watch\/|facebook\.com\/[^/]+\/videos\/)(\d+)/);
  if (fbMatch) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(s)}`;

  // Purani implementation: sab baaki URLs (direct video files, backend URLs, etc.) ke liye null
  // → component <video src={url}> use karega, jaise pehle hota tha
  return null;
}

/**
 * Get thumbnail image URL for a video URL (YouTube, Vimeo, Dailymotion).
 * Use in thumbnail strip below main media. Returns null if not a supported URL.
 */
export function getVideoThumbnailUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  // YouTube: official thumbnail (hqdefault = 480x360, maxresdefault = 1280x720 if exists)
  const ytWatch = s.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (ytWatch) return `https://img.youtube.com/vi/${ytWatch[1]}/hqdefault.jpg`;
  const ytShort = s.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytShort) return `https://img.youtube.com/vi/${ytShort[1]}/hqdefault.jpg`;
  const ytEmbed = s.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytEmbed) return `https://img.youtube.com/vi/${ytEmbed[1]}/hqdefault.jpg`;

  // Vimeo: thumbnail requires oEmbed fetch; no official static URL. Fallback to first image in UI.
  // (Optional: could add server-side oEmbed call later.)

  // Dailymotion: official thumbnail
  const dmMatch = s.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  if (dmMatch) return `https://www.dailymotion.com/thumbnail/video/${dmMatch[1]}`;

  return null;
}
