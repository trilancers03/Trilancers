import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteShell from './site-shell';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL('https://trilancers.com'), icons: { icon: '/branding/trilancers-favicon.webp' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Suspense fallback={children}><SiteShell>{children}</SiteShell></Suspense></body></html>;
}
