'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Phase, Media } from '@/lib/projects';
import YouTubeEmbed from './YouTubeEmbed';
import Framing from './Framing';

// Mux Player is heavy; only mount it on the client so the page itself can
// stay static. Used for video media in phase grids (e.g. tool walkthroughs).
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false });

// Shared sessionStorage key — once any project's gate is unlocked, the
// gating hash is stored here. Other projects that share the same hash
// auto-unlock; projects with different hashes stay locked.
const UNLOCK_KEY = 'phase-gate-hash';

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type Props = {
  phases: Phase[];
  /** Omit to leave phases ungated. */
  passwordHash?: string;
};

/**
 * Renders the chronological phase blocks for a case study.
 * If `passwordHash` is supplied, the entire stack is blurred at 24px and
 * pointer-disabled until the user submits the matching password. The
 * unlock state is persisted to sessionStorage keyed by slug, so coming
 * back to the page within the same tab/session keeps it open.
 *
 * Comparison is client-side via SHA-256 of the input. This is deliberate
 * "polite gating" for in-progress / NDA-tinted work — anyone reading the
 * bundle could still find the hash and brute-force a weak password.
 * Don't use this for anything that would actually need to stay private.
 */
export default function CaseStudyPhases({ phases, passwordHash }: Props) {
  const gated = !!passwordHash;
  const [unlocked, setUnlocked] = useState(!gated);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gated) return;
    if (typeof window === 'undefined') return;
    // Cross-page unlock: if a previous page stored a hash that matches this
    // project's hash, treat it as already unlocked. Different passwords on
    // different projects still need their own unlocks.
    if (sessionStorage.getItem(UNLOCK_KEY) === passwordHash) {
      setUnlocked(true);
    }
  }, [gated, passwordHash]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordHash || submitting) return;
    setSubmitting(true);
    const hashed = await sha256(password);
    if (hashed === passwordHash) {
      setUnlocked(true);
      sessionStorage.setItem(UNLOCK_KEY, passwordHash);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
    setSubmitting(false);
  }

  // Phases are considered "structured" when at least one carries written
  // copy (a string label or framing — explicit `null` labels don't count).
  // Drives:
  //   - whether the "The Work" intro label renders
  //   - whether unlabeled phases auto-fall-back to "Phase 01" / "Phase 02"
  // On flat-content projects (just visual blocks, no copy) both stay off.
  const phasesHaveStructure = phases.some((p) => !!p.label || !!p.framing);

  return (
    <section className="px-8 md:px-12 pt-24">
      {phasesHaveStructure && (
        <div className="mono text-[10px] tracking-[0.18em] text-fg-30 uppercase mb-12">
          The Work
        </div>
      )}

      {gated && !unlocked && (
        <form onSubmit={submit} className="mb-12 max-w-md">
          <label
            htmlFor="phase-passcode"
            className="mono text-[10px] text-fg-30 uppercase tracking-[0.18em] block mb-3"
          >
            Enter passcode to view phases
          </label>
          <div className="flex gap-3">
            <input
              id="phase-passcode"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="passcode"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="mono flex-1 bg-transparent px-3 py-2"
              style={{
                border: '1px solid',
                borderColor: error ? '#ff6b6b' : 'rgba(244,242,238,0.18)',
                color: '#F4F2EE',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 200ms cubic-bezier(0.65, 0, 0.35, 1)',
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="mono px-5 py-2 hover-accent text-fg-70"
              style={{
                fontSize: 13,
                border: '1px solid rgba(244,242,238,0.18)',
                background: 'transparent',
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? '…' : 'unlock'}
            </button>
          </div>
          {error && (
            <div className="mono text-[11px] mt-2" style={{ color: '#ff6b6b' }}>
              incorrect passcode
            </div>
          )}
        </form>
      )}

      <div
        className={`phase-gate ${unlocked ? 'unlocked' : ''}`}
        aria-hidden={!unlocked}
      >
        {phases.map((phase, i) => (
          <PhaseBlock
            key={i}
            index={i + 1}
            phase={phase}
            autoLabel={phasesHaveStructure}
          />
        ))}
      </div>
    </section>
  );
}

function PhaseBlock({
  index,
  phase,
  autoLabel,
}: {
  index: number;
  phase: Phase;
  /** When true, unlabeled phases get the auto "Phase NN" fallback heading. */
  autoLabel: boolean;
}) {
  // A single-video phase (Mux or YouTube) reads better as a full-width
  // hero than as one skinny column inside a 3-col masonry. Detect that
  // case explicitly and bypass the grid; mixed video/image phases still
  // flow through the grid.
  const onlyItem = phase.images.length === 1 ? phase.images[0]! : null;
  const isSingleVideo =
    onlyItem !== null && (onlyItem.kind === 'mux' || onlyItem.kind === 'youtube');

  // Auto "Phase NN" fallback only kicks in when the parent says this
  // project has structured phases. Flat-visual projects stay anonymous.
  // null = explicitly hide the heading; undefined = fall back to autoLabel.
  let labelText: string | null;
  if (phase.label === null) labelText = null;
  else if (phase.label) labelText = phase.label;
  else if (autoLabel) labelText = `Phase ${String(index).padStart(2, '0')}`;
  else labelText = null;

  const showHeader = labelText !== null || phase.framing !== undefined;

  // Auto-generate a scroll anchor from a string label.
  const phaseId = phase.label
    ? `phase-${phase.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
    : undefined;

  // Inline CSS variables for the masonry column counts, plus scroll
  // margin so anchor jumps land below the fixed header.
  const wrapperStyle: React.CSSProperties = {
    ...(phaseId ? { scrollMarginTop: 90 } : {}),
    ...(phase.columns ? ({ ['--phase-cols' as never]: phase.columns } as object) : {}),
    ...(phase.mobileColumns
      ? ({ ['--phase-cols-mobile' as never]: phase.mobileColumns } as object)
      : {}),
  };

  return (
    <div id={phaseId} className="mb-24" style={wrapperStyle}>
      {showHeader && (
        <>
          {labelText && (
            <div className="mono text-[10px] text-accent tracking-[0.18em] uppercase mb-2">
              {labelText}
            </div>
          )}
          {phase.framing && (
            <p
              className="text-fg-90 mb-8"
              style={{ fontSize: 18, lineHeight: 1.5, maxWidth: '40rem' }}
            >
              <Framing framing={phase.framing} />
            </p>
          )}
        </>
      )}
      {isSingleVideo && onlyItem ? (
        onlyItem.kind === 'mux' ? (
          <SingleVideo media={onlyItem} />
        ) : onlyItem.kind === 'youtube' ? (
          <div
            className="overflow-hidden w-full"
            style={{ aspectRatio: onlyItem.aspect ?? '16/9' }}
          >
            <YouTubeEmbed media={onlyItem} />
          </div>
        ) : null
      ) : (
        <div className="phase-grid">
          {phase.images.map((img, i) => (
            <ImageCell key={i} media={img} />
          ))}
        </div>
      )}

      {/* Trailing media — full-width blocks below the grid. Used for
          concluding hero stills, full-bleed videos, etc. */}
      {phase.trailing?.map((media, i) => (
        <div key={i} className="mt-4">
          <FullWidthMedia media={media} />
        </div>
      ))}
    </div>
  );
}

/**
 * Resolve playback options for a Mux media item. Default is silent
 * looping autoplay (hero clips, ambient grid tiles); 'user-with-sound'
 * disables autoplay/loop/mute so the visitor presses play and gets
 * audio on. nohotkeys stays on in both modes for consistency.
 */
function muxPlaybackProps(media: Extract<Media, { kind: 'mux' }>) {
  if (media.playback === 'user-with-sound') {
    return {
      autoPlay: false as const,
      muted: false,
      loop: false,
    };
  }
  return {
    autoPlay: 'muted' as const,
    muted: true,
    loop: true,
  };
}

/**
 * Render any Media at full content width with its natural aspect ratio.
 * Used for `phase.trailing` items — each one renders as its own block
 * below the grid. Mux + YouTube already have full-width helpers above;
 * for images we use Next/Image with intrinsic width/height so the
 * aspect is preserved without cropping.
 */
function FullWidthMedia({ media }: { media: Media }) {
  if (media.kind === 'mux') return <SingleVideo media={media} />;
  if (media.kind === 'youtube') {
    return (
      <div
        className="overflow-hidden w-full"
        style={{ aspectRatio: media.aspect ?? '16/9' }}
      >
        <YouTubeEmbed media={media} />
      </div>
    );
  }
  if (media.kind === 'image' && media.width && media.height) {
    const isAnimated = /\.gif$/i.test(media.src);
    return (
      <div
        className="overflow-hidden shimmer"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
      >
        <Image
          src={media.src}
          alt={media.alt ?? ''}
          width={media.width}
          height={media.height}
          sizes="100vw"
          unoptimized={isAnimated}
          className="w-full h-auto block"
        />
      </div>
    );
  }
  return null;
}

function SingleVideo({ media }: { media: Extract<Media, { kind: 'mux' }> }) {
  return (
    <div
      className="overflow-hidden w-full"
      style={{ aspectRatio: media.aspect ?? '16/9' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MuxPlayer
        playbackId={media.playbackId}
        streamType="on-demand"
        {...muxPlaybackProps(media)}
        playsInline
        nohotkeys
        metadata={{ video_title: media.alt ?? '' }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

// `sizes` tells the browser which slot the image occupies so it can pick the
// right size from the responsive srcset Next/Image generates. Matches the
// grid: 100vw on mobile (1 col), ~33vw on md+ (3 cols).
const CELL_SIZES = '(max-width: 768px) 100vw, 33vw';

function ImageCell({ media }: { media: Media }) {
  if (media.kind === 'image') {
    // Animated GIFs need to bypass the optimizer or Next will strip the
    // animation. Detect by extension and pass-through with unoptimized.
    const isAnimated = /\.gif$/i.test(media.src);
    // Two modes:
    //   - aspect set → cell is locked to that ratio, image fills via cover
    //     using <Image fill>. Useful when uniform tiles are wanted.
    //   - aspect omitted → cell sizes to image's natural height; no crop.
    //     Requires width/height so Next can reserve layout space and pick
    //     responsive sizes. Falls back to a plain placeholder if dims are
    //     missing.
    if (media.aspect) {
      return (
        <div
          className="overflow-hidden relative shimmer"
          style={{ aspectRatio: media.aspect }}
        >
          <Image
            src={media.src}
            alt={media.alt ?? ''}
            fill
            sizes={CELL_SIZES}
            unoptimized={isAnimated}
            className="object-cover"
          />
        </div>
      );
    }
    if (media.width && media.height) {
      return (
        <div
          className="overflow-hidden shimmer"
          // Reserve layout space at the source aspect ratio while the
          // optimized image is being requested. Without this the cell
          // would be 0px tall until <Image> paints, which would defeat
          // the shimmer effect entirely.
          style={{ aspectRatio: `${media.width} / ${media.height}` }}
        >
          <Image
            src={media.src}
            alt={media.alt ?? ''}
            width={media.width}
            height={media.height}
            sizes={CELL_SIZES}
            unoptimized={isAnimated}
            className="w-full h-auto block"
          />
        </div>
      );
    }
    // Final fallback — no aspect, no dims. Render an empty cell rather than
    // a broken image. Should never happen if data is populated correctly.
    return (
      <div
        className="overflow-hidden shimmer"
        style={{ aspectRatio: '4/3' }}
      />
    );
  }
  if (media.kind === 'mux') {
    return (
      <div
        className="overflow-hidden shimmer"
        style={{ aspectRatio: media.aspect ?? '16/9' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MuxPlayer
          playbackId={media.playbackId}
          streamType="on-demand"
          {...muxPlaybackProps(media)}
          playsInline
          nohotkeys
          metadata={{ video_title: media.alt ?? '' }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    );
  }

  if (media.kind === 'youtube') {
    return (
      <div
        className="overflow-hidden shimmer"
        style={{ aspectRatio: media.aspect ?? '16/9' }}
      >
        <YouTubeEmbed media={media} />
      </div>
    );
  }

  // 'scene' kind shouldn't appear inside a phase grid (it's hero-only),
  // but the discriminated union covers it. Render nothing so the type
  // check stays exhaustive.
  return null;
}
