'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Terminal, Paintbrush, Package, BookOpen,
  Sparkles, Cloud, Database, GraduationCap,
  Zap, Bookmark, Grid3X3, Clock, Pin,
  PanelLeft,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/defaultLinks';
import { useDevLinksStore } from '@/lib/store';

const CAT_ICONS: Record<string, React.ElementType> = {
  'dev-tools':    Terminal,
  'design':       Paintbrush,
  'packages':     Package,
  'docs':         BookOpen,
  'ai-tools':     Sparkles,
  'deploy':       Cloud,
  'databases':    Database,
  'learning':     GraduationCap,
  'productivity': Zap,
  'custom':       Bookmark,
};

const TOP_ITEMS = [
  { id: 'all',    label: 'All',    Icon: Grid3X3 },
  { id: 'recent', label: 'Recent', Icon: Clock   },
  { id: 'pinned', label: 'Pinned', Icon: Pin     },
];

export default function GlassSidebar() {
  const { activeCategory, setActiveCategory, sidebarOpen, toggleSidebar, links } = useDevLinksStore();

  const countFor = (id: string) => {
    if (id === 'all')    return links.length;
    if (id === 'recent') return links.filter(l => l.lastVisited).length;
    if (id === 'pinned') return links.filter(l => l.isPinned).length;
    return links.filter(l => l.category === id).length;
  };

  return (
    <aside style={{
      width: sidebarOpen ? 248 : 48,
      flexShrink: 0,
      transition: 'width 240ms cubic-bezier(0.22,1,0.36,1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header row */}
      <div style={{
        height: 40, display: 'flex', alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        paddingLeft: sidebarOpen ? 2 : 0, marginBottom: 16, flexShrink: 0,
      }}>
        {sidebarOpen && (
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-text-3)' }}>
            Workspace
          </span>
        )}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
          style={{
            width: 28, height: 28, borderRadius: 8, background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-glass-md)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <PanelLeft size={13} style={{
            color: 'var(--c-text-3)',
            transform: sidebarOpen ? 'none' : 'scaleX(-1)',
            transition: 'transform 240ms ease',
          }} />
        </button>
      </div>

      {/* Quick access row (All / Recent / Pinned) */}
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div key="top-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 20 }}>
            {TOP_ITEMS.map(({ id, label, Icon }) => {
              const isActive = activeCategory === id;
              const count = countFor(id);
              return (
                <button key={id} onClick={() => setActiveCategory(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '10px 6px', borderRadius: 10,
                    background: isActive ? 'var(--c-glass-hi)' : 'var(--c-glass)',
                    border: `1px solid ${isActive ? 'var(--c-border-md)' : 'var(--c-border)'}`,
                    cursor: 'pointer', transition: 'all 140ms ease', position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass-md)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass)'; } }}
                >
                  <Icon size={14} style={{ color: isActive ? 'var(--c-text-1)' : 'var(--c-text-3)', flexShrink: 0 }} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', color: isActive ? 'var(--c-text-1)' : 'var(--c-text-3)', lineHeight: 1 }}>
                    {label}
                  </span>
                  {count > 0 && (
                    <span style={{ position: 'absolute', top: 5, right: 7, fontSize: 8, color: 'var(--c-text-4)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="top-collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16, alignItems: 'center' }}>
            {TOP_ITEMS.map(({ id, Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button key={id} onClick={() => setActiveCategory(id)} title={id}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isActive ? 'var(--c-glass-hi)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--c-border-md)' : 'transparent'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 140ms ease',
                  }}
                >
                  <Icon size={13} style={{ color: isActive ? 'var(--c-text-1)' : 'var(--c-text-3)' }} strokeWidth={1.75} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separator */}
      {sidebarOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>
            Categories
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        </div>
      )}

      {/* Category grid */}
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div key="cat-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 4 }}>
            {CATEGORIES.map((cat, i) => {
              const Icon = CAT_ICONS[cat.id] ?? Bookmark;
              const isActive = activeCategory === cat.id;
              const count = countFor(cat.id);
              return (
                <motion.button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 8, padding: '12px 11px 10px', borderRadius: 12,
                    background: isActive ? 'var(--c-glass-hi)' : 'var(--c-glass)',
                    border: `1px solid ${isActive ? 'var(--c-border-md)' : 'var(--c-border)'}`,
                    cursor: 'pointer', transition: 'background 140ms ease, border-color 140ms ease',
                    position: 'relative', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass-md)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass)'; } }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: isActive ? 'var(--c-glass-hi)' : 'var(--c-glass-md)',
                    border: `1px solid ${isActive ? 'var(--c-border-md)' : 'var(--c-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={13} style={{ color: isActive ? 'var(--c-text-1)' : 'var(--c-text-2)' }} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--c-text-1)' : 'var(--c-text-3)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                    {cat.label}
                  </span>
                  {count > 0 && (
                    <span style={{ position: 'absolute', top: 8, right: 9, fontSize: 8, fontWeight: 500, color: isActive ? 'var(--c-text-3)' : 'var(--c-text-4)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="cat-collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, alignItems: 'center', overflowY: 'auto' }}>
            {CATEGORIES.map(cat => {
              const Icon = CAT_ICONS[cat.id] ?? Bookmark;
              const isActive = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} title={cat.label}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isActive ? 'var(--c-glass-hi)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--c-border-md)' : 'transparent'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 140ms ease', flexShrink: 0,
                  }}
                >
                  <Icon size={13} style={{ color: isActive ? 'var(--c-text-1)' : 'var(--c-text-3)' }} strokeWidth={1.75} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer count */}
      {sidebarOpen && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--c-text-1)', letterSpacing: '-0.05em', lineHeight: 1 }}>
              {links.length}
            </span>
            <span style={{ fontSize: 10, color: 'var(--c-text-4)', letterSpacing: '-0.01em' }}>
              resources
            </span>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Limpiar el Local Storage para ver las nuevas descripciones? Esto borrará temporalmente tus links manuales (pero ya los tienes respaldados).')) {
                localStorage.removeItem('devlinks-storage');
                window.location.reload();
              }
            }}
            title="Resetear almacenamiento local"
            style={{
              padding: '4px 8px', borderRadius: 6, background: 'var(--c-glass)',
              border: '1px solid var(--c-border)', cursor: 'pointer',
              fontSize: 9, fontWeight: 500, color: 'var(--c-text-3)', transition: 'all 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text-1)'; e.currentTarget.style.borderColor = 'var(--c-border-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-3)'; e.currentTarget.style.borderColor = 'var(--c-border)'; }}
          >
            Reset App
          </button>
        </div>
      )}
    </aside>
  );
}
