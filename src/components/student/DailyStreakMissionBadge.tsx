'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Flame,
  Sparkles,
  Coins,
  CheckCircle2,
  X,
  Calendar,
  BookOpen,
  Gamepad2,
  Trophy,
  ArrowRight,
  Gift,
  Target,
  Star,
  ChevronRight,
  ChevronLeft,
  Check,
  Lock,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

interface DailyStreakMissionBadgeProps {
  initialClaimedDates?: string[]
  streakDays?: number
  initialCoins?: number
  className?: string
}

const DAILY_REWARDS_TABLE = [
  { dayIndex: 0, dayName: 'Isnin', shortName: 'Isn', coinReward: 10, highlight: 'Permulaan Minggu' },
  { dayIndex: 1, dayName: 'Selasa', shortName: 'Sel', coinReward: 15, highlight: 'Momentum Belajar' },
  { dayIndex: 2, dayName: 'Rabu', shortName: 'Rab', coinReward: 20, highlight: 'Pertengahan Minggu' },
  { dayIndex: 3, dayName: 'Khamis', shortName: 'Kha', coinReward: 25, highlight: 'Semangat Konsisten' },
  { dayIndex: 4, dayName: 'Jumaat', shortName: 'Jum', coinReward: 30, highlight: 'Bonus Hujung Minggu' },
  { dayIndex: 5, dayName: 'Sabtu', shortName: 'Sab', coinReward: 40, highlight: 'Pahlawan Arked' },
  { dayIndex: 6, dayName: 'Ahad', shortName: 'Aha', coinReward: 50, highlight: '👑 Jackpot Mingguan' },
]

export interface DailyMission {
  id: string
  title: string
  description: string
  icon: typeof BookOpen
  iconBg: string
  iconColor: string
  coinReward: number
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
    completed: false,
    claimed: false,
    actionUrl: '/student/history',
    actionLabel: 'Rekod Aktiviti',
  },
]

