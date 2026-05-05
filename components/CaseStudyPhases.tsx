'use client';

import { Fragment, useEffect, useState } from 'react';
import type { Phase, Media } from '@/lib/projects';

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type Props = {
  slug: string;
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
export default function CaseStudyPhases({ slug, phases, passwordHash }: Props) {
  const gated = !!passwordHash;
  const [unlocked, setUnlocked] = useState(!gated);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gated) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(`unlock-${slug}`) === '1') {
      setUnlocked(true);
    }
  }, [gated, slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordHash || submitting) return;
    setSubmitting(true);
    const hashed = await sha256(password);
    if (hashed === passwordHash) {
      setUnlocked(true);
      sessionStorage.setItem(`unlock-${slug}`, '1');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
    setSubmitting(false);
  }

  return (
    <section className="px-8 md:px-12 pt-24">
      <div className="mono text-[10px] tracking-[0.18em] text-fg-30 uppercase mb-12">
        The Work
      </div>

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
          <PhaseBlock key={i} index={i + 1} phase={phase} />
        ))}
      </div>
    </section>
  );
}

function PhaseBlock({ index, phase }: { index: number; phase: Phase }) {
  return (
    <div className="mb-24">
      <div className="mono text-[10px] text-accent tracking-[0.18em] uppercase mb-2">
        Phase {String(index).padStart(2, '0')}
      </div>
      <p
        className="text-fg-90 mb-8"
        style={{ fontSize: 18, lineHeight: 1.5, maxWidth: '40rem' }}
      >
        <Framing framing={phase.framing} />
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phase.images.map((img, i) => (
          <ImageCell key={i} media={img} />
        ))}
      </div>
    </div>
  );
}

/**
 * Stitch a Phase['framing'] into a paragraph. Plain string passes through;
 * a segment array is mapped, with link segments rendered as new-tab anchors
 * styled to read inline (subtle underline, hover-accent for color).
 */
function Framing({ framing }: { framing: Phase['framing'] }) {
  if (typeof framing === 'string') return <>{framing}</>;
  return (
    <>
      {framing.map((seg, i) => (
        <Fragment key={i}>
          {typeof seg === 'string' ? (
            seg
          ) : (
            <a
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-accent"
              style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              {seg.text}
            </a>
          )}
        </Fragment>
      ))}
    </>
  );
}

function ImageCell({ media }: { media: Media }) {
  if (media.kind === 'image') {
    return (
      <div
        className="overflow-hidden"
        style={{
          aspectRatio: media.aspect ?? '4/3',
          background: 'rgba(244,242,238,0.04)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.src}
          alt={media.alt ?? ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  // Mux video cell — not used for placeholders, but the type allows it.
  return (
    <div
      className="overflow-hidden"
      style={{
        aspectRatio: media.aspect ?? '16/9',
        background: 'rgba(244,242,238,0.04)',
      }}
    />
  );
}
