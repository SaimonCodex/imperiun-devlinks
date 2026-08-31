'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassListItem from '@/components/dashboard/GlassListItem';
import { useDevLinksStore } from '@/lib/store';
import { filterLinks, sortLinks } from '@/lib/utils';
import { getCategoryById } from '@/lib/defaultLinks';

export default function LinkGrid() {
  const { links, activeCategory, searchQuery, viewMode, openModal } = useDevLinksStore();
  const filtered = sortLinks(filterLinks(links, activeCategory, searchQuery));

  const catLabel =
    activeCategory === 'all'    ? 'All resources' :
    activeCategory === 'recent' ? 'Recent' :
    activeCategory === 'pinned' ? 'Pinned' :
    getCategoryById(activeCategory)?.label ?? activeCategory;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>

      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--c-text-1)',
            letterSpacing: '-0.035em',
            lineHeight: 1,
          }}
        >
          {catLabel}
        </h1>
        <span
          style={{
            fontSize: 11,
            color: 'var(--c-text-4)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        >
          {filtered.length}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            background: 'var(--c-glass)',
            border: '1px solid var(--c-border)',
            borderRadius: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--c-text-3)', marginBottom: 6, fontWeight: 400, letterSpacing: '-0.02em' }}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No links in this category'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--c-text-4)', marginBottom: 20 }}>
            {searchQuery ? 'Try a different search term' : 'Add your first resource to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => openModal()}
              className="btn btn-glass"
              style={{ height: 34, fontSize: 12 }}
            >
              <Plus size={13} /> Add link
            </button>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: 10,
          }}
        >
          <AnimatePresence>
            {filtered.map((link, i) => (
              <GlassCard key={link.id} link={link} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* List header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 16px',
              marginBottom: 4,
            }}
          >
            <span style={{ width: 30, flexShrink: 0 }} />
            <span className="label" style={{ width: 180, flexShrink: 0 }}>Name</span>
            <span className="label" style={{ flex: 1 }}>Description</span>
            <span className="label" style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>Category</span>
            <span style={{ width: 92, flexShrink: 0 }} />
            <span style={{ width: 70, flexShrink: 0 }} />
          </div>

          <AnimatePresence>
            {filtered.map((link, i) => (
              <GlassListItem key={link.id} link={link} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
