'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Flame,
  Medal,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  UserRound,
  GraduationCap,
  Sparkles,
  BookOpen,
  Loader2,
} from 'lucide-react'

interface StudentProfile {
  id: string
  fullName: string
  schoolType: string
  grade: string
  schoolName: string
  xp: number
  level: number
  avatarUrl: string
  totalQuizzes: number
  passedQuizzes: number
  averageScore: number
  totalAwards: number
  streakDays: number
  createdAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/student/profile')
        const json = await res.json()
        if (json.success) {
          setProfile(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const joinedMonthYear = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })
    : 'Oktober 2026'

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-16">
      
      {/* Banner Tajuk Profil Pelajar - Saiz Selesa & Seimbang (75% Skala Asal) */}
      <header className="relative border-b border-blue-200 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#1d4ed8] text-white px-5 py-6 sm:px-8 sm:py-7 shadow-md overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-88 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-88 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl pr-28 sm:pr-36">
          {/* Baris 1: Butang Kembali */}
          <div className="mb-3">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Home</span>
            </Link>
          </div>

          {/* Baris 2: Tajuk Utama Profil Pelajar */}
          <div className="flex items-center gap-3">
            <UserRound className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Profil Pelajar
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-slate-600">Memuatkan data dari Supabase...</span>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            
            {/* Left Sidebar: Profile Card & Stats */}
            <aside className="space-y-4">
              {/* Identity Card */}
              <section className="rounded-3xl border border-blue-100 bg-white p-5 text-center shadow-xs">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-4xl shadow-md border-4 border-white text-white">
                  {profile.avatarUrl || '🧑‍🚀'}
                  <span className="absolute -bottom-1 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow">
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </span>
                </div>

                <h2 className="mt-3.5 text-xl font-bold text-slate-900">{profile.fullName}</h2>
                <p className="text-xs font-semibold text-blue-600">Tahap {profile.level} Penjelajah Ilmu</p>
                
                <div className="mt-2 flex items-center justify-center gap-1">
                  {Array.from({ length: Math.min(profile.level, 5) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-blue-600 text-blue-600" />
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1">
                  <p>Sekolah: <strong className="text-slate-800">{profile.schoolName || `${profile.schoolType} ${profile.grade}`}</strong></p>
                  <p>Gred: <strong className="text-slate-800">{profile.grade}</strong></p>
                  <p>Status: <strong className="text-blue-700 font-bold">Pelajar Aktif</strong></p>
                </div>

                <Link
                  href="/student/redeem"
                  className="duo-btn-blue mt-4 w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" /> Tukar Citarasa Avatar &amp; Bingkai
                </Link>

                <Link
                  href="/student/achievements"
                  className="duo-btn-white mt-2 w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Trophy className="h-3.5 w-3.5 text-blue-600" /> Lihat Koleksi Lencana ({profile.totalAwards})
                </Link>
              </section>

              {/* Stats Summary */}
              <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Statistik Pembelajaran
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-100">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <Target className="h-4 w-4 text-blue-600" /> Tahap Semasa
                    </span>
                    <span className="font-bold text-slate-900">Tahap {profile.level}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-100">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <Star className="h-4 w-4 text-blue-600" /> Jumlah XP
                    </span>
                    <span className="font-bold text-blue-700">{profile.xp.toLocaleString()} XP</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-100">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <Flame className="h-4 w-4 text-blue-600" /> Rentak Streak
                    </span>
                    <span className="font-bold text-blue-700">{profile.streakDays} Hari Berturut</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-100">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <BookOpen className="h-4 w-4 text-blue-600" /> Kuiz Dijawab
                    </span>
                    <span className="font-bold text-blue-700">{profile.totalQuizzes} Kuiz ({profile.averageScore}% Purata)</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-100">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <CalendarDays className="h-4 w-4 text-blue-600" /> Mula Mendaftar
                    </span>
                    <span className="font-bold text-slate-800">{joinedMonthYear}</span>
                  </div>
                </div>
              </section>
            </aside>

            {/* Right Main Section: Real Notifications & Highlights */}
            <section className="space-y-4">
              
              <div className="rounded-3xl border border-blue-100 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Aktiviti & Makluman Terkini</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    Kemaskini Database
                  </span>
                </div>

                <div className="space-y-3">
                  <article className="flex items-start gap-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 transition">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-xs border border-blue-100">
                      🏆
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">Kemajuan Pembelajaran</h3>
                        <span className="text-[10px] font-semibold text-blue-800">
                          Terkini
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                        Anda telah mengumpul <strong>{profile.xp} XP</strong> dan menamatkan <strong>{profile.totalQuizzes}</strong> aktiviti kuiz dengan <strong>{profile.totalAwards}</strong> anugerah sijil/pingat!
                      </p>
                    </div>
                  </article>

                  <article className="flex items-start gap-3.5 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 transition">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-xs border border-sky-100">
                      🚀
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">Pertandingan & Kuiz Rasmi</h3>
                        <span className="text-[10px] font-semibold text-sky-800">
                          Aktif
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                        Sertai pertandingan rasmi terbuka untuk melayakkan diri mendapat sijil berbingkai dan pingat eksklusif Exploria.
                      </p>
                    </div>
                  </article>
                </div>
              </div>

              {/* Motivational Banner */}
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#1d4ed8] p-5 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
                      🔥
                    </span>
                    <div>
                      <h3 className="font-bold text-base">Kekalkan Momentum Belajar!</h3>
                      <p className="text-xs text-blue-100 mt-0.5">
                        Selesaikan kuiz atau cabaran Game hari ini untuk mengekalkan rekod streak {profile.streakDays} hari anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href="/student/quizzes"
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-50 transition"
                    >
                      Mula Kuiz
                    </Link>
                    <Link
                      href="/student/games"
                      className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 transition backdrop-blur-sm"
                    >
                      Main Game
                    </Link>
                  </div>
                </div>
              </div>

            </section>

          </div>
        ) : (
          <p className="text-center py-10 text-slate-500 text-sm">Profil tidak ditemui.</p>
        )}
      </main>
    </div>
  )
}
