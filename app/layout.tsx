import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevLinks — Panel de Recursos para Desarrolladores',
  description:
    'Centro de mando personal para programadores: accede a tus herramientas, docs y recursos favoritos en un panel premium con estética glassmorphism.',
  keywords: ['desarrollador', 'programador', 'herramientas', 'recursos', 'links', 'dev tools'],
  authors: [{ name: 'DevLinks' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
