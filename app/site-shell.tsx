"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
function SiteBrand({ onClick }: { onClick?: () => void }) {
  return (
    <Link className="brand" href="/" aria-label="Trilancers home" onClick={onClick}>
      <Image className="brand-logo" src="/branding/white-logo.webp" alt="" width={154} height={24} />
    </Link>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;
  return <PublicSiteShell key={pathname}>{children}</PublicSiteShell>;
}

function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia('(max-width: 800px)');
    const closeOnDesktop = () => {
      if (!mobile.matches) setOpen(false);
    };
    mobile.addEventListener('change', closeOnDesktop);
    return () => mobile.removeEventListener('change', closeOnDesktop);
  }, [open]);

  return <>
    <header className={open ? 'header header-menu-open' : 'header'} onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        menuToggle.current?.focus();
      }
    }}>
      <SiteBrand onClick={() => setOpen(false)} />
      <button
        ref={menuToggle}
        type="button"
        className="menu-toggle"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <div
        className="main-nav-backdrop"
        aria-hidden="true"
        onClick={() => {
          setOpen(false);
          menuToggle.current?.focus();
        }}
      />
      <div className="main-nav-frame">
        <nav id="main-nav" className={open ? 'nav-open' : ''} aria-label="Main navigation" onClick={(event) => {
          if (event.target instanceof Element && event.target.closest('a')) {
            setOpen(false);
            if (menuToggle.current?.offsetWidth) menuToggle.current.focus();
          }
        }}>
          <Link href="/">Home</Link>
          <div className="nav-dropdown">
            <Link href="/solutions">Solutions</Link>
            <div className="dropdown-links">
              <Link href="/solutions/website-development">Website Development</Link>
              <Link href="/solutions/content-writing">Content Writing</Link>
              <Link href="/solutions/seo">SEO</Link>
            </div>
          </div>
          <Link href="/about-us">About</Link>
          <Link href="/contact-us">Contact</Link>
        </nav>
      </div>
      <Link className="header-cta" href="/contact-us" onClick={() => setOpen(false)}>Let’s talk</Link>
    </header>
    <div className="site-content" inert={open}>
    {children}
    <footer className="site-footer">
    <div className="site-footer-content">
      <div className="site-footer-brand">
        <SiteBrand />
        <p>Ideas made to move.</p>
      </div>
      <nav className="site-footer-links" aria-label="Company">
        <h2>Company</h2>
        <Link href="/">Home</Link>
        <Link href="/about-us">About</Link>
        <Link href="/contact-us">Contact</Link>
      </nav>
      <nav className="site-footer-links" aria-label="Services">
        <h2><Link href="/solutions">Solutions</Link></h2>
        <Link href="/solutions/website-development">Website Development</Link>
        <Link href="/solutions/content-writing">Content Writing</Link>
        <Link href="/solutions/seo">SEO</Link>
      </nav>
    </div>
    <div className="site-footer-bottom">
      <small>© 2026 Trilancers. All rights reserved.</small>
    </div>
    </footer>
    </div>
  </>;
}
