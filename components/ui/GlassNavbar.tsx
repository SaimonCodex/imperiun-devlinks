'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, LayoutGrid, List, Sun, Moon } from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';

export default function GlassNavbar() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, openModal, theme, toggleTheme } = useDevLinksStore();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--c-border-md)',
        background: 'var(--c-nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          height: 52,
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginRight: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--c-text-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M6 1l5 5-5 5" stroke="var(--c-bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--c-text-1)',
              letterSpacing: '-0.03em',
            }}
          >
            DevLinks
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: 'var(--c-border)', flexShrink: 0 }} />

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--c-text-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="input"
            style={{
              paddingLeft: 34,
              height: 34,
              borderRadius: 8,
              fontSize: 12,
            }}
            type="text"
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, border: '1px solid var(--c-border)' }}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--c-input-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              padding: 2,
              gap: 1,
            }}
          >
            {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'grid' | 'list')}
                className="btn btn-ghost"
                style={{
                  width: 28,
                  height: 26,
                  borderRadius: 6,
                  padding: 0,
                  background: viewMode === mode ? 'var(--c-glass-hi)' : 'transparent',
                  color: viewMode === mode ? 'var(--c-text-1)' : 'var(--c-text-3)',
                }}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => openModal()}
            className="btn btn-white"
            style={{ height: 34, paddingLeft: 14, paddingRight: 14, fontSize: 12, fontWeight: 500 }}
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
      </div>
    </header>
  );
}
