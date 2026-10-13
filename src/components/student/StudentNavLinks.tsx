'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, BookOpen, Gamepad2, History, House, Menu, ShoppingBag, Trophy, UserRound, X } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import StudentCoinMissionWidget from '@/components/student/StudentCoinMissionWidget'

export type StudentSubjectId = 'math' | 'science' | 'history' | 'art' | 'english' | 'bahasa' | 'music' | 'geography' | 'coding'

const subjects: { id: StudentSubjectId; label: string; icon: string }[] = [
  { id: 'math', label: 'Matematik', icon: '🧮' },
  { id: 'science', label: 'Sains', icon: '🧪' },
  { id: 'history', label: 'Sejarah', icon: '🏛️' },
  { id: 'art', label: 'Seni', icon: '🎨' },
  { id: 'english', label: 'English', icon: '🔤' },
  { id: 'bahasa', label: 'B. Melayu', icon: '📖' },
  { id: 'music', label: 'Muzik', icon: '🎵' },
  { id: 'geography', label: 'Geografi', icon: '🌍' },
  { id: 'coding', label: 'Coding', icon: '💻' },
]

const studentLinks = [
  { href: '/student', label: 'Utama', icon: House },
  { href: '/student/quizzes', label: 'Pembelajaran', icon: BookOpen },
  { href: '/student/games', label: 'Game', icon: Gamepad2 },
  { href: '/student/competition', label: 'Pertandingan', icon: Trophy },
  { href: '/student/achievements', label: 'Pencapaian', icon: Award },
  { href: '/student/redeem', label: 'Tebus', icon: ShoppingBag },
  { href: '/student/history', label: 'Rekod', icon: History },
  { href: '/student/profile', label: 'Profil', icon: UserRound },
]

export default function StudentNavLinks() {
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

  return (
    <>
      <button
        type="button"
        aria-label={isDrawerOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={isDrawerOpen}
        aria-controls="student-mobile-drawer"
        onClick={() => setIsDrawerOpen((open) => !open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
      >
        {isDrawerOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
      </button>

      <nav className="hidden items-center justify-center gap-1 xl:gap-1.5 lg:flex" aria-label="Navigasi pelajar">
        {studentLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:px-3 xl:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600 ring-offset-2 ring-offset-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/45"
          />
          <aside
            id="student-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu pelajar"
            className="absolute inset-y-0 right-0 flex w-[min(84vw,340px)] flex-col bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-lg font-bold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Navigasi pelajar mudah alih" className="flex flex-col gap-2">
              {studentLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-600 ring-offset-2 ring-offset-white shadow-xs'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 stroke-[2.5]" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto border-t border-slate-100 pt-5 space-y-3">
              <div className="flex justify-center">
                <StudentCoinMissionWidget />
              </div>
              <LogoutButton variant="student" buttonClassName="w-full" />
            </div>
          </aside>
        </div>
      )}

      {/* Floating Bottom App Dock for Mobile & Tablet (Like Duolingo & Reference App) */}
      <nav
        aria-label="Navigasi mudah alih bawah"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-around gap-1.5 rounded-full border-2 border-blue-200 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md lg:hidden w-[min(94vw,400px)]"
      >
        {studentLinks.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center justify-center rounded-2xl p-2 transition-all duration-150 ${
                active
                  ? 'bg-blue-600 text-white font-black shadow-md scale-105'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Icon className="h-5 w-5 stroke-[2.5]" />
              <span className="text-[10px] font-bold mt-0.5 leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function StudentSubjectLinks({
  activeSubject,
  onSelect,
}: {
  activeSubject: StudentSubjectId | null
  onSelect: (subjectId: StudentSubjectId) => void
}) {
  return (
    <nav className="flex w-full max-w-full items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-1 sm:justify-around sm:gap-3" aria-label="Browse by subject">
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => onSelect(subject.id)}
          aria-pressed={activeSubject === subject.id}
          className={`flex min-h-11 shrink-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-lg px-2 text-[11px] font-medium transition-colors sm:text-sm ${activeSubject === subject.id ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 font-bold' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'}`}
        >
          <span className="text-[25px] leading-none sm:text-[30px]" aria-hidden="true">{subject.icon}</span>
          <span>{subject.label}</span>
        </button>
      ))}
    </nav>
  )
}
