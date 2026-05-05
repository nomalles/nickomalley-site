'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Small mono label above the message (e.g. the page name). */
  label: string;
  message: string;
};

/**
 * Tiny "coming soon" popup. Reuses the InfoModal's backdrop / portal
 * machinery (same animation, ESC + backdrop close, body-scroll lock,
 * portal at document.body so pointer-events: none on Header doesn't
 * eat clicks) but with a narrower panel and a label-plus-message
 * layout instead of the photo + bio block.
 */
export default function ComingSoonModal({ open, onClose, label, message }: Props) {
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="info-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="info-modal coming-soon-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="info-modal-close mono hover-accent"
        >
          ×
        </button>

        <div className="mono text-[10px] tracking-[0.18em] text-accent uppercase mb-3">
          {label}
        </div>
        <p className="text-fg-90" style={{ fontSize: 16, lineHeight: 1.55 }}>
          {message}
        </p>
      </div>
    </div>,
    document.body
  );
}
