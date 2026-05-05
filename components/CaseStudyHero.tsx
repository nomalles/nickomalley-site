'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Media } from '@/lib/projects';

// Mux Player is a heavy web component and needs the DOM to register itself —
// load it client-side only so the case study page can still be statically
// rendered for SEO.
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false });

// Scene3DIcons pulls in three.js + GLB + EXR loaders — keep it out of the
// initial bundle and out of SSR since it needs WebGL.
const Scene3DIcons = dynamic(() => import('./Scene3DIcons'), { ssr: false });

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
        className="overflow-hidden w-full relative"
        style={{ aspectRatio: hero.aspect ?? '21/9' }}
      >
        <Image
          src={hero.src}
          alt={hero.alt ?? title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  if (hero.kind === 'scene') {
    return (
      // case-study-hero-scene carries a responsive aspect-ratio: 21:9 on
      // desktop, taller on mobile so the model has more room to breathe
      // on smaller screens. Inline aspectRatio as fallback.
      <div
        className="overflow-hidden w-full relative case-study-hero-scene"
        style={{ aspectRatio: hero.aspect ?? '21/9' }}
      >
        <Scene3DIcons scanPath={hero.scanPath} />
        {/* Touch-only orbit hint — coral, ~3s total fade in/hold/out.
            Centered over the model; pointer-events: none so it doesn't
            block drag-to-orbit underneath. */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mono tracking-[0.18em] uppercase pointer-events-none touch-hint-3s whitespace-nowrap text-center"
          style={{ fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 500 }}
        >
          ↻ two-finger
          <br />
          orbit
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden w-full"
      // --media-object-fit is Mux Player's CSS hook for its inner <video>
      // element's object-fit. We set it on the wrapper rather than on
      // MuxPlayer's `style` prop because Mux's `MuxCSSProperties` type is
      // stricter than React's `CSSProperties` and a cast doesn't satisfy
      // its custom-property index signature. CSS custom properties cascade
      // through shadow DOM, so declaring it on the parent reaches the
      // player just the same. "cover" scales the video up to fill the 21:9
      // frame; the tradeoff is ~15% top/bottom crop on a 16:9 source.
      style={{
        aspectRatio: hero.aspect ?? '21/9',
        '--media-object-fit': 'cover',
      } as React.CSSProperties}
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
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
