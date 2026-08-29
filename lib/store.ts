'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DevLink, LinkCategory, ViewMode } from './types';
import { DEFAULT_LINKS } from './defaultLinks';
import { generateId, getFaviconUrl } from './utils';

interface DevLinksStore {
  links: DevLink[];
  activeCategory: string;
  searchQuery: string;
  viewMode: ViewMode;
  isModalOpen: boolean;
  editingLink: DevLink | null;
  sidebarOpen: boolean;
  initialized: boolean;

  // Actions
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  openModal: (link?: DevLink) => void;
  closeModal: () => void;
  toggleSidebar: () => void;

  // Link CRUD
  addLink: (data: Omit<DevLink, 'id' | 'createdAt' | 'visitCount'>) => void;
  updateLink: (id: string, data: Partial<DevLink>) => void;
  deleteLink: (id: string) => void;
  visitLink: (id: string) => void;
  togglePin: (id: string) => void;
  reorderLinks: (links: DevLink[]) => void;
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

      setActiveCategory: (category) => set({ activeCategory: category, searchQuery: '' }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setViewMode: (mode) => set({ viewMode: mode }),

      openModal: (link) => set({ isModalOpen: true, editingLink: link ?? null }),
      closeModal: () => set({ isModalOpen: false, editingLink: null }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      addLink: (data) => {
        const newLink: DevLink = {
          ...data,
          id: generateId(),
          createdAt: Date.now(),
          visitCount: 0,
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
    }),
    {
      name: 'devlinks-storage',
      version: 1,
    }
  )
);
