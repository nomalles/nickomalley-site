'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import InfoModal from './InfoModal';

type HeaderProps = {
  fps: number;
  tris: number;
};

/**
 * Fixed top header — locked above scroll. Carries:
 *   Left:  role line, location, avatar art
 *   Right: live time + render stats + contact links + version footer info
 *
 * The big "NICK O'MALLEY" wordmark is rendered separately as a background
 * element (BackgroundWordmark) so it can sit BEHIND the 3D scene.
 */
export default function Header({ fps, tris }: HeaderProps) {
  const [time, setTime] = useState('—:—');
  const [infoOpen, setInfoOpen] = useState(false);

  // Live Salzburg time (Europe/Vienna covers all of Austria)
  useEffect(() => {
    const update = () => {
      try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Vienna',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setTime(fmt.format(new Date()));
      } catch {
        setTime('—:—');
      }
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '24px 32px',
        pointerEvents: 'none', // canvas drag passes through; nested elements opt back in
      }}
    >
      <div className="flex justify-between items-start">
        {/* LEFT — role, location, avatar */}
        <div className="leading-none">
          <div className="text-fg-70" style={{ fontSize: 13, letterSpacing: '0.01em' }}>
            Art Director · Motion Designer · 3D
          </div>
          <div className="text-fg-45" style={{ fontSize: 11, marginTop: 4 }}>
            Based in Salzburg
          </div>
          <div style={{ marginTop: 14 }}>
            <Image
              src="/avatar/avatar.png"
              alt=""
              width={64}
              height={64}
              priority
              style={{ display: 'block', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* RIGHT — info column. Pointer-events default to none (inherited
            from the outer wrapper) so drag-to-orbit on the canvas isn't
            blocked by the dead text area; only the nav block opts back in. */}
        <div
          className="mono text-right"
          style={{ fontSize: 10, letterSpacing: '0.04em', lineHeight: 1.7 }}
        >
          <div className="flex items-center gap-2 justify-end text-fg-70">
            <span
              className="w-[6px] h-[6px] rounded-full glow-dot inline-block"
              style={{ backgroundColor: '#00FF80' }}
            />
            <span>SZG {time} CET</span>
          </div>

          <div className="text-accent-85" style={{ marginTop: 6 }}>
            {fps} fps · {tris.toLocaleString()} tris
          </div>
          <div className="text-accent-35">webgl · photogrammetry · 1k texture</div>

          <div style={{ height: 24 }} />

          {/* Nav — larger mono links. pointerEvents: auto so they're
              clickable through the otherwise pass-through header. */}
          <div
            style={{
              fontSize: 18,
              lineHeight: 1.4,
              letterSpacing: '0.02em',
              pointerEvents: 'auto',
            }}
          >
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('work')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-fg-55 hover-accent block"
            >
              Work
            </a>
            <a
              href="https://www.linkedin.com/in/nick-o-malley/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-55 hover-accent block"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/nomallez/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-55 hover-accent block"
            >
              Instagram
            </a>
            <a href="/scraps" className="text-fg-55 hover-accent block">Scraps</a>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="text-fg-55 hover-accent block ml-auto"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              Info
            </button>
          </div>

          <div style={{ height: 24 }} />

          <div className="text-fg-30">scroll to see work ↓</div>
        </div>
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
