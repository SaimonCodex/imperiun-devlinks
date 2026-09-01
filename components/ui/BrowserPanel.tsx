'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowUpRight, RefreshCw, Columns2,
  Copy, Check, ExternalLink,
} from 'lucide-react';
import { DevLink } from '@/lib/types';
import { useDevLinksStore } from '@/lib/store';
import { getDomain } from '@/lib/utils';
import { openExternal } from '@/lib/openExternal';

/* ─── Single iframe pane ─── */
function IframePane({ link, slot }: { link: DevLink | null; slot: 0 | 1 }) {
  const [blocked, setBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);

  const reload = () => {
    if (!ref.current) return;
    setBlocked(false);
    setLoaded(false);
    const src = ref.current.src;
    ref.current.src = '';
    setTimeout(() => { if (ref.current) ref.current.src = src; }, 40);
  };

  if (!link) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10,
        background: 'rgba(255,255,255,0.02)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '-0.01em' }}>Panel vacío</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', textAlign: 'center', padding: '0 24px' }}>
          Mantén <kbd style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '1px 5px', fontSize: 9 }}>Shift</kbd> y haz click en un link
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', borderLeft: slot === 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
      {/* Pane tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', height: 36,
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {link.favicon && !imgErr ? (
          <img src={link.favicon} alt="" width={13} height={13} onError={() => setImgErr(true)}
            style={{ width: 13, height: 13, objectFit: 'contain', background: '#fff', borderRadius: 3, flexShrink: 0 }} />
        ) : (
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {link.title.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
          {link.title}
        </span>
        <button onClick={reload} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'rgba(255,255,255,0.2)', display: 'flex', borderRadius: 4 }}>
          <RefreshCw size={11} />
        </button>
        <a
          href={link.url}
          onClick={(e) => { e.preventDefault(); openExternal(link.url); }}
          style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', padding: 3, borderRadius: 4, textDecoration: 'none', cursor: 'pointer' }}
        >
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Blocked state — screenshot preview */}
      {blocked ? (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0e0e0e' }}>
          {/* Screenshot from WordPress mShots */}
          <img
            src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(link.url)}?w=1280&h=960`}
            alt={`Preview of ${link.title}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              opacity: 0.55,
              filter: 'saturate(0.8)',
              display: 'block',
            }}
          />

          {/* Overlay info */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 14,
            background: 'linear-gradient(to bottom, rgba(12,12,12,0.2) 0%, rgba(12,12,12,0.65) 100%)',
          }}>
            <div style={{
              background: 'rgba(10,10,10,0.85)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 14,
              padding: '20px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{getDomain(link.url)}</strong> no permite previsualización embebida
              </p>
              <a
                href={link.url}
                onClick={(e) => { e.preventDefault(); openExternal(link.url); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: '#fff',
                  borderRadius: 8,
                  color: '#000',
                  textDecoration: 'none',
                  fontSize: 12, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  transition: 'opacity 120ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <ArrowUpRight size={13} /> Abrir sitio
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!loaded && (
            <div style={{ position: 'absolute', inset: '36px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e0e', zIndex: 2 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid var(--c-border)',
                borderTopColor: 'var(--c-text-2)',
                animation: 'spin 0.75s linear infinite',
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          <iframe
            ref={ref}
            src={link.url}
            title={link.title}
            onLoad={() => setLoaded(true)}
            onError={() => setBlocked(true)}
            style={{ flex: 1, width: '100%', border: 'none', background: 'var(--c-bg)', display: 'block' }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </>
      )}
    </div>
  );
}

/* ─── Main BrowserModal ─── */
export default function BrowserPanel() {
  const { previewLink, previewMode, splitLinks, closePreview, setSplitMode } = useDevLinksStore();
  const [copied, setCopied] = useState(false);

  const isOpen  = !!previewLink;
  const isSplit = previewMode === 'split';

  const copyUrl = () => {
    if (!previewLink) return;
    navigator.clipboard.writeText(previewLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — also the flex centering wrapper */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePreview}
            className="modal-backdrop"
            style={{ zIndex: 60 }}
          >
            {/* Modal window — stop click from closing when clicking inside */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(1200px, 100%)',
                height: 'min(800px, 88vh)',
                background: 'var(--c-modal-bg)',
                border: '1px solid var(--c-border)',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
                flexShrink: 0,
              }}
            >
            {/* ── Title bar ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0 16px', height: 46,
              background: 'var(--c-glass)',
              borderBottom: '1px solid var(--c-border)',
              flexShrink: 0,
              userSelect: 'none',
            }}>
              {/* Traffic lights */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={closePreview}
                  style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: '#ff5f57', border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'opacity 120ms', opacity: 0.85,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                  title="Cerrar"
                />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-border-hi)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-border-hi)' }} />
              </div>

              {/* URL pill */}
              <div style={{
                flex: 1, height: 28, maxWidth: 560,
                background: 'var(--c-input-bg)',
                border: '1px solid var(--c-border)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
                minWidth: 0,
              }}>
                {/* Favicon in URL bar */}
                {previewLink?.favicon && (
                  <img src={previewLink.favicon} alt="" width={13} height={13}
                    style={{ width: 13, height: 13, objectFit: 'contain', background: '#fff', borderRadius: 3, flexShrink: 0 }} />
                )}
                <span style={{
                  flex: 1, fontSize: 11, color: 'var(--c-text-2)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em', cursor: 'text', userSelect: 'all',
                }}>
                  {previewLink?.url}
                </span>
                <button onClick={copyUrl} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--c-text-3)', flexShrink: 0 }}>
                  {copied
                    ? <Check size={11} style={{ color: 'var(--c-text-1)' }} />
                    : <Copy size={11} />
                  }
                </button>
              </div>

              {/* Right controls */}
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
                <button
                  onClick={() => setSplitMode(!isSplit)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 7,
                    background: isSplit ? 'var(--c-glass-hi)' : 'var(--c-btn-dark-bg)',
                    border: `1px solid ${isSplit ? 'var(--c-border-hi)' : 'var(--c-border)'}`,
                    cursor: 'pointer', fontSize: 10, fontWeight: 500,
                    color: isSplit ? 'var(--c-text-1)' : 'var(--c-text-3)',
                    transition: 'all 140ms ease',
                  }}
                >
                  <Columns2 size={11} /> Split
                </button>

                <a
                  href={previewLink?.url}
                  onClick={(e) => { e.preventDefault(); if (previewLink?.url) openExternal(previewLink.url); }}
                  style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 7,
                  background: 'var(--c-btn-dark-bg)',
                  border: '1px solid var(--c-border)',
                  fontSize: 10, fontWeight: 500,
                  color: 'var(--c-text-3)',
                  textDecoration: 'none', transition: 'all 140ms ease',
                  cursor: 'pointer',
                }}
                >
                  <ExternalLink size={11} /> Nueva pestaña
                </a>

                <button
                  onClick={closePreview}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 7,
                    background: 'var(--c-btn-dark-bg)',
                    border: '1px solid var(--c-border)',
                    cursor: 'pointer', color: 'var(--c-text-3)',
                    transition: 'all 140ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-btn-dark-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-btn-dark-bg)')}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {isSplit ? (
                <>
                  <IframePane link={splitLinks[0]} slot={0} />
                  <IframePane link={splitLinks[1]} slot={1} />
                </>
              ) : (
                <IframePane link={previewLink} slot={0} />
              )}
            </div>

            {/* Split hint */}
            {isSplit && !splitLinks[1] && (
              <div style={{
                position: 'absolute', bottom: 14, right: 28,
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 10, color: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(12px)', pointerEvents: 'none',
              }}>
                <kbd style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 3, padding: '1px 5px' }}>Shift</kbd> + click en un link para abrir aquí
              </div>
            )}
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
