'use client';

import { useCallback, useState } from 'react';
import Scene3D from './Scene3D';
import Header from './Header';
import BackgroundWordmark from './BackgroundWordmark';
import CustomCursor from './CustomCursor';
import ProjectList from './ProjectList';

/**
 * Portfolio composition — this is the homepage.
 *
 * Z-index stack (bottom to top):
 *   0  BackgroundWordmark — giant "NICK O'MALLEY" type
 *   1  Scene3D            — fixed full-viewport 3D canvas
 *   2  Scrollable content — hero spacer, project list, future sections
 *  50  Header             — fixed top bar (role, time, links, stats)
 *  95  Hover thumbnail    — follows cursor on project rows
 * 100  Custom cursor      — green dot
 *
 * The 3D scene is fixed-position and covers the whole viewport; content
 * scrolls UP and OVER it. The wordmark stays anchored at the bottom and
 * sits behind the 3D, giving the trash bin a typographic foundation.
 */
const SCANS = ['/scans/trash_001.glb', '/scans/rocks.glb'];

export default function Portfolio() {
  const [stats, setStats] = useState({ fps: 0, tris: 0 });
  const [coords, setCoords] = useState({ x: '0.000', y: '0.000', z: '0.000' });
  const [scanActive, setScanActive] = useState(false);
  const [scanPath] = useState(() => SCANS[Math.floor(Math.random() * SCANS.length)]);

  // Memoize callbacks so Scene3D's effect doesn't re-fire on every render
  const onStats = useCallback((s: typeof stats) => setStats(s), []);
  const onCoords = useCallback((c: typeof coords) => setCoords(c), []);
  const onScanActive = useCallback((a: boolean) => setScanActive(a), []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <CustomCursor />

      <BackgroundWordmark />

      {/* Fixed full-viewport 3D scene */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none', // canvas opts back in
        }}
      >
        <Scene3D
          scanPath={scanPath}
          onStats={onStats}
          onCoords={onCoords}
          onScanActive={onScanActive}
        />

        {/* Bottom corner readouts pinned to viewport */}
        <div className="absolute bottom-5 left-8 mono text-[10px] tracking-wider pointer-events-none">
          <span className="text-accent-85">{scanPath.split('/').pop()}</span>
          <span className="text-accent-35 ml-2">/ photogrammetry / textured</span>
          {scanActive && <span className="text-scan ml-3 scan-indicator-active">[ scanning ]</span>}
        </div>

        <div className="absolute bottom-5 right-8 mono text-[10px] tracking-wider pointer-events-none text-accent-55">
          <span>x {coords.x}</span>
          <span className="ml-3">y {coords.y}</span>
          <span className="ml-3">z {coords.z}</span>
        </div>

        {/* Touch-only gesture hint — sits over the model, fades after ~5s */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mono tracking-[0.18em] uppercase pointer-events-none touch-hint whitespace-nowrap text-center"
          style={{ fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 500 }}
        >
          ↻ two-finger
          <br />
          orbit
        </div>
      </div>

      <Header fps={stats.fps} tris={stats.tris} />

      {/* Scrollable content layer.
          pointerEvents: 'none' on this wrapper is the key — without it, the
          wrapper's box at zIndex: 2 catches every pointer event over the
          hero region (including ones that pass through the section), which
          stops them from ever reaching the 3D canvas behind. Children that
          need to remain interactive opt back in below. Native scroll is
          unaffected since wheel/touch scroll bubble independently. */}
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        {/* Hero spacer — fills first viewport so 3D is alone, scroll cue at bottom. */}
        <section
          className="relative flex flex-col justify-end items-center pb-12"
          style={{ minHeight: 'calc(100vh - 90px)' }}
        >
          <div className="text-center">
            <div className="mono text-[17px] font-medium text-accent tracking-[0.16em] mb-3 uppercase">work</div>
            <div className="work-arrow text-3xl font-bold text-accent leading-none">↓</div>
          </div>
        </section>

        {/* Project list opts back in so rows can hover/tap */}
        <div style={{ pointerEvents: 'auto' }}>
          <ProjectList />
        </div>

        {/* Tail spacer — gives the user room to scroll past the list so the
            list itself can move up the viewport instead of being pinned to
            the bottom edge. Inherits pointerEvents: none from the wrapper
            so the canvas behind it stays drag-orbit-able. */}
        <div style={{ height: '60vh' }} aria-hidden="true" />
      </div>
    </div>
  );
}
