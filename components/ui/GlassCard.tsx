'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { DevLink } from '@/lib/types';
import { useDevLinksStore } from '@/lib/store';
import { getCategoryById } from '@/lib/defaultLinks';
import { getDomain } from '@/lib/utils';
import { openExternal } from '@/lib/openExternal';

interface Props {
  link: DevLink;
  index?: number;
}

export default function GlassCard({ link, index = 0 }: Props) {
  const { openPreview, openInSplit, togglePin, deleteLink, openModal, openDetail } = useDevLinksStore();
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cat = getCategoryById(link.category);

  const handleOpen = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      openInSplit(link, 1);
    } else {
      // Intenta abrir en navegador externo; si falla, preview interno
      openExternal(link.url).catch(() => openPreview(link));
    }
  };

  // Card body click → detail
  const handleCardClick = (e: React.MouseEvent) => {
    openDetail(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.25), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="link-card"
      onClick={handleCardClick}
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0, height: '100%', cursor: 'pointer' }}
    >
      {/* Header row: favicon + category tag */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        {/* Favicon */}
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: link.favicon && !imgErr ? '#ffffff' : 'var(--c-glass-md)',
            border: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}
        >
          {link.favicon && !imgErr ? (
            <img
              src={link.favicon}
              alt=""
              width={18}
              height={18}
              onError={() => setImgErr(true)}
              style={{ width: 18, height: 18, objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-3)', letterSpacing: '-0.02em' }}>
              {link.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Category label */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--c-text-3)',
          }}
        >
          {cat?.label ?? link.category}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--c-text-1)',
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
          marginBottom: 6,
        }}
      >
        {link.title}
      </h3>

      {/* Domain */}
      <p
        style={{
          fontSize: 10,
          color: 'var(--c-text-3)',
          marginBottom: 8,
          letterSpacing: '-0.01em',
        }}
      >
        {getDomain(link.url)}
      </p>

      {/* Description */}
      {link.description && (
        <p
          style={{
            fontSize: 11,
            color: 'var(--c-text-2)',
            lineHeight: 1.55,
            flex: 1,
          }}
        >
          {link.description}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 12 }} />

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleOpen(e); }}
          className="btn btn-dark"
          style={{ flex: 1, justifyContent: 'center' }}
          title="Click: Preview | Shift+Click: Split">
          Preview
          <ArrowUpRight size={11} />
        </button>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.1 }}
              style={{ display: 'flex', gap: 2 }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); togglePin(link.id); }}
                className="btn btn-ghost"
                style={{ width: 28, height: 28, borderRadius: 7, padding: 0 }}
                title={link.isPinned ? 'Unpin' : 'Pin'}
              >
                {link.isPinned
                  ? <PinOff size={11} style={{ color: 'var(--c-text-2)' }} />
                  : <Pin size={11} style={{ color: 'var(--c-text-3)' }} />
                }
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openModal(link); }}
                className="btn btn-ghost"
                style={{ width: 28, height: 28, borderRadius: 7, padding: 0 }}
                title="Edit"
              >
                <Pencil size={11} style={{ color: 'var(--c-text-3)' }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteLink(link.id); }}
                className="btn btn-ghost"
                style={{ width: 28, height: 28, borderRadius: 7, padding: 0 }}
                title="Delete"
              >
                <Trash2 size={11} style={{ color: 'rgba(220,80,80,0.6)' }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pin indicator */}
      {link.isPinned && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--c-text-3)',
          }}
        />
      )}
    </motion.div>
  );
}
