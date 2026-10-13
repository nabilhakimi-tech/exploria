'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Gamepad2,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

export interface DailyMission {
  id: string
  title: string
  description: string
  icon: typeof BookOpen
  iconBg: string
  iconColor: string
  coinReward: number
  total: number
  completed: boolean
  claimed: boolean
  actionUrl: string
  actionLabel: string
}

const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Ulangkaji 1 Nota Subjek',
    description: 'Baca dan fahami 1 topik nota padat di Pusat Pembelajaran.',
    icon: BookOpen,
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    coinReward: 50,
    total: 1,
    completed: false,
    claimed: false,
    actionUrl: '/student/quizzes',
    actionLabel: 'Pusat Pembelajaran',
  },
  {
    id: 'm2',
    title: 'Main 1 Pusingan Game Arena',
    description: 'Latih audio sebutan di Spelling Hive atau tembak meteor sifir.',
    icon: Gamepad2,
    iconBg: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
    coinReward: 75,
    total: 1,
    completed: false,
    claimed: false,
    actionUrl: '/student/games',
    actionLabel: 'Game Arcade',
  },
  {
    id: 'm3',
    title: 'Skor Peperiksaan 80%+',
    description: 'Capai markah 80% ke atas dalam kuiz atau peperiksaan rasmi.',
    icon: Trophy,
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    coinReward: 120,
    total: 1,
    completed: false,
    claimed: false,
    actionUrl: '/student/competition',
    actionLabel: 'Peperiksaan Rasmi',
  },
  {
    id: 'm4',
    title: 'Rentak Streak 3 Hari',
    description: 'Kekalkan kehadiran belajar sekurang-kurangnya 3 hari berturut-turut.',
    icon: Flame,
    iconBg: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
    coinReward: 100,
    total: 3,
    completed: false,
    claimed: false,
    actionUrl: '/student/history',
    actionLabel: 'Rekod Aktiviti',
  },
]

export default function StudentHomeDailyMissions() {
  const [missions, setMissions] = useState<DailyMission[]>(INITIAL_MISSIONS)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [justClaimedReward, setJustClaimedReward] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMissions() {
      try {
        const res = await fetch('/api/student/rewards')
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          const claimedIds: string[] = json.data.claimedMissions || []
          const completedIds: string[] = json.data.completedMissions || []

          setMissions((prev) =>
            prev.map((m) => {
              const isCompleted = completedIds.includes(m.id)
              const isClaimed = claimedIds.includes(m.id)
              return {
                ...m,
                completed: isCompleted,
                claimed: isClaimed,
              }
            })
          )
        }
      } catch (err) {
        console.error('Failed to load daily missions:', err)
      }
    }

    loadMissions()

    return () => {
      isMounted = false
    }
  }, [])

  const handleClaim = async (missionId: string, reward: number) => {
    if (claimingId) return
    setClaimingId(missionId)
    gameSound.playCorrect()
    setJustClaimedReward(reward)

    // Optimistic UI update
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    )

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_mission',
          missionId,
          coinReward: reward,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to claim mission reward:', err)
    } finally {
      setClaimingId(null)
      setTimeout(() => setJustClaimedReward(null), 3000)
    }
  }

  const completedCount = missions.filter((m) => m.completed).length
  const claimedCount = missions.filter((m) => m.claimed).length
  const progressPercent = Math.round((claimedCount / missions.length) * 100)

  return (
    <section aria-label="Misi Harian & Cabaran" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span>Misi Harian &amp; Cabaran Hari Ini</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Selesaikan tugasan harian untuk mengumpul koin emas percuma
          </p>
        </div>

        {/* Progress Tracker Pill */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kemajuan Hari Ini</div>
            <div className="text-xs font-black text-slate-800">
              {claimedCount} / {missions.length} Selesai
            </div>
          </div>
          <div className="h-2 w-24 sm:w-28 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Claim Feedback Banner */}
      {justClaimedReward !== null && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-slate-900 text-xs font-black flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <span className="text-base">🎉</span>
            <span>Tahniah! +{justClaimedReward} Koin Emas telah berjaya ditambah ke baki anda!</span>
          </span>
          <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black">
            +{justClaimedReward} 🪙
          </span>
        </div>
      )}

      {/* Grid of Missions */}
      <div className="grid gap-3 sm:gap-3.5 md:grid-cols-2">
        {missions.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                m.claimed
                  ? 'border-slate-200 bg-white/70 opacity-80'
                  : m.completed
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50/80 to-white shadow-xs hover:shadow-md'
                  : 'border-slate-200/90 bg-white hover:border-blue-200 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${m.iconBg} ${m.iconColor} shadow-2xs`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {m.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 shrink-0">
                      +{m.coinReward} 🪙
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  {m.claimed
                    ? 'Ganjaran telah dikreditkan'
                    : m.completed
                    ? 'Tugasan siap! Sedia dituntut'
                    : 'Belum selesai'}
                </span>

                <div>
                  {m.claimed ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Selesai
                    </span>
                  ) : m.completed ? (
                    <button
                      type="button"
                      disabled={claimingId === m.id}
                      onClick={() => handleClaim(m.id, m.coinReward)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-xs hover:shadow-sm active:scale-95 transition cursor-pointer"
                    >
                      <span>🪙</span> Tuntut +{m.coinReward} Koin
                    </button>
                  ) : (
                    <Link
                      href={m.actionUrl}
                      className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                    >
                      <span>{m.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
