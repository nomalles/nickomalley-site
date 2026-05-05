'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * About-Nick popup. Triggered from the header's "Info" button.
 *   - Backdrop click closes
 *   - X button (top-right of the panel) closes
 *   - ESC key closes
 *   - While open, body scroll is locked so the page underneath doesn't
 *     pan around behind the panel
 *   - Fade-in handled in globals.css; nothing is mounted to the DOM when
 *     `open` is false so there's no extra cost on the rest of the site
 */
export default function InfoModal({ open, onClose }: Props) {
  // Track mount state so the portal target (document.body) is only
  // referenced on the client. Avoids issues during SSR where document
  // doesn't exist.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Lock body scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Render into document.body via a portal so the modal escapes the
  // Header's DOM tree. The Header's wrapper has pointer-events: none
  // (so canvas drag passes through it), and pointer-events inherits in
  // CSS — without the portal, the backdrop and X button would inherit
  // none and silently swallow clicks.
  return createPortal(
    <div
      className="info-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-heading"
    >
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="info-modal-close mono hover-accent"
        >
          ×
        </button>

        <div className="info-modal-grid">
          <div className="info-modal-image shimmer">
            <Image
              src="/projects/info-pic.png"
              alt="Nick O'Malley"
              width={2315}
              height={2633}
              sizes="(max-width: 768px) 100vw, 320px"
              className="w-full h-auto block"
              priority
            />
          </div>

          <div className="info-modal-body">
            <h2
              id="info-modal-heading"
              className="mono text-[10px] tracking-[0.18em] text-accent uppercase mb-4"
            >
              Info
            </h2>
            <p className="text-fg-90 mb-4" style={{ fontSize: 16, lineHeight: 1.55 }}>
              I&apos;m Nick, an Art Director and 3D Motion Designer from Texas, now
              based in Salzburg. I spent three years at Apple as a 3D Content
              Design Lead on the App Store, helped launch Apple Vision Pro, and
              have shipped work for Red Bull, PlayStation, and Twitch along the
              way. I like getting experimental with 2D/3D combinations and
              building systems that scale.
            </p>
            <p className="text-fg-70 mb-4" style={{ fontSize: 14, lineHeight: 1.5 }}>
              Currently open to senior roles and select freelance across the EU
              and UK.
            </p>
            <p className="mono text-fg-55" style={{ fontSize: 13 }}>
              Say hey{' '}
              <a
                href="mailto:nomalley70@gmail.com"
                className="hover-accent"
                style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                nomalley70@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
