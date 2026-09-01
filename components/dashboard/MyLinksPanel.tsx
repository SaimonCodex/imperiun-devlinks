'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, Plus, Trash2, ExternalLink,
  ArrowUpRight, CheckCircle2, AlertCircle, Package,
} from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';
import { getCategoryById } from '@/lib/defaultLinks';
import { getDomain, timeAgo } from '@/lib/utils';
import { openExternal } from '@/lib/openExternal';

export default function MyLinksPanel() {
  const { links, exportLinks, importLinks, deleteLink, openModal, openPreview } = useDevLinksStore();
  const userLinks = links.filter(l => l.isUserAdded);

  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const { added, skipped } = await importLinks(file);
      showToast('ok', `${added} links importados${skipped ? `, ${skipped} omitidos (ya existen)` : ''}.`);
    } catch {
      showToast('err', 'Error al leer el archivo. ¿Es un JSON válido de DevLinks?');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed', top: 64, right: 24, zIndex: 9999,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--c-bg-2)', border: '1px solid var(--c-border-md)',
              borderRadius: 12, padding: '10px 16px', boxShadow: 'var(--shadow-lg)',
              fontSize: 13, color: 'var(--c-text-1)',
            }}
          >
            {toast.type === 'ok'
              ? <CheckCircle2 size={15} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
              : <AlertCircle size={15} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--c-text-1)', letterSpacing: '-0.035em', lineHeight: 1 }}>
            Mis Links
          </h1>
          <span style={{ fontSize: 11, color: 'var(--c-text-4)', fontVariantNumeric: 'tabular-nums' }}>
            {userLinks.length}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="btn btn-dark"
            style={{ gap: 6 }}
            title="Importar links desde un archivo JSON"
          >
            <Upload size={12} />
            {importing ? 'Importando…' : 'Importar'}
          </button>

          {userLinks.length > 0 && (
            <button
              onClick={exportLinks}
              className="btn btn-dark"
              style={{ gap: 6 }}
              title="Exportar mis links como JSON para compartir"
            >
              <Download size={12} />
              Exportar
            </button>
          )}

          <button
            onClick={() => openModal()}
            className="btn btn-white"
            style={{ gap: 6, height: 34, paddingLeft: 14, paddingRight: 14, fontSize: 12 }}
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {userLinks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '72px 24px',
            background: 'var(--c-glass)', border: '1px solid var(--c-border)',
            borderRadius: 18, textAlign: 'center',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--c-glass-md)', border: '1px solid var(--c-border-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Package size={22} style={{ color: 'var(--c-text-3)' }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Aún no tienes links propios
          </p>
          <p style={{ fontSize: 12, color: 'var(--c-text-4)', marginBottom: 24, lineHeight: 1.6 }}>
            Agrega links manualmente o importa un archivo<br />
            compartido por otro usuario.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} className="btn btn-glass" style={{ gap: 6 }}>
              <Upload size={12} /> Importar JSON
            </button>
            <button onClick={() => openModal()} className="btn btn-white" style={{ gap: 6, height: 34, paddingLeft: 14, paddingRight: 14, fontSize: 12 }}>
              <Plus size={13} /> Agregar link
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Link table ── */}
      {userLinks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--color-brand-subtle)',
            border: '1px solid var(--color-brand-10)', borderRadius: 10, marginBottom: 4,
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-brand)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} />
              {userLinks.length} link{userLinks.length !== 1 ? 's' : ''} agregados manualmente
            </span>
            <span style={{ fontSize: 10, color: 'var(--c-text-3)' }}>
              Exporta para compartir con otros usuarios
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 120px 80px 80px',
            gap: 12, padding: '0 16px', marginBottom: 2,
          }}>
            {['', 'Link', 'Categoría', 'Creado', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--c-text-4)' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <AnimatePresence>
            {userLinks.map((link, i) => {
              const cat = getCategoryById(link.category);
              const hasErr = imgErrs[link.id];
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.02, duration: 0.18 }}
                  className="link-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 120px 80px 80px',
                    gap: 12, alignItems: 'center',
                    padding: '11px 16px', borderRadius: 10,
                  }}
                >
                  {/* Favicon */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: link.favicon && !hasErr ? '#fff' : 'var(--c-glass-md)',
                    border: '1px solid var(--c-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {link.favicon && !hasErr ? (
                      <img
                        src={link.favicon} alt="" width={16} height={16}
                        onError={() => setImgErrs(p => ({ ...p, [link.id]: true }))}
                        style={{ width: 16, height: 16, objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)' }}>
                        {link.title.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Title + domain */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text-1)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {link.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-3)', marginTop: 1 }}>
                      {getDomain(link.url)}
                    </div>
                  </div>

                  {/* Category */}
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--c-text-3)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {cat?.label ?? link.category}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 10, color: 'var(--c-text-4)' }}>
                    {timeAgo(link.createdAt)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => openExternal(link.url)}
                      className="btn btn-ghost"
                      style={{ width: 26, height: 26, borderRadius: 6, padding: 0 }}
                      title="Abrir preview"
                    >
                      <ArrowUpRight size={12} style={{ color: 'var(--c-text-3)' }} />
                    </button>
                    <button
                      onClick={() => openExternal(link.url)}
                      className="btn btn-ghost"
                      style={{ width: 26, height: 26, borderRadius: 6, padding: 0 }}
                      title="Abrir en navegador"
                    >
                      <ExternalLink size={11} style={{ color: 'var(--c-text-3)' }} />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="btn btn-ghost"
                      style={{ width: 26, height: 26, borderRadius: 6, padding: 0 }}
                      title="Eliminar"
                    >
                      <Trash2 size={11} style={{ color: 'var(--color-red)' }} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
