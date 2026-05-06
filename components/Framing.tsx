import { Fragment } from 'react';
import type { FramingSegment } from '@/lib/projects';

type Props = {
  framing: string | FramingSegment[] | undefined;
};

/**
 * Renders a string OR a segment array (mixed text and `{text, href}`
 * link entries) as inline content.
 *
 * Link behavior depends on the href:
 *   - `#anchor`  → in-page anchor link, normal blue-ish underline,
 *                  uses native browser scroll (combined with the global
 *                  `scroll-behavior: smooth` rule it glides to target).
 *   - anything else → external link, opens in a new tab with
 *                     `rel="noopener noreferrer"`.
 *
 * No JS needed — both modes work as plain `<a>` tags. Component stays
 * non-client-component so it can be used inside server-rendered pages.
 */
export default function Framing({ framing }: Props) {
  if (!framing) return null;
  if (typeof framing === 'string') return <>{framing}</>;
  return (
    <>
      {framing.map((seg, i) => {
        if (typeof seg === 'string') return <Fragment key={i}>{seg}</Fragment>;
        const isInternal = seg.href.startsWith('#');
        return (
          <a
            key={i}
            href={seg.href}
            {...(isInternal
              ? {}
              : { target: '_blank', rel: 'noopener noreferrer' })}
            className="hover-accent"
            style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            {seg.text}
          </a>
        );
      })}
    </>
  );
}
