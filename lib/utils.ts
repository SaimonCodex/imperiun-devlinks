import { DevLink, LinkCategory } from './types';

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return formatDate(timestamp);
}

export function filterLinks(
  links: DevLink[],
  category: string,
  query: string
): DevLink[] {
  let filtered = [...links];

  if (category !== 'all') {
    if (category === 'recent') {
      filtered = filtered
        .filter(l => l.lastVisited)
        .sort((a, b) => (b.lastVisited ?? 0) - (a.lastVisited ?? 0))
        .slice(0, 12);
    } else if (category === 'pinned') {
      filtered = filtered.filter(l => l.isPinned);
    } else {
      filtered = filtered.filter(l => l.category === category);
    }
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  return filtered;
}

export function sortLinks(links: DevLink[]): DevLink[] {
  return [...links].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.visitCount - a.visitCount;
  });
}
