'use client';

import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';

export default function GlassNavbar() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, openModal } = useDevLinksStore();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
      {/* Ambient light behind navbar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[80px] rounded-full bg-white/[0.06] blur-[70px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        {/* Logo pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-navbar flex items-center gap-2 px-4 rounded-full h-10 shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs">
            ⚡
          </div>
          <span className="text-white font-semibold text-sm tracking-tight whitespace-nowrap">
            DevLinks
          </span>
        </motion.div>

        {/* Search bar — center */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 max-w-[480px] relative"
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar herramientas, docs, URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass h-10 pl-9 pr-4 rounded-full text-[13px]"
          />
        </motion.div>

        {/* Right controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 ml-auto shrink-0"
        >
          {/* View toggle */}
          <div className="glass-subtle flex items-center rounded-full p-[3px] gap-[2px]">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-white/15 text-white'
                  : 'text-white/35 hover:text-white/60'
              }`}
              title="Vista grilla"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-white/15 text-white'
                  : 'text-white/35 hover:text-white/60'
              }`}
              title="Vista lista"
            >
              <List size={13} />
            </button>
          </div>

          {/* Add link button */}
          <button
            onClick={() => openModal()}
            className="btn-primary h-10 px-5 text-[11px] font-semibold"
          >
            <Plus size={14} />
            Agregar
          </button>
        </motion.div>
      </div>
    </header>
  );
}
