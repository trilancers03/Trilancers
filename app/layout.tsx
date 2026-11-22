import type { Metadata } from 'next';
import SiteShell from './site-shell';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL('https://trilancers.com'), icons: { icon: '/branding/favicon.webp' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>;
}
