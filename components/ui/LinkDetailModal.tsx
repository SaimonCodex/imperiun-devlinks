'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowUpRight, Pin, PinOff, Pencil, Trash2,
  ExternalLink, Globe, ChevronLeft, ChevronRight,
  Eye, Calendar, Bookmark,
} from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';
import { getCategoryById } from '@/lib/defaultLinks';
import { getDomain } from '@/lib/utils';
import { openExternal } from '@/lib/openExternal';

/* ─── Microlink media fetch ─── */
interface MediaItem {
  type: 'image' | 'video';
  url: string;
  label?: string;
}

interface MediaData {
  items: MediaItem[];
}

function useMediaGallery(url: string | null): { media: MediaData; loading: boolean } {
  const [media, setMedia] = useState<MediaData>({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setMedia({ items: [] });

    const mshots = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=900`;

    // Request screenshot + video in one call
    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&video=true&meta=false`)
      .then(r => r.json())
      .then(data => {
        const items: MediaItem[] = [];

        const shot   = data?.data?.screenshot?.url as string | undefined;
        const ogImg  = data?.data?.image?.url as string | undefined;
        const video  = data?.data?.video?.url as string | undefined;

        // 1. Screenshot first
        if (shot) items.push({ type: 'image', url: shot, label: 'Captura' });
        else      items.push({ type: 'image', url: mshots, label: 'Captura' });

        // 2. Video only if microlink returned one (no skeleton if absent)
        if (video) items.push({ type: 'video', url: video, label: 'Video' });

        // 3. OG image only if different from screenshot
        if (ogImg && ogImg !== shot) items.push({ type: 'image', url: ogImg, label: 'Imagen' });

        setMedia({ items });
      })
      .catch(() => {
        setMedia({ items: [{ type: 'image', url: mshots, label: 'Captura' }] });
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { media, loading };
}

/* ─── Gallery panel (left side) ─── */
function GalleryPanel({ url }: { url: string }) {
  const { media, loading } = useMediaGallery(url);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => { setActiveIdx(0); setMediaLoaded(false); }, [url]);

  const go = useCallback((dir: 1 | -1) => {
    setMediaLoaded(false);
    setActiveIdx(i => (i + dir + media.items.length) % media.items.length);
  }, [media.items.length]);

  const current = media.items[activeIdx];
  const hasMany = media.items.length > 1;

  return (
    <div style={{ flex: '0 0 57%', position: 'relative', background: 'var(--c-bg-1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Media area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Loading shimmer — only for images while loading, not for absent video */}
        {(loading || (!mediaLoaded && current?.type === 'image')) && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'var(--c-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '2px solid var(--c-border)',
              borderTopColor: 'var(--c-text-2)',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {current?.type === 'image' && (
            <motion.img
              key={current.url}
              src={current.url}
              alt="Preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: mediaLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onLoad={() => setMediaLoaded(true)}
              onError={() => setMediaLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          )}

          {current?.type === 'video' && (
            <motion.video
              key={current.url}
              src={current.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              autoPlay muted loop playsInline
              onLoadedData={() => setMediaLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          )}
        </AnimatePresence>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to top, var(--c-bg-1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Nav arrows */}
        {hasMany && (
          <>
            <button onClick={() => go(-1)} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--c-glass-md)', border: '1px solid var(--c-border)',
              backdropFilter: 'blur(12px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--c-text-2)', zIndex: 3, transition: 'all 120ms ease',
            }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => go(1)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--c-glass-md)', border: '1px solid var(--c-border)',
              backdropFilter: 'blur(12px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--c-text-2)', zIndex: 3, transition: 'all 120ms ease',
            }}>
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {/* Media type badge (top-left) */}
        {current && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 7,
            background: 'var(--c-glass-hi)', border: '1px solid var(--c-border)',
            backdropFilter: 'blur(16px)',
            fontSize: 10, fontWeight: 500, color: 'var(--c-text-3)', zIndex: 3,
          }}>
            <Eye size={10} />
            {current.label ?? 'Media'}
          </div>
        )}

        {/* Open externally (bottom-right) */}
        <a
          href={url}
          onClick={(e) => { e.preventDefault(); openExternal(url); }}
          style={{
            position: 'absolute', bottom: hasMany ? 38 : 14, right: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--c-glass-hi)', border: '1px solid var(--c-border)',
            backdropFilter: 'blur(16px)',
            fontSize: 11, fontWeight: 500, color: 'var(--c-text-1)',
            textDecoration: 'none', zIndex: 3, transition: 'all 120ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-text-1)'; e.currentTarget.style.color = 'var(--c-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-glass-hi)'; e.currentTarget.style.color = 'var(--c-text-1)'; }}
        >
          <Globe size={11} />
          Abrir sitio
        </a>
      </div>

      {/* Pagination dots — only if multiple slides */}
      {hasMany && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '10px 0 12px' }}>
          {media.items.map((item, i) => (
            <button
              key={i}
              style={{
                width: i === activeIdx ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: i === activeIdx ? 'var(--c-text-2)' : 'var(--c-border-md)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 200ms ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Open externally badge */}
      <a
        href={url}
        onClick={(e) => { e.preventDefault(); openExternal(url); }}
        style={{
          position: 'absolute', bottom: media.items.length > 1 ? 40 : 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--c-glass-hi)', border: '1px solid var(--c-border)',
          backdropFilter: 'blur(16px)',
          fontSize: 11, fontWeight: 500, color: 'var(--c-text-1)',
          textDecoration: 'none', zIndex: 3,
          transition: 'all 120ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-text-1)', e.currentTarget.style.color = 'var(--c-bg)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-glass-hi)', e.currentTarget.style.color = 'var(--c-text-1)')}
      >
        <Globe size={11} />
        Abrir sitio
      </a>

      {/* Label top-left */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 7,
        background: 'var(--c-glass-hi)', border: '1px solid var(--c-border)',
        backdropFilter: 'blur(16px)',
        fontSize: 10, fontWeight: 500, color: 'var(--c-text-3)',
        zIndex: 3,
      }}>
        <Eye size={10} />
        Vista previa
      </div>
    </div>
  );
}

/* ─── Info panel (right side) ─── */
function InfoPanel({ link }: { link: import('@/lib/types').DevLink }) {
  const { openPreview, togglePin, deleteLink, openModal, closeDetail } = useDevLinksStore();
  const [imgErr, setImgErr] = useState(false);
  const cat = getCategoryById(link.category);

  const fmt = (ms?: number) => ms
    ? new Date(ms).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const handlePreview = () => {
    closeDetail();
    openPreview(link);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--c-modal-bg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '24px 24px 20px',
        borderBottom: '1px solid var(--c-border)',
        gap: 16,
      }}>
        {/* Logo + Title */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: link.favicon && !imgErr ? '#ffffff' : 'var(--c-glass-md)',
            border: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {link.favicon && !imgErr ? (
              <img
                src={link.favicon} alt="" width={28} height={28}
                onError={() => setImgErr(true)}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-3)', letterSpacing: '-0.02em' }}>
                {link.title.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              fontSize: 17, fontWeight: 600, color: 'var(--c-text-1)',
              letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 4,
            }}>
              {link.title}
            </h2>
            <a
              onClick={(e) => { e.preventDefault(); openExternal(link.url); }}
              href={link.url}
              style={{
                fontSize: 11, color: 'var(--c-text-3)', textDecoration: 'none',
                letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-3)'}
            >
              <Globe size={10} />
              {getDomain(link.url)}
            </a>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={closeDetail}
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'var(--c-glass)', border: '1px solid var(--c-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-text-3)', transition: 'all 120ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-glass-hi)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-glass)')}
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Category + Pin badge */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cat && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99,
              background: 'var(--c-glass-md)', border: '1px solid var(--c-border)',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: 'var(--c-text-2)',
            }}>
              <Bookmark size={9} />
              {cat.label}
            </span>
          )}
          {link.isPinned && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99,
              background: 'var(--c-glass-md)', border: '1px solid var(--c-border)',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: 'var(--c-text-2)',
            }}>
              <Pin size={9} />
              Pinned
            </span>
          )}
        </div>

        {/* Description */}
        {link.description && (
          <div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--c-text-4)',
              marginBottom: 8,
            }}>
              Descripción
            </p>
            <p style={{
              fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.6,
              letterSpacing: '-0.01em',
            }}>
              {link.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--c-text-4)', marginBottom: 8,
            }}>
              Tags
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {link.tags.map((tag: string) => (
                <span key={tag} style={{
                  padding: '3px 9px', borderRadius: 6,
                  background: 'var(--c-glass)', border: '1px solid var(--c-border)',
                  fontSize: 11, color: 'var(--c-text-3)', letterSpacing: '-0.01em',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Visitas', value: link.visitCount || 0, Icon: Eye },
            { label: 'Última visita', value: link.lastVisited ? fmt(link.lastVisited) : 'Nunca', Icon: Calendar },
            { label: 'Agregado', value: fmt(link.createdAt), Icon: Calendar },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'var(--c-glass)', border: '1px solid var(--c-border)',
            }}>
              <p style={{ fontSize: 9, color: 'var(--c-text-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text-1)', letterSpacing: '-0.02em' }}>
                {String(value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{
        padding: '14px 24px', borderTop: '1px solid var(--c-border)',
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        {/* Primary: Preview in browser */}
        <button
          onClick={handlePreview}
          className="btn btn-white"
          style={{ flex: 1, height: 38, fontSize: 12, fontWeight: 600 }}
        >
          Preview <ArrowUpRight size={13} />
        </button>

        {/* Pin */}
        <button
          onClick={() => togglePin(link.id)}
          className="btn btn-glass"
          style={{ width: 38, height: 38, padding: 0 }}
          title={link.isPinned ? 'Unpin' : 'Pin'}
        >
          {link.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
        </button>

        {/* Edit */}
        <button
          onClick={() => { closeDetail(); openModal(link); }}
          className="btn btn-glass"
          style={{ width: 38, height: 38, padding: 0 }}
          title="Edit"
        >
          <Pencil size={13} />
        </button>

        {/* Delete */}
        <button
          onClick={() => { deleteLink(link.id); closeDetail(); }}
          className="btn btn-ghost"
          style={{ width: 38, height: 38, padding: 0, color: 'rgba(220,80,80,0.7)' }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Modal ─── */
export default function LinkDetailModal() {
  const { detailLink, closeDetail } = useDevLinksStore();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetail(); };
    if (detailLink) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [detailLink, closeDetail]);

  return (
    <AnimatePresence>
      {detailLink && (
        <motion.div
          key="detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closeDetail}
          className="modal-backdrop"
          style={{ zIndex: 70, padding: '32px 24px' }}
        >
          <motion.div
            key="detail-panel"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(980px, 100%)',
              height: 'min(620px, 88vh)',
              display: 'flex',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid var(--c-border)',
              boxShadow: '0 40px 120px var(--c-shadow-card)',
            }}
          >
            <GalleryPanel url={detailLink.url} />
            <InfoPanel link={detailLink} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
