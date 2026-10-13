'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import { StaffNavLinks } from '@/components/staff/StaffNavLinks';
import './admin.css';

export default function StaffLayout({ children }: LayoutProps<'/staff'>) {
  const pathname = usePathname();
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const isDrawerOpen = drawerPath === pathname;

  useEffect(() => {
    if (!isDrawerOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerPath(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isDrawerOpen]);

  return (
    <div className="staff-portal">
      <div aria-hidden="true" className="staff-background" />
      <header className="staff-topbar">
        <button
          aria-controls="staff-sidebar"
          aria-expanded={isDrawerOpen}
          aria-label={isDrawerOpen ? 'Tutup menu' : 'Buka menu'}
          className="staff-menu-toggle"
          onClick={() => setDrawerPath(isDrawerOpen ? null : pathname)}
          type="button"
        >
          {isDrawerOpen
            ? <X aria-hidden="true" size={20} />
            : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="staff-account">
          <span className="staff-account-name">Pentadbir</span>
          <span aria-label="Admin" className="staff-account-avatar">A</span>
        </div>
      </header>

      {isDrawerOpen && (
        <button
          aria-label="Tutup menu"
          className="staff-drawer-backdrop"
          onClick={() => setDrawerPath(null)}
          type="button"
        />
      )}

      <aside
        aria-label="Menu pentadbir"
        className={`staff-sidebar${isDrawerOpen ? ' is-drawer-open' : ''}`}
        id="staff-sidebar"
      >
        <Link aria-label="Exploria, halaman utama admin" className="staff-brand" href="/staff">
          <Image
            src="/logoexploria.png"
            alt="Exploria"
            width={800}
            height={244}
            priority
            className="staff-brand-logo"
          />
        </Link>

        <nav aria-label="Navigasi pentadbir" className="staff-navigation">
          <StaffNavLinks onNavigate={() => setDrawerPath(null)} />
        </nav>

        <div className="staff-sidebar-footer">
          <LogoutButton buttonClassName="staff-sidebar-logout-button" variant="staff" />
        </div>
      </aside>

      <main className="staff-main">{children}</main>
    </div>
  );
}
