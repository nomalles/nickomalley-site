import type { Media } from '@/lib/projects';

type YouTubeMedia = Extract<Media, { kind: 'youtube' }>;

/**
 * Build the YouTube embed URL with the right player params for the
 * requested playback mode.
 *   - 'autoplay-muted-loop' (default): autoplays muted, loops via the
 *     YouTube playlist trick (you set `playlist` to the video's own ID
 *     — that's what makes a single video loop), no controls, minimal
 *     YT branding.
 *   - 'user': normal poster + play button, regular controls; visitor
 *     decides when to play and whether to mute.
 */
export function youtubeEmbedSrc(
  videoId: string,
  playback: YouTubeMedia['playback'] = 'autoplay-muted-loop'
): string {
  const params = new URLSearchParams();
  params.set('rel', '0');
  params.set('modestbranding', '1');
  if (playback === 'autoplay-muted-loop') {
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('loop', '1');
    params.set('playlist', videoId);
    params.set('controls', '0');
    params.set('playsinline', '1');
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Stretches to fill its parent. Caller wraps in an aspect-ratio'd box.
 * Matches the iframe attributes that YouTube's "share → embed" UI emits,
 * with `loading="lazy"` so off-screen embeds don't pull YT player JS
 * until they scroll into view.
 */
export default function YouTubeEmbed({ media }: { media: YouTubeMedia }) {
  return (
    <iframe
      src={youtubeEmbedSrc(media.videoId, media.playback)}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      loading="lazy"
      style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
    />
  );
}
