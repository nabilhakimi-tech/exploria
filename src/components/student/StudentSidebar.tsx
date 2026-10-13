'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  House,
  Gamepad2,
  Trophy,
  BookOpen,
  ShoppingBag,
  Award,
  History,
  UserRound,
} from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

const primaryNavItems = [
  { href: '/student', label: 'Utama', icon: House },
  { href: '/student/quizzes', label: 'Pembelajaran', icon: BookOpen },
  { href: '/student/games', label: 'Game Arena', icon: Gamepad2 },
  { href: '/student/competition', label: 'Pertandingan', icon: Trophy },
  { href: '/student/achievements', label: 'Pencapaian', icon: Award },
]

const secondaryNavItems = [
  { href: '/student/redeem', label: 'Kedai Tebus', icon: ShoppingBag },
  { href: '/student/history', label: 'Rekod & Sejarah', icon: History },
  { href: '/student/profile', label: 'Profil Saya', icon: UserRound },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Navigasi Utama Pelajar"
      className="hidden lg:flex flex-col items-center justify-between w-32 xl:w-36 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200/80 py-6 z-40 select-none shadow-[2px_0_12px_rgba(0,0,0,0.03)]"
    >
      {/* 1. Logo at Top (Lebar & Selesa seperti Gambar 1) */}
      <div className="flex flex-col items-center px-2">
        <Link
          href="/student"
          className="flex items-center justify-center p-2 rounded-2xl hover:bg-blue-50/70 transition-transform active:scale-95 group"
          aria-label="Exploria Laman Utama"
        >
          <Image
            src="/logoexploria.png"
            alt="Exploria"
            width={120}
            height={50}
            priority
            className="h-9 xl:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      {/* 2. Middle Navigation Rail: Primary Group + Divider + Secondary Group */}
      <nav aria-label="Menu Ikon Utama" className="flex flex-col items-center gap-2.5 my-auto">
        {/* Primary Group */}
        {primaryNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex h-13 w-13 xl:h-14 xl:w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 scale-105'
                  : 'text-slate-400 hover:bg-blue-50/80 hover:text-blue-600 active:scale-95'
              }`}
            >
              <Icon className="h-6 w-6 xl:h-6.5 xl:w-6.5 stroke-[2.3]" />

              {/* Flyout Tooltip Label */}
              <span className="pointer-events-none absolute left-full ml-4 hidden group-hover:flex items-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-1 duration-150">
                {label}
              </span>
            </Link>
          )
        })}

        {/* Subtle Divider (Like Gambar 1) */}
        <div className="w-14 xl:w-16 h-px bg-slate-200/90 my-2" />

        {/* Secondary Group */}
        {secondaryNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex h-13 w-13 xl:h-14 xl:w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 scale-105'
                  : 'text-slate-400 hover:bg-blue-50/80 hover:text-blue-600 active:scale-95'
              }`}
            >
              <Icon className="h-6 w-6 xl:h-6.5 xl:w-6.5 stroke-[2.3]" />

              {/* Flyout Tooltip Label */}
              <span className="pointer-events-none absolute left-full ml-4 hidden group-hover:flex items-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-1 duration-150">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 3. Bottom: Logout Button (Like Gambar 1) */}
      <div className="mt-auto pt-3 flex flex-col items-center">
        <LogoutButton variant="sidebar" buttonClassName="w-16 xl:w-20" />
      </div>
    </aside>
  )
}
