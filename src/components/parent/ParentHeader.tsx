'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useParentChildren } from '@/lib/parent-dashboard';

export default function ParentHeader() {
  const { children } = useParentChildren();
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Adjust notifications based on registered children
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

  return (
    <header className="relative hidden min-[1001px]:flex min-h-[58px] items-center justify-end gap-3 border-b border-[#e5ebf1] bg-white px-4 text-[#334155] sm:px-6">
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowNotifications(!showNotifications);
          }}
          aria-expanded={showNotifications}
          aria-label={`${unreadCount} notifikasi`}
          className="relative grid h-10 w-10 place-items-center rounded-xl text-[#0072bc] hover:bg-[#e7f3fa] focus-visible:outline-[#0072bc] transition"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[#0072bc] text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Popover */}
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute right-0 top-12 z-50 w-[320px] sm:w-[380px] rounded-2xl border border-[#cfe2f3] bg-white p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-[#1a2b49]">
                  <Bell className="h-4 w-4 text-[#0072bc]" />
                  <span>Notifikasi Penjaga</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0072bc] hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Tanda dibaca
                  </button>
                )}
              </div>

              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => setShowNotifications(false)}
                    className={`block rounded-xl p-3 transition ${
                      notif.unread
                        ? 'bg-[#f0f7fc] border border-[#d2e7f7]'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#1a2b49]">{notif.title}</p>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between">
                <Link
                  href="/parent/activity"
                  onClick={() => setShowNotifications(false)}
                  className="parent-blue-surface inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs"
                >
                  Lihat Semua Aktiviti
                </Link>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Button - Takes Parent to /parent/profile to edit profile */}
      <Link
        href="/parent/profile"
        aria-label={`Profil Penjaga: ${displayName}. Tekan untuk lihat dan kemas kini profil.`}
        title="Kemas kini profil penjaga"
        className="group flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#e7f3fa] focus-visible:outline-[#0072bc] transition"
      >
        <span className="relative grid h-[38px] w-[38px] place-items-center rounded-full border-2 border-[#0072bc] bg-[#ffd9c2] text-xl shadow-xs transition group-hover:scale-105">
          👩
        </span>
        <span className="hidden text-sm font-semibold text-[#1a2b49] sm:inline-block max-w-[160px] truncate group-hover:text-[#0072bc]">
          Halo, {displayName}!
        </span>
      </Link>
    </header>
  );
}
