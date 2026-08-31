'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';
import { getCategoryById } from '@/lib/defaultLinks';
import { getDomain, timeAgo } from '@/lib/utils';
import { useState } from 'react';

export default function RecentLinks() {
  const { links, openPreview } = useDevLinksStore();
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});

  const recent = [...links]
    .filter(l => l.lastVisited)
    .sort((a, b) => (b.lastVisited ?? 0) - (a.lastVisited ?? 0))
    .slice(0, 6);

  if (recent.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--c-text-3)',
          }}
        >
          Recent
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {recent.map((link, i) => {
          const hasErr = imgErrs[link.id];
          return (
            <motion.button
              key={link.id}
              onClick={() => openPreview(link)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.18 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                background: 'var(--c-glass)',
                border: '1px solid var(--c-border)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--c-glass-md)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border-md)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--c-glass)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)';
              }}
            >
              {/* Favicon */}
              {link.favicon && !hasErr ? (
                <img
                  src={link.favicon}
                  alt=""
                  width={13}
                  height={13}
                  onError={() => setImgErrs(p => ({ ...p, [link.id]: true }))}
                  style={{ width: 13, height: 13, objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-text-3)' }}>
                  {link.title.slice(0, 2).toUpperCase()}
                </span>
              )}

              <span style={{ fontSize: 11, color: 'var(--c-text-2)', fontWeight: 450, letterSpacing: '-0.01em' }}>
                {link.title}
              </span>

              <span style={{ fontSize: 9, color: 'var(--c-text-4)' }}>
                {timeAgo(link.lastVisited!)}
              </span>

              <ArrowUpRight size={9} style={{ color: 'var(--c-text-4)' }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
