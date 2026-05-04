'use client';

import { useEffect, useRef, useState } from 'react';
import { projects, type Project } from '@/lib/projects';

/**
 * Project list — a calm typographic column at rest, with a dark blurred
 * backdrop appearing on hover for readability over the 3D scene below.
 *
 * On hover, a 240×160 thumbnail follows the cursor showing a placeholder
 * gradient with project metadata. Replace the gradient with real <img>
 * elements once thumbnails exist.
 */
export default function ProjectList() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const [inView, setInView] = useState(false);

  // Thumbnail follows the cursor — pure DOM transform, no React re-renders
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!thumbRef.current) return;
      const tw = 240, th = 160;
      let x = e.clientX + 28;
      let y = e.clientY - th - 16;
      if (x + tw > window.innerWidth - 16) x = e.clientX - tw - 28;
      if (y < 16) y = e.clientY + 28;
      thumbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  // Toggle the backdrop blur on the list only while the section is in view —
  // hero state stays clean, blur fades in as the work scrolls into the
  // viewport and out again as the user scrolls past it.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Following thumbnail */}
      <div
        ref={thumbRef}
        className={`hover-thumb ${hovered ? 'visible' : ''}`}
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${hovered.tint[0]} 0%, ${hovered.tint[1]} 100%)`
            : '#222',
        }}
      >
        <div className="hover-thumb-inner">
          <div
            className="mono"
            style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}
          >
            {hovered?.client.toUpperCase() ?? ''}
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.2 }}>
              {hovered?.title ?? ''}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.55)',
                marginTop: 4,
                letterSpacing: '0.05em',
              }}
            >
              {hovered ? `${hovered.year} · ${hovered.role}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* List. id="work" is the scroll target for the header's Work link;
          scroll-margin-top offsets so the section lands below the fixed header
          rather than getting tucked under it. The .project-list-section class
          carries the backdrop blur, which only kicks in once .is-visible is
          on (gated by IntersectionObserver above) so the hero never has the
          blur applied. */}
      <section
        ref={sectionRef}
        id="work"
        className={`project-list-section px-8 md:px-12 pb-16 pt-12${inView ? ' is-visible' : ''}`}
        style={{ scrollMarginTop: 90 }}
      >
        <div className="mono text-[10px] tracking-[0.18em] text-fg-30 mb-6 flex justify-between uppercase">
          <span>Selected Work</span>
          <span>{projects.length} entries</span>
        </div>
        <div>
          {projects.map((p) => (
            <div
              key={p.id}
              className="project-row relative grid grid-cols-12 gap-4 py-4 group items-baseline"
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="col-span-3 text-[15px] font-medium tracking-tight row-client text-fg-90">
                {p.client}
              </div>
              <div className="col-span-6 text-[15px] row-title text-fg-70">{p.title}</div>
              <div className="col-span-3 text-[13px] row-role text-fg-45 text-right">
                {p.role}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
