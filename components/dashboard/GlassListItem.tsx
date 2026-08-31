'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { DevLink } from '@/lib/types';
import { useDevLinksStore } from '@/lib/store';
import { getCategoryById } from '@/lib/defaultLinks';
import { getDomain } from '@/lib/utils';

interface Props {
  link: DevLink;
  index?: number;
}

export default function GlassListItem({ link, index = 0 }: Props) {
  const { openPreview, openInSplit, togglePin, deleteLink, openModal } = useDevLinksStore();
  const [imgErr, setImgErr] = useState(false);
  const cat = getCategoryById(link.category);

  const handleOpen = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      openInSplit(link, 1);
    } else {
      openPreview(link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.2), duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="link-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        borderRadius: 10,
      }}
    >
      {/* Favicon */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: link.favicon && !imgErr ? '#ffffff' : 'var(--c-glass-md)',
          border: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {link.favicon && !imgErr ? (
          <img
            src={link.favicon}
            alt=""
            width={16}
            height={16}
            onError={() => setImgErr(true)}
            style={{ width: 16, height: 16, objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-3)' }}>
            {link.title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Title + domain */}
      <div style={{ minWidth: 0, flex: '0 0 180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text-1)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {link.title}
          </span>
          {link.isPinned && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--c-text-2)', flexShrink: 0 }} />
          )}
        </div>
        <span style={{ fontSize: 10, color: 'var(--c-text-3)', letterSpacing: '-0.01em' }}>
          {getDomain(link.url)}
        </span>
      </div>

      {/* Description */}
      <p style={{ flex: 1, fontSize: 11, color: 'var(--c-text-3)', lineHeight: 1.4, minWidth: 0, paddingRight: 16 }}>
        {link.description ?? '—'}
      </p>

      {/* Category */}
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-4)', flexShrink: 0, width: 80, textAlign: 'right' }}>
        {cat?.label}
      </span>

      {/* Actions */}
      <div className="group-actions" style={{ display: 'flex', gap: 2, opacity: 0, transition: 'opacity 140ms ease', flexShrink: 0 }}>
        <button onClick={() => togglePin(link.id)} className="btn btn-ghost" style={{ width: 28, height: 28, borderRadius: 6, padding: 0 }}>
          {link.isPinned ? <PinOff size={11} /> : <Pin size={11} />}
        </button>
        <button onClick={() => openModal(link)} className="btn btn-ghost" style={{ width: 28, height: 28, borderRadius: 6, padding: 0 }}>
          <Pencil size={11} />
        </button>
        <button onClick={() => deleteLink(link.id)} className="btn btn-ghost" style={{ width: 28, height: 28, borderRadius: 6, padding: 0, color: 'rgba(220,80,80,0.6)' }}>
          <Trash2 size={11} />
        </button>
      </div>

      {/* Open button */}
      <button onClick={handleOpen} className="btn btn-dark" style={{ flexShrink: 0 }} title="Click: Preview | Shift+Click: Split">
        Preview <ArrowUpRight size={10} />
      </button>

      <style jsx>{`
        div:hover .group-actions {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
}
