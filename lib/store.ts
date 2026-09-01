'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DevLink, LinkCategory, ViewMode } from './types';
import { DEFAULT_LINKS } from './defaultLinks';
import { generateId, getFaviconUrl } from './utils';

type PreviewMode = 'single' | 'split';
type Theme = 'dark' | 'light';

interface DevLinksStore {
  links: DevLink[];
  activeCategory: string;
  searchQuery: string;
  viewMode: ViewMode;
  isModalOpen: boolean;
  editingLink: DevLink | null;
  sidebarOpen: boolean;
  initialized: boolean;
  theme: Theme;

  // Preview panel state
  previewLink: DevLink | null;
  previewMode: PreviewMode;
  splitLinks: [DevLink | null, DevLink | null];

  // Detail modal state
  detailLink: DevLink | null;

  // Actions
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  openModal: (link?: DevLink) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;

  // Preview actions
  openPreview: (link: DevLink) => void;
  closePreview: () => void;
  setSplitMode: (enabled: boolean) => void;
  openInSplit: (link: DevLink, slot: 0 | 1) => void;

  // Detail actions
  openDetail: (link: DevLink) => void;
  closeDetail: () => void;

  // Link CRUD
  addLink: (data: Omit<DevLink, 'id' | 'createdAt' | 'visitCount'>) => void;
  updateLink: (id: string, data: Partial<DevLink>) => void;
  deleteLink: (id: string) => void;
  visitLink: (id: string) => void;
  togglePin: (id: string) => void;
  reorderLinks: (links: DevLink[]) => void;

  // Import / Export
  exportLinks: () => void;
  importLinks: (file: File) => Promise<{ added: number; skipped: number }>;
}

export const useDevLinksStore = create<DevLinksStore>()(
  persist(
    (set, get) => ({
      links: DEFAULT_LINKS,
      activeCategory: 'all',
      searchQuery: '',
      viewMode: 'grid',
      isModalOpen: false,
      editingLink: null,
      sidebarOpen: true,
      initialized: true,
      theme: 'dark',

      previewLink: null,
      previewMode: 'single',
      splitLinks: [null, null],
      detailLink: null,

      setActiveCategory: (category) => set({ activeCategory: category, searchQuery: '' }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setViewMode: (mode) => set({ viewMode: mode }),

      openModal: (link) => set({ isModalOpen: true, editingLink: link ?? null }),
      closeModal: () => set({ isModalOpen: false, editingLink: null }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleTheme: () => {
        set((s) => {
          const nextTheme = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', nextTheme);
          return { theme: nextTheme };
        });
      },

      openPreview: (link) => {
        get().visitLink(link.id);
        set({ previewLink: link, previewMode: 'single', splitLinks: [link, null] });
      },
      closePreview: () => set({ previewLink: null, previewMode: 'single', splitLinks: [null, null] }),
      setSplitMode: (enabled) => set((s) => ({
        previewMode: enabled ? 'split' : 'single',
        splitLinks: enabled
          ? [s.previewLink, null]
          : [s.splitLinks[0], null],
      })),
      openInSplit: (link, slot) => {
        get().visitLink(link.id);
        set((s) => {
          const next: [DevLink | null, DevLink | null] = [...s.splitLinks] as [DevLink | null, DevLink | null];
          next[slot] = link;
          return { splitLinks: next, previewLink: next[0] ?? link, previewMode: 'split' };
        });
      },

      openDetail: (link) => set({ detailLink: link }),
      closeDetail: () => set({ detailLink: null }),

      addLink: (data) => {
        const newLink: DevLink = {
          ...data,
          id: generateId(),
          createdAt: Date.now(),
          visitCount: 0,
          isUserAdded: true,
          favicon: data.favicon || getFaviconUrl(data.url),
        };
        set((s) => ({ links: [...s.links, newLink] }));
      },

      updateLink: (id, data) => {
        set((s) => ({
          links: s.links.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }));
      },

      deleteLink: (id) => {
        set((s) => ({ links: s.links.filter((l) => l.id !== id) }));
      },

      visitLink: (id) => {
        set((s) => ({
          links: s.links.map((l) =>
            l.id === id
              ? { ...l, visitCount: l.visitCount + 1, lastVisited: Date.now() }
              : l
          ),
        }));
      },

      togglePin: (id) => {
        set((s) => ({
          links: s.links.map((l) =>
            l.id === id ? { ...l, isPinned: !l.isPinned } : l
          ),
        }));
      },

      reorderLinks: (links) => set({ links }),

      exportLinks: () => {
        const userLinks = get().links.filter(l => l.isUserAdded);
        const json = JSON.stringify({ version: 1, links: userLinks }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devlinks-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importLinks: async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const parsed = JSON.parse(e.target?.result as string);
              const incoming: DevLink[] = parsed.links ?? parsed;
              if (!Array.isArray(incoming)) throw new Error('Formato inválido');
              const existingIds = new Set(get().links.map(l => l.id));
              const existingUrls = new Set(get().links.map(l => l.url));
              let added = 0;
              let skipped = 0;
              const newLinks: DevLink[] = [];
              for (const link of incoming) {
                if (!link.url || !link.title) { skipped++; continue; }
                if (existingIds.has(link.id) || existingUrls.has(link.url)) { skipped++; continue; }
                newLinks.push({
                  ...link,
                  id: generateId(),
                  createdAt: Date.now(),
                  visitCount: 0,
                  isUserAdded: true,
                  favicon: link.favicon || getFaviconUrl(link.url),
                });
                added++;
              }
              set((s) => ({ links: [...s.links, ...newLinks] }));
              resolve({ added, skipped });
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsText(file);
        });
      },
    }),
    {
      name: 'devlinks-storage',
      version: 1,
      partialize: (s) => ({
        links: s.links,
        sidebarOpen: s.sidebarOpen,
        viewMode: s.viewMode,
        theme: s.theme,
      }),
    }
  )
);
