'use client';

import { useDevLinksStore } from '@/lib/store';

export default function AmbientLight() {
  const { theme } = useDevLinksStore();
  const isLight = theme === 'light';

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Top center */}
      <div style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 340,
        background: isLight
          ? 'radial-gradient(ellipse at center, rgba(180,190,220,0.35) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(255,255,255,0.055) 0%, transparent 70%)',
        filter: 'blur(40px)',
        transition: 'background 280ms ease',
      }} />
      {/* Bottom right */}
      <div style={{
        position: 'absolute', bottom: -60, right: -60,
        width: 500, height: 400,
        background: isLight
          ? 'radial-gradient(ellipse at center, rgba(160,170,210,0.2) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transition: 'background 280ms ease',
      }} />
    </div>
  );
}
