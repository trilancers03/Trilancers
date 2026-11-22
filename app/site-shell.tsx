"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;
  return <><header className="header"><Link className="brand" href="/" aria-label="Trilancers home"><span className="brand-mark">T<span>.</span></span><span>trilancers<span className="brand-dot">.</span></span></Link><button className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button><nav id="main-nav" className={open ? 'nav-open' : ''} aria-label="Main navigation" onClick={() => setOpen(false)}><Link href="/">Home</Link><div className="nav-dropdown"><Link href="/solutions">Solutions</Link><div className="dropdown-links"><Link href="/solutions/website-development">Website Development</Link><Link href="/solutions/content-writing">Content Writing</Link><Link href="/solutions/seo">SEO</Link></div></div><Link href="/about-us">About</Link><Link href="/contact-us">Contact</Link></nav><Link className="header-cta" href="/contact-us">Let’s talk</Link></header>{children}<footer><Link className="brand" href="/"><span className="brand-mark">T<span>.</span></span><span>trilancers<span className="brand-dot">.</span></span></Link><p>Ideas made to move.</p><div><Link href="/">Home</Link><Link href="/solutions">Solutions</Link><Link href="/about-us">About</Link><Link href="/contact-us">Contact</Link></div><small>© 2026 Trilancers. All rights reserved.</small></footer></>;
}
