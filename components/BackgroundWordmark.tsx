/**
 * Giant background wordmark — sits at z-index 0, behind the 3D scene (z-index 1)
 * and the content layer (z-index 2). Stacked across two lines, left-aligned,
 * anchored 24px above the viewport bottom so all letterforms (including the
 * descenders of L's in "MALLEY") stay fully visible.
 *
 * The trash bin in the 3D scene composes naturally into the gap between
 * "NICK" and "O'MALLEY".
 */
export default function BackgroundWordmark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 32,
        right: 32,
        bottom: 24,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(120px, 22vw, 440px)',
          fontWeight: 700,
          letterSpacing: '-0.045em',
          color: '#F4F2EE',
          opacity: 0.85,
          lineHeight: 0.85,
          textAlign: 'left',
          userSelect: 'none',
        }}
      >
        <div>NICK</div>
        <div>O&apos;MALLEY</div>
      </div>
    </div>
  );
}
