'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  House,
  BookOpen,
  Gamepad2,
  Trophy,
  Award,
  ShoppingBag,
  History,
  UserRound,
} from 'lucide-react'
import StudentCoinMissionWidget from '@/components/student/StudentCoinMissionWidget'
import DailyStreakMissionBadge from '@/components/student/DailyStreakMissionBadge'
import LogoutButton from '@/components/auth/LogoutButton'

const studentLinks = [
  { href: '/student', label: 'Utama', icon: House },
  { href: '/student/quizzes', label: 'Pembelajaran', icon: BookOpen },
  { href: '/student/games', label: 'Game Arena', icon: Gamepad2 },
  { href: '/student/competition', label: 'Pertandingan', icon: Trophy },
  { href: '/student/achievements', label: 'Pencapaian', icon: Award },
  { href: '/student/redeem', label: 'Kedai Tebus', icon: ShoppingBag },
  { href: '/student/history', label: 'Rekod & Sejarah', icon: History },
  { href: '/student/profile', label: 'Profil Saya', icon: UserRound },
]

export default function StudentTopBar() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isDrawerOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDrawerOpen])

  const isHomePage = pathname === '/student' || pathname === '/student/'

  return (
    <>
      {/* 1. Bar Atas: Koin & Streak/Misi (Hanya di Halaman Utama) Statik Disusun Menegak di Atas Kanan */}
      <div className="fixed top-3.5 right-4 sm:top-5 sm:right-7 z-40 select-none flex flex-col items-end gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <StudentCoinMissionWidget />
        </div>
        {isHomePage && (
          <div className="pointer-events-auto">
            <DailyStreakMissionBadge />
          </div>
        )}
      </div>

      {/* 2. Butang Menu Terapung Mudah Alih (Khusus Mobile Sahaja, Desktop Menggunakan Sidebar) */}
      <div className="fixed top-3.5 left-4 z-40 lg:hidden">
        <button
          type="button"
          aria-label={isDrawerOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setIsDrawerOpen((open) => !open)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md hover:bg-slate-50 transition"
        >
          {isDrawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* 3. Laci Menu Mudah Alih (Mobile Drawer) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-2xs"
          />
          <aside
            id="student-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi pelajar"
            className="absolute inset-y-0 right-0 flex w-[min(84vw,340px)] flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-lg font-black text-slate-900">Menu Navigasi</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1.5 overflow-y-auto">
              {studentLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 stroke-[2.5]" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto border-t border-slate-100 pt-5">
              <LogoutButton variant="student" buttonClassName="w-full justify-center" />
            </div>
          </aside>
        </div>
      )}

      {/* 4. Dermaga Aplikasi Bawah untuk Mudah Alih (Mobile Bottom Dock) */}
      <nav
        aria-label="Navigasi mudah alih bawah"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-around gap-1.5 rounded-full border-2 border-blue-200 bg-white/95 px-3 py-1.5 shadow-2xl backdrop-blur-md lg:hidden w-[min(94vw,380px)]"
      >
        {studentLinks.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center justify-center rounded-xl p-1.5 transition-all duration-150 ${
                active
                  ? 'bg-blue-600 text-white font-black shadow-md scale-105'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Icon className="h-4 w-4 stroke-[2.5]" />
              <span className="text-[9px] font-bold mt-0.5 leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
