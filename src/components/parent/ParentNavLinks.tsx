'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Award,
  Home,
  Menu,
  Users,
  User,
  X,
  Bell,
  ChevronDown,
  CheckCheck,
} from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import { useParentChildren } from '@/lib/parent-dashboard';
import { cn } from '@/lib/utils';

export default function ParentNavLinks() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDrawerNotifications, setShowDrawerNotifications] = useState(false);
  const { children } = useParentChildren();

  const [parentProfile, setParentProfile] = useState<{
    fullName: string;
    email: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setParentProfile(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-welcome',
      title: 'Selamat Datang ke Exploria! 🚀',
      message: 'Portal pemantauan akademik dan kokurikulum anak anda sedia digunakan.',
      time: 'Baru',
      unread: true,
      href: '/parent',
    },
  ]);

  useEffect(() => {
    if (children.length > 0) {
      const firstChild = children[0];
      setNotifications([
        {
          id: 'notif-1',
          title: `Aktiviti Pembelajaran: ${firstChild.name}`,
          message: `${firstChild.name} kini berdaftar dalam Exploria Skill Portal (${firstChild.grade}).`,
          time: 'Hari ini',
          unread: true,
          href: `/parent/children/${firstChild.id}`,
        },
        {
          id: 'notif-2',
          title: 'Anugerah & Pertandingan Digital 🏆',
          message: 'Sijil digital format A4 rasmi dan pingat fizikal sedia ditempah.',
          time: 'Semalam',
          unread: false,
          href: '/parent/awards',
        },
      ]);
    } else {
      setNotifications([
        {
          id: 'notif-welcome',
          title: 'Selamat Datang ke Exploria! 🚀',
          message: 'Sila daftarkan anak pertama anda di ruangan "Tambah Anak" untuk memulakan pemantauan pembelajaran.',
          time: 'Baru',
          unread: true,
          href: '/parent/add-child',
        },
      ]);
    }
  }, [children]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const displayName = parentProfile?.fullName || 'Ibu Bapa';

  const links = [
    { href: '/parent', label: 'Home', icon: Home },
    { href: '/parent/children', label: 'Senarai Anak', icon: Users },
    { href: '/parent/activity', label: 'Aktiviti Anak', icon: Activity },
    { href: '/parent/awards', label: 'Anugerah Anak', icon: Award },
    { href: '/parent/profile', label: 'Profil Saya', icon: User },
  ];

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  const isActive = (href: string) =>
    pathname === href ||
    (href === '/parent/children' &&
      (pathname.startsWith('/parent/children/') || pathname === '/parent/add-child'));

  return (
    <>
      {/* Mobile Hamburger Button with optional unread indicator */}
      <div className="relative min-[1001px]:hidden">
        <button
          type="button"
          aria-label={isDrawerOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isDrawerOpen}
          aria-controls="parent-mobile-drawer"
          onClick={() => setIsDrawerOpen((open) => !open)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5ebf1] text-[#334155] transition hover:bg-[#f5f7fa]"
        >
          {isDrawerOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
          {unreadCount > 0 && !isDrawerOpen && (
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#0072bc] text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <nav aria-label="Navigasi penjaga" className="hidden min-[1001px]:flex min-[1001px]:flex-col">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={cn(
              'mx-[6px] my-0.5 flex min-h-[48px] min-w-0 items-center rounded-r-xl px-[22px] py-[13px] text-base font-medium text-[#536471] transition-colors hover:bg-[#f1f5f9] hover:text-[#075985]',
              isActive(href) && 'parent-nav-glass-active rounded-l-none border-l-4 pl-[18px]',
            )}
          >
            <Icon aria-hidden="true" className="mr-3.5 h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 min-[1001px]:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-xs"
          />
          <aside
            id="parent-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu penjaga"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col bg-white p-5 shadow-2xl overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#e5ebf1] pb-3">
              <span className="text-base font-bold text-[#22303c]">Menu Utama</span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setIsDrawerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-[#536471] hover:bg-[#f5f7fa]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* Profil Penjaga dalam Drawer */}
            <Link
              href="/parent/profile"
              onClick={() => setIsDrawerOpen(false)}
              className="mb-3.5 flex items-center gap-3 rounded-2xl bg-sky-50/70 p-3 border border-[#cfe2f3] hover:bg-sky-100/70 transition"
              title="Kemas kini profil"
            >
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#0072bc] bg-[#ffd9c2] text-xl shadow-xs">
                👩
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1a2b49] truncate">
                  Halo, {displayName}!
                </p>
                <p className="text-[11px] font-semibold text-[#0072bc]">
                  Kemas kini profil &rsaquo;
                </p>
              </div>
            </Link>

            {/* Pengumuman & Notifikasi dalam Drawer */}
            <div className="mb-4 rounded-2xl border border-[#cfe2f3] bg-[#f0f7fc] p-3">
              <button
                type="button"
                onClick={() => setShowDrawerNotifications(!showDrawerNotifications)}
                className="flex w-full items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#0072bc]" />
                  <span className="text-xs font-bold text-[#1a2b49]">
                    Pengumuman & Notifikasi
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <span className="grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#0072bc] text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      showDrawerNotifications && 'rotate-180'
                    )}
                  />
                </div>
              </button>

              {showDrawerNotifications && (
                <div className="mt-2.5 space-y-2 border-t border-[#cfe2f3] pt-2">
                  {unreadCount > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0072bc] hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" /> Tanda dibaca
                      </button>
                    </div>
                  )}
                  <div className="max-h-[180px] space-y-1.5 overflow-y-auto">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`block rounded-xl p-2.5 transition text-left ${
                          notif.unread
                            ? 'bg-white border border-[#bce0fd]'
                            : 'bg-white/60 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-[#1a2b49] leading-snug">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">
                          {notif.message}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigasi Utama */}
            <nav aria-label="Navigasi penjaga mudah alih" className="flex flex-col gap-1.5">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  onClick={() => setIsDrawerOpen(false)}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-[#536471] transition-colors hover:bg-[#f1f5f9] hover:text-[#075985]',
                    isActive(href) && 'parent-nav-glass-active',
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Log Keluar */}
            <div className="mt-auto border-t border-[#e5ebf1] pt-4">
              <LogoutButton
                variant="parent"
                buttonClassName="w-full justify-center"
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
