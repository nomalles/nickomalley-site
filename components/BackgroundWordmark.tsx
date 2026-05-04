/**
 * Giant background wordmark — sits at z-index 0, behind the 3D scene (z-index 1)
 * and the content layer (z-index 2). Stacked across two lines, left-aligned,
 * anchored 24px above the viewport bottom so all letterforms (including the
 * descenders of L's in "MALLEY") stay fully visible.
 *
 * Styling lives in globals.css (.bg-wordmark / .bg-wordmark-text) so that a
 * mobile media query can shrink the type and tighten letter-spacing — the
 * desktop clamp would otherwise hold O'MALLEY at 120px on phones where the
 * line then can't fit and gets cut after the first L.
 *
 * The trash bin in the 3D scene composes naturally into the gap between
 * "NICK" and "O'MALLEY".
 */
export default function BackgroundWordmark() {
  return (
    <div aria-hidden="true" className="bg-wordmark">
      <div className="bg-wordmark-text">
        <div>NICK</div>
        <div>O&apos;MALLEY</div>
      </div>
    </div>
  );
}
