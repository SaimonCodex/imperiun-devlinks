'use client';

import AmbientLight from '@/components/ui/AmbientLight';
import GlassNavbar from '@/components/ui/GlassNavbar';
import GlassSidebar from '@/components/ui/GlassSidebar';
import GlassModal from '@/components/ui/GlassModal';
import BrowserPanel from '@/components/ui/BrowserPanel';
import LinkDetailModal from '@/components/ui/LinkDetailModal';
import LinkGrid from '@/components/dashboard/LinkGrid';
import RecentLinks from '@/components/dashboard/RecentLinks';
import MyLinksPanel from '@/components/dashboard/MyLinksPanel';
import { useDevLinksStore } from '@/lib/store';

export default function DashboardPage() {
  const { activeCategory } = useDevLinksStore();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AmbientLight />

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <GlassNavbar />
      </div>

      {/* Body */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px 40px',
          display: 'flex',
          gap: 0,
        }}
      >
        {/* Sidebar column */}
        <div
          style={{
            paddingTop: 24,
            paddingRight: 20,
            borderRight: '1px solid var(--c-border)',
            position: 'sticky',
            top: 52,
            height: 'calc(100vh - 52px)',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <GlassSidebar />
        </div>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            paddingTop: 28,
            paddingLeft: 24,
          }}
        >
          {activeCategory === 'my-links' ? (
            <MyLinksPanel />
          ) : (
            <>
              {activeCategory === 'all' && <RecentLinks />}
              <LinkGrid />
            </>
          )}
        </main>
      </div>

      <GlassModal />
      <BrowserPanel />
      <LinkDetailModal />
    </div>
  );
}
