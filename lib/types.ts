export type LinkCategory =
  | 'dev-tools'
  | 'design'
  | 'packages'
  | 'docs'
  | 'ai-tools'
  | 'deploy'
  | 'databases'
  | 'learning'
  | 'productivity'
  | 'custom';

export interface DevLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: LinkCategory;
  favicon?: string;
  tags?: string[];
  color?: string; // accent color override
  createdAt: number;
  lastVisited?: number;
  visitCount: number;
  isPinned?: boolean;
  isUserAdded?: boolean; // true = added manually by the user (not a default)
}

export interface Category {
  id: LinkCategory;
  label: string;
  color: string;
}

export type ViewMode = 'grid' | 'list';

export interface AppState {
  links: DevLink[];
  activeCategory: LinkCategory | 'all' | 'recent' | 'pinned';
  searchQuery: string;
  viewMode: ViewMode;
  isModalOpen: boolean;
  editingLink: DevLink | null;
  sidebarOpen: boolean;
}
