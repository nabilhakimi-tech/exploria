'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Crown,
  Flame,
  Medal,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Award,
  Zap,
  Loader2,
} from 'lucide-react'

interface ChildData {
  id: string
  fullName: string
  schoolType: string
  grade: string
  xp: number
  level: number
  avatarUrl: string
}

interface AwardData {
  id: string
  type: string
  title: string
  description: string
  score: number
  competitionTitle: string
  awardedAt: string
}

const baseBadges = [
  { id: 'b1', title: 'Penjelajah Baru', description: 'Mulakan pengembaraan pembelajaran', tier: 'Gangsa', minXp: 100, icon: Rocket, color: 'from-blue-600 to-blue-800' },
  { id: 'b2', title: 'Ahli Matematik', description: 'Selesaikan kuiz & sifir pantas', tier: 'Perak', minXp: 300, icon: Brain, color: 'from-blue-500 to-sky-600' },
  { id: 'b3', title: 'Genius Sains', description: 'Terokai sains dan dunia angkasa', tier: 'Emas', minXp: 600, icon: Sparkles, color: 'from-blue-600 to-blue-400' },
  { id: 'b4', title: 'Rajin Belajar', description: 'Kumpul lebih 1,000 XP keseluruhan', tier: 'Gangsa', minXp: 1000, icon: BookOpen, color: 'from-slate-800 to-blue-900' },
  { id: 'b5', title: 'Streak Konsisten', description: 'Kekalkan momentum belajar berturut-turut', tier: 'Perak', minXp: 1500, icon: Flame, color: 'from-blue-700 to-blue-500' },
  { id: 'b6', title: 'Juara Pertandingan', description: 'Menangi pingat pertandingan rasmi', tier: 'Emas', minXp: 2000, icon: Crown, color: 'from-blue-900 to-blue-700' },
  { id: 'b7', title: 'Pengumpul Bintang', description: 'Kumpulkan bintang prestasi cemerlang', tier: 'Perak', minXp: 2500, icon: Star, color: 'from-sky-500 to-blue-600' },
  { id: 'b8', title: 'Pejuang Berani', description: 'Kuasai soalan tahap tinggi', tier: 'Gangsa', minXp: 3000, icon: Target, color: 'from-slate-900 to-blue-800' },
  { id: 'b9', title: 'Penakluk Kuiz', description: 'Menghabiskan pelbagai modul', tier: 'Emas', minXp: 3500, icon: Trophy, color: 'from-blue-600 to-blue-900' },
]

export default function AchievementsPage() {
  const [child, setChild] = useState<ChildData | null>(null)
  const [awards, setAwards] = useState<AwardData[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/student/achievements')
        const json = await res.json()
        if (json.success) {
          setChild(json.data.child)
          setAwards(json.data.awards || [])
          setRecent(json.data.recent || [])
        }
      } catch (err) {
        console.error('Failed to fetch achievements:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAchievements()
  }, [])

  const currentXp = child?.xp || 0
  const currentLevel = child?.level || 1
  const xpNeeded = currentLevel * 250
  const xpProgress = Math.min(Math.round(((currentXp % 250) / 250) * 100), 100)

  const badges = baseBadges.map((badge) => {
    const unlocked = currentXp >= badge.minXp
    const progress = Math.min(Math.round((currentXp / badge.minXp) * 100), 100)
    return {
      ...badge,
      unlocked,
      progress,
    }
  })

  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-16">
      
      {/* Banner Tajuk Pencapaian - Saiz Selesa & Seimbang (75% Skala Asal) */}
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

          {/* Baris 2: Tajuk Bersih & Rekod Lencana (Dikekalkan Seperti Gambar 1) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Pencapaian &amp; Lencana
              </h1>
            </div>

            {/* Stat Chip Lencana (Dikekalkan Seperti Gambar 1) */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-center backdrop-blur-md shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Award className="h-3 w-3 text-white" /> Lencana Dibuka
                </div>
                <div className="text-base sm:text-lg font-black text-white">{unlockedCount} / {badges.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-slate-600">Memuatkan pencapaian dari Supabase...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            
            {/* Left Sidebar: XP Level Card */}
            <aside className="space-y-4">
              <section className="rounded-3xl border border-blue-100 bg-white p-5 text-center shadow-xs">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-3xl shadow-md border-4 border-white text-white">
                  {child?.avatarUrl || '🧑‍🚀'}
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-900">{child?.fullName || 'Pelajar Exploria'}</h2>
                <p className="text-xs font-semibold text-blue-600">Tahap {currentLevel} Penjelajah</p>
                
                {/* XP Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Kemajuan XP</span>
                    <span className="text-blue-600 font-extrabold">{currentXp.toLocaleString()} XP</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-blue-50 border border-blue-100">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs border-t border-slate-100 pt-3">
                  <div className="rounded-xl bg-blue-50/60 p-2 border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Pingat & Sijil</span>
                    <strong className="text-blue-900 text-sm">{awards.length} Anugerah</strong>
                  </div>
                  <div className="rounded-xl bg-blue-50/60 p-2 border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Gred</span>
                    <strong className="text-blue-700 text-sm">{child?.grade || 'Darjah 4'}</strong>
                  </div>
                </div>
              </section>

              {/* Real Recent Performance */}
              {recent.length > 0 && (
                <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Rekod Kuiz Terkini
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {recent.map((rec, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-blue-50/50 p-2 border border-blue-100 font-medium">
                        <Star className="h-3.5 w-3.5 fill-blue-600 text-blue-600 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Award Badges Count */}
              {awards.length > 0 && (
                <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Anugerah Rasmi Diperoleh
                  </h3>
                  <div className="space-y-2">
                    {awards.map((a) => (
                      <div key={a.id} className="rounded-xl bg-blue-50/70 border border-blue-200/70 p-2.5 text-xs">
                        <strong className="block text-slate-900">{a.title}</strong>
                        <span className="text-slate-500 text-[11px]">{a.description}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            {/* Right Section: Badges Grid */}
            <section className="space-y-4">
              <div className="rounded-3xl border border-blue-100 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Semua Lencana</h2>
                  <span className="text-xs text-slate-500">
                    Buka kunci dengan menaikkan XP melalui kuiz
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {badges.map((badge) => {
                    const Icon = badge.icon
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-2xl border p-4 transition ${
                          badge.unlocked
                            ? 'border-blue-200 bg-white shadow-xs'
                            : 'border-slate-100 bg-slate-50/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-xs`}
                          >
                            <Icon className="h-6 w-6" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{badge.title}</h3>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Tahap {badge.tier} · {badge.minXp} XP
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {badge.description}
                        </p>

                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{badge.unlocked ? 'Dibuka!' : 'Kemajuan'}</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div>
                    <h4 className="font-bold text-blue-950 text-xs sm:text-sm">Mahu membuka lebih banyak lencana?</h4>
                    <p className="text-[11px] text-blue-700">Setiap kuiz dan pusingan permainan menyumbang mata XP terus ke profil anda.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/student/quizzes" className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition">
                      Jawab Kuiz
                    </Link>
                    <Link href="/student/games" className="rounded-xl border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition">
                      Main Game
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  )
}
