import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'DevLinks — Panel de Recursos para Desarrolladores',
  description:
    'Centro de mando personal para programadores: accede a tus herramientas, docs y recursos favoritos en un panel premium con estética glassmorphism.',
  keywords: ['desarrollador', 'programador', 'herramientas', 'recursos', 'links', 'dev tools'],
  authors: [{ name: 'DevLinks' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let state = localStorage.getItem('devlinks-storage');
                if (state) {
                  let parsed = JSON.parse(state);
                  let theme = parsed.state?.theme || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