export default function DailyStreakMissionBadge({
  initialClaimedDates = [],
  streakDays = 1,
  initialCoins = 200,
  className = '',
}: DailyStreakMissionBadgeProps) {
  // Modal states are completely separated
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false)
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false)
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  const [claimedDates, setClaimedDates] = useState<string[]>(initialClaimedDates)
  const [currentStreak, setCurrentStreak] = useState<number>(streakDays)
  const [coins, setCoins] = useState<number>(initialCoins)
  const [missions, setMissions] = useState<DailyMission[]>(INITIAL_MISSIONS)

  const [isClaimingStreak, setIsClaimingStreak] = useState(false)
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null)
  const [justClaimedReward, setJustClaimedReward] = useState<{ label: string; coins: number } | null>(null)

  // Fetch real-time data from rewards API
  useEffect(() => {
    let isMounted = true

    async function loadRewardsData() {
      try {
        const res = await fetch('/api/student/rewards')
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          if (Array.isArray(json.data.claimedDailyDates)) {
            setClaimedDates(json.data.claimedDailyDates)
          }
          if (typeof json.data.coins === 'number') {
            setCoins(json.data.coins)
          }
          if (typeof json.data.streakDays === 'number') {
            setCurrentStreak(json.data.streakDays)
          }

          const claimedIds: string[] = json.data.claimedMissions || []
          const completedIds: string[] = json.data.completedMissions || []

          setMissions((prev) =>
            prev.map((m) => ({
              ...m,
              completed: completedIds.includes(m.id),
              claimed: claimedIds.includes(m.id),
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load rewards data:', err)
      }
    }

    loadRewardsData()

    const handleCoinsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ coins: number }>
      if (customEvent.detail && typeof customEvent.detail.coins === 'number') {
        setCoins(customEvent.detail.coins)
      }
    }
    window.addEventListener('student_coins_updated', handleCoinsChanged)

    return () => {
      isMounted = false
      window.removeEventListener('student_coins_updated', handleCoinsChanged)
    }
  }, [])

  // Date and Week calculation
  const now = new Date()
  const jsDay = now.getDay() // 0 = Ahad, 1 = Isnin, ..., 6 = Sabtu
  const currentDayIndex = (jsDay + 6) % 7 // 0 = Isnin, 1 = Selasa, ..., 6 = Ahad

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - currentDayIndex)
  startOfWeek.setHours(0, 0, 0, 0)

  const monthNamesMs = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']

  const weekDays = DAILY_REWARDS_TABLE.map((item) => {
    const dayDate = new Date(startOfWeek)
    dayDate.setDate(startOfWeek.getDate() + item.dayIndex)
    const dateNum = dayDate.getDate()
    const monthStr = monthNamesMs[dayDate.getMonth()]
    const isoDate = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`

    const isToday = item.dayIndex === currentDayIndex
    const isPast = item.dayIndex < currentDayIndex
    const isFuture = item.dayIndex > currentDayIndex
    const isClaimed = claimedDates.includes(isoDate)

    return {
      ...item,
      dateNum,
      monthStr,
      isoDate,
      isToday,
      isPast,
      isFuture,
      isClaimed,
    }
  })

  const todayDayItem = weekDays[currentDayIndex]
  const isTodayStreakClaimed = todayDayItem?.isClaimed ?? false

  // Individual Alert Counts
  const hasStreakAlert = !isTodayStreakClaimed
  const completedMissionsCount = missions.filter((m) => m.completed).length
  const unclaimedMissionsCount = missions.filter((m) => m.completed && !m.claimed).length
  const hasMissionAlert = unclaimedMissionsCount > 0

  // Handle claiming streak login reward
  const handleClaimStreak = async () => {
    if (!todayDayItem || isTodayStreakClaimed || isClaimingStreak) return

    setIsClaimingStreak(true)
    gameSound.playVictory()

    const newClaimed = [...claimedDates, todayDayItem.isoDate]
    const newCoins = coins + todayDayItem.coinReward
    setClaimedDates(newClaimed)
    setCoins(newCoins)
    setJustClaimedReward({ label: `Log Masuk Hari ${todayDayItem.dayName}`, coins: todayDayItem.coinReward })

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_daily_login',
          dateStr: todayDayItem.isoDate,
          coinReward: todayDayItem.coinReward,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setCoins(json.data.coins)
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to claim daily login streak:', err)
    } finally {
      setIsClaimingStreak(false)
      setTimeout(() => setJustClaimedReward(null), 3000)
    }
  }

  // Handle claiming mission reward
  const handleClaimMission = async (missionId: string, reward: number, title: string) => {
    if (claimingMissionId) return
    setClaimingMissionId(missionId)
    gameSound.playCorrect()

    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)))
    const newCoins = coins + reward
    setCoins(newCoins)
    setJustClaimedReward({ label: title, coins: reward })

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
        setCoins(json.data.coins)
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to claim mission reward:', err)
    } finally {
      setClaimingMissionId(null)
      setTimeout(() => setJustClaimedReward(null), 3000)
    }
  }

  return (
    <>
      {/* 2 ASINGKAN BUTTON: 1 UNTUK STREAK & 1 UNTUK MISI (BOLEH OPEN & CLOSE) */}
      {!isWidgetOpen ? (
        <div className={`flex items-center justify-end gap-2 ${className || ''}`}>
          <button
            type="button"
            onClick={() => {
              gameSound.playTileClick()
              setIsWidgetOpen(true)
            }}
            aria-label="Buka Misi"
            title="Buka Misi"
            className="group relative flex items-center gap-1.5 sm:gap-2 rounded-2xl border-2 border-blue-400 bg-white/95 px-3 py-1.5 sm:py-2 text-slate-900 font-black shadow-md shadow-blue-500/15 backdrop-blur-md transition-all hover:scale-105 hover:border-blue-600 active:scale-95 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          >
            <span className="text-xs sm:text-sm font-black text-slate-900">
              Misi
            </span>
            {(hasStreakAlert || hasMissionAlert) && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
            <ChevronLeft className="h-3.5 w-3.5 text-blue-600 ml-0.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <div className={`flex flex-wrap items-center justify-end gap-2 ${className || ''} animate-in fade-in duration-200`}>
          {/* ======================================================== */}
          {/* BUTTON 1: KOIN STREAK (WARNA JINGGA/EMAS BERAPI)         */}
          {/* ======================================================== */}
          <button
            type="button"
            onClick={() => {
              gameSound.playTileClick()
              setIsStreakModalOpen(true)
            }}
            aria-label="Buka Koin Streak Log Masuk"
            className="group relative flex items-center gap-1.5 sm:gap-2 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-3 py-1.5 sm:py-2 text-slate-950 font-black shadow-md shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-white active:scale-95 cursor-pointer"
          >
            {/* Flame Icon with Pulse Animation */}
            <span className="text-lg sm:text-2xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
              🔥
            </span>

            <div className="text-left leading-none">
              <div className="text-[11px] sm:text-xs font-black text-slate-950 tracking-tight">
                Streak
              </div>
              <div className="mt-0.5 text-[9px] sm:text-[10px] font-extrabold text-amber-950">
                {currentStreak} Hari
              </div>
            </div>

            {/* Alert Badge if today is unclaimed */}
            {hasStreakAlert && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex items-center gap-0.5 rounded-full border border-white bg-rose-500 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black text-white shadow-xs">
                  Tuntut!
                </span>
              </span>
            )}
          </button>

          {/* ======================================================== */}
          {/* BUTTON 2: MISI HARIAN (WARNA BIRU/INDIGO ELEKTRIK)       */}
          {/* ======================================================== */}
          <button
            type="button"
            onClick={() => {
              gameSound.playTileClick()
              setIsMissionModalOpen(true)
            }}
            aria-label="Buka Misi Harian & Cabaran"
            className="group relative flex items-center gap-1.5 sm:gap-2 rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-3 py-1.5 sm:py-2 text-white font-black shadow-md shadow-blue-600/25 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-white active:scale-95 cursor-pointer"
          >
            {/* Mission Target Icon with Bounce Animation */}
            <span className="text-lg sm:text-2xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
              🎯
            </span>

            <div className="text-left leading-none">
              <div className="text-[11px] sm:text-xs font-black text-white tracking-tight">
                Misi Harian
              </div>
              <div className="mt-0.5 text-[9px] sm:text-[10px] font-extrabold text-sky-100">
                {completedMissionsCount}/{missions.length} Selesai
              </div>
            </div>

            {/* Alert Badge if completed mission is ready to claim */}
            {hasMissionAlert && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex items-center gap-0.5 rounded-full border border-white bg-amber-400 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black text-slate-950 shadow-xs">
                  <Sparkles className="h-2 w-2" />
                  {unclaimedMissionsCount} Sedia!
                </span>
              </span>
            )}
          </button>

          {/* ======================================================== */}
          {/* BUTTON 3: CLOSE / COLLAPSE BUTTON                        */}
          {/* ======================================================== */}
          <button
            type="button"
            onClick={() => {
              gameSound.playTileClick()
              setIsWidgetOpen(false)
            }}
            aria-label="Tutup Misi"
            title="Tutup / Sembunyikan"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 text-slate-400 hover:text-slate-800 hover:bg-slate-100 shadow-xs transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: KHAS UNTUK STREAK & LOG MASUK HARIAN           */}
      {/* ======================================================== */}
      {isStreakModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-streak-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsStreakModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg my-auto overflow-hidden rounded-3xl border-2 border-orange-300 bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[88vh] flex flex-col">
            
            {/* Header: Fiery Flame Theme */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 p-4 sm:p-5 text-white text-left shrink-0">
              <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-yellow-300/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-orange-400/30 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-md border-2 border-white/30 backdrop-blur-xs">
                    🔥
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-orange-100">
                      <Sparkles className="h-3 w-3 text-yellow-200" /> Log Masuk Berturut-turut
                    </div>
                    <h2 id="modal-streak-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                      Koin Rentak Streak
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Pill in Header */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/25 bg-black/15 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-100 block">Baki Koin</span>
                    <strong className="text-lg font-black text-white">
                      {coins.toLocaleString()} Koin
                    </strong>
                  </div>
                </div>

                <span className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-black text-white">
                  🔥 {currentStreak} Hari Aktif
                </span>
              </div>

              {/* Toast Claim feedback */}
              {justClaimedReward && (
                <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-300 text-slate-950 px-4 py-2 text-center text-xs font-black shadow-lg animate-in zoom-in duration-150">
                  🎉 Tahniah! +{justClaimedReward.coins} Koin telah berjaya dituntut!
                </div>
              )}
            </div>

            {/* Modal Body: Streak Claim Card & 7-Day Calendar */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f0f6fc] space-y-4">
              {/* Today's Action Card */}
              <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50/70 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md text-2xl">
                      🔥
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          Ganjaran Hari {todayDayItem?.dayName}
                        </h3>
                        <span className="rounded-full bg-orange-100 border border-orange-300 px-2 py-0.2 text-[10px] font-black text-orange-900">
                          +{todayDayItem?.coinReward} Koin
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {todayDayItem?.dateNum} {todayDayItem?.monthStr} • Log masuk setiap hari untuk koin percuma
                      </p>
                    </div>
                  </div>

                  <div>
                    {isTodayStreakClaimed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-black text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Hari Ini Selesai
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isClaimingStreak}
                        onClick={handleClaimStreak}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:brightness-110 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-amber-950" />
                        <span>Tuntut +{todayDayItem?.coinReward} Koin!</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 7-Day Calendar Strip */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-orange-600" /> Kalendar Rentak Minggu Ini
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    👑 Ahad Jackpot (+50)
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                  {weekDays.map((d) => (
                    <div
                      key={d.dayIndex}
                      className={`flex flex-col items-center justify-between rounded-xl p-2 transition-all ${
                        d.isToday
                          ? 'border-2 border-orange-400 bg-orange-50 shadow-xs'
                          : d.isClaimed
                          ? 'border border-emerald-200 bg-emerald-50/60'
                          : 'border border-slate-100 bg-slate-50/60 opacity-70'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{d.shortName}</span>
                      <span className="text-xs font-black text-slate-900 my-0.5">{d.dateNum}</span>
                      <div className="mt-1">
                        {d.isClaimed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : d.isToday ? (
                          <span className="text-sm animate-bounce">🪙</span>
                        ) : d.dayIndex === 6 ? (
                          <span className="text-sm">👑</span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-700">+{d.coinReward}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white p-3.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-orange-500" />
                <span>Kekalkan rentak setiap hari untuk mengumpul bonus!</span>
              </span>
              <button
                type="button"
                onClick={() => setIsStreakModalOpen(false)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: KHAS UNTUK MISI HARIAN & CABARAN               */}
      {/* ======================================================== */}
      {isMissionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-missions-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMissionModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg my-auto overflow-hidden rounded-3xl border-2 border-blue-300 bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[88vh] flex flex-col">
            
            {/* Header: Electric Blue Quest Theme */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-600 to-sky-600 p-4 sm:p-5 text-white text-left shrink-0">
              <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-sky-300/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-indigo-400/30 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-md border-2 border-white/30 backdrop-blur-xs">
                    🎯
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-100">
                      <Sparkles className="h-3 w-3 text-amber-300" /> Cabaran Harian Pelajar
                    </div>
                    <h2 id="modal-missions-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                      Misi Harian Exploria
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMissionModalOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Bar in Header */}
              <div className="mt-4 rounded-2xl border border-white/25 bg-black/15 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-black text-white mb-1.5">
                  <span>Kemajuan Tugasan Hari Ini</span>
                  <span>{completedMissionsCount} / {missions.length} Selesai</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completedMissionsCount / missions.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Toast Claim feedback */}
              {justClaimedReward && (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-400 text-slate-950 px-4 py-2 text-center text-xs font-black shadow-lg animate-in zoom-in duration-150">
                  🎉 Tahniah! +{justClaimedReward.coins} Koin telah berjaya dituntut untuk {justClaimedReward.label}!
                </div>
              )}
            </div>

            {/* Modal Body: Missions List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f0f6fc] space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Senarai Misi Hari Ini
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Diperbaharui setiap hari
                </span>
              </div>

              {missions.map((m) => {
                const Icon = m.icon
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 p-3.5 transition-all ${
                      m.claimed
                        ? 'border-slate-200 bg-white/70 opacity-70'
                        : m.completed
                        ? 'border-amber-300 bg-amber-50/70 shadow-xs'
                        : 'border-blue-100 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.iconBg} ${m.iconColor} shadow-2xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">{m.title}</h3>
                          <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.2 text-[10px] font-black text-amber-900">
                            +{m.coinReward} 🪙
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Action status */}
                    <div className="sm:shrink-0 flex items-center justify-end">
                      {m.claimed ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Selesai
                        </span>
                      ) : m.completed ? (
                        <button
                          type="button"
                          disabled={claimingMissionId === m.id}
                          onClick={() => handleClaimMission(m.id, m.coinReward, m.title)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-xs hover:shadow-sm active:scale-95 transition cursor-pointer"
                        >
                          <span>🪙</span> Tuntut +{m.coinReward}
                        </button>
                      ) : (
                        <Link
                          href={m.actionUrl}
                          onClick={() => setIsMissionModalOpen(false)}
                          className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                        >
                          <span>{m.actionLabel}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white p-3.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-amber-500" />
                <span>Kumpul koin untuk tebus avatar di kedai!</span>
              </span>
              <Link
                href="/student/redeem"
                onClick={() => setIsMissionModalOpen(false)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 transition"
              >
                <span>Kedai Tebus</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
