'use client';

import dynamic from 'next/dynamic';
import type { Media } from '@/lib/projects';

// Mux Player is a heavy web component and needs the DOM to register itself —
// load it client-side only so the case study page can still be statically
// rendered for SEO.
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false });

type Props = {
  hero: Media;
  title: string;
};

/**
 * 21:9 ultrawide hero. Autoplays muted on loop, default Mux controls,
 * right-click context menu suppressed so the browser's "Save Video As"
 * prompt doesn't appear. Determined viewers can still grab the HLS
 * stream from the network tab — this is friction, not protection.
 */
export default function CaseStudyHero({ hero, title }: Props) {
  if (hero.kind === 'image') {
    return (
      <div
        className="overflow-hidden w-full"
        style={{ aspectRatio: hero.aspect ?? '21/9' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.src}
          alt={hero.alt ?? title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden w-full"
      style={{ aspectRatio: hero.aspect ?? '21/9' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MuxPlayer
        playbackId={hero.playbackId}
        streamType="on-demand"
        autoPlay="muted"
        muted
        loop
        playsInline
        nohotkeys
        metadata={{ video_title: title }}
        // --media-object-fit is Mux Player's CSS hook for the inner <video>
        // element's object-fit. "cover" scales the video up to fill the
        // 21:9 frame with no pillarbox bars; the tradeoff is ~15% top/bottom
        // crop because the source is 16:9. Cast through CSSProperties so
        // TS allows the custom property.
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          '--media-object-fit': 'cover',
        } as React.CSSProperties}
      />
    </div>
  );
}
