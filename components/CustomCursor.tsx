'use client';

import { useEffect, useRef } from 'react';

/**
 * Replaces the system cursor with a small glowing green dot. Pure DOM transform
 * updates on pointermove — no React state, so no re-renders.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] glow-dot"
      style={{ backgroundColor: '#00FF80', willChange: 'transform' }}
    />
  );
}
