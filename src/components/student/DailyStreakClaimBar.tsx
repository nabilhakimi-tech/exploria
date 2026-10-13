'use client'

import React, { useState, useEffect } from 'react'
import {
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Coins,
  AlertCircle,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

interface DailyStreakClaimBarProps {
  initialClaimedDates?: string[]
  streakDays?: number
  initialCoins?: number
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

export default function DailyStreakClaimBar({
  initialClaimedDates = [],
  streakDays = 1,
  initialCoins = 200,
}: DailyStreakClaimBarProps) {
  const [claimedDates, setClaimedDates] = useState<string[]>(initialClaimedDates)
  const [coins, setCoins] = useState<number>(initialCoins)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ dayName: string; coins: number } | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullOpen, setIsFullOpen] = useState(false)

  // Sync with API on mount or reload
  useEffect(() => {
    let isMounted = true
    async function fetchLatestData() {
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
        }
      } catch (err) {
        console.error('Failed to sync daily rewards data:', err)
      }
    }
    fetchLatestData()

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

  // Calculate current week (Monday to Sunday) based on real date
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
  const todayIso = todayDayItem?.isoDate
  const isTodayClaimed = todayIso ? claimedDates.includes(todayIso) : false

  const handleClaimToday = async (dayItem: typeof weekDays[0]) => {
    if (!dayItem.isToday || dayItem.isClaimed || isClaiming) return

    setIsClaiming(dayItem.isoDate)
    gameSound.playVictory()

    // Optimistic UI update
    const newClaimed = [...claimedDates, dayItem.isoDate]
    const newCoins = coins + dayItem.coinReward
    setClaimedDates(newClaimed)
    setCoins(newCoins)
    setToastMessage({ dayName: dayItem.dayName, coins: dayItem.coinReward })

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_daily_login',
          dateStr: dayItem.isoDate,
          coinReward: dayItem.coinReward,
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
      console.error('Failed to claim daily reward:', err)
    } finally {
      setIsClaiming(null)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  return (
    <div className="relative">
      {/* Toast Alert */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border-2 border-amber-400 bg-slate-950/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 text-2xl font-black shadow-md">
            🪙
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3.5 w-3.5" /> Ganjaran Log Masuk Dituntut!
            </p>
            <p className="text-sm font-black text-white">
              +{toastMessage.coins} Koin Emas untuk hari {toastMessage.dayName}!
            </p>
          </div>
        </aside>
      )}

      {/* 1. COMPACT MINIMALIST BAR (Lalai / Default) */}
      {!isFullOpen ? (
        <div className="rounded-3xl border-2 border-blue-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-blue-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Flame Icon, Koin Streak, Streak Days & Jumlah Yang Boleh Dituntut */}
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md">
                <Flame className="h-6 w-6 fill-current animate-pulse" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Koin Streak
                  </h3>
                  <span className="rounded-full bg-orange-100 border border-orange-300 px-2.5 py-0.5 text-[11px] font-black text-orange-900">
                    🔥 Streak {streakDays} Hari
                  </span>

                  {/* Jumlah Koin Yang Boleh Dituntut Hari Ini */}
                  {todayDayItem && !todayDayItem.isClaimed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-black text-amber-900 animate-pulse">
                      <Sparkles className="h-3 w-3 text-amber-700" />
                      +{todayDayItem.coinReward} Koin Boleh Dituntut!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Hari Ini Dituntut (+{todayDayItem?.coinReward || 10} Koin)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  {todayDayItem?.dayName}, {todayDayItem?.dateNum} {todayDayItem?.monthStr} • Log masuk setiap hari untuk koin percuma
                </p>
              </div>
            </div>

            {/* Right: Butang Tuntut Pantas & Butang Buka */}
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {/* Butang Tuntut Pantas Sekiranya Hari Ini Belum Dituntut */}
              {todayDayItem && !todayDayItem.isClaimed && (
                <button
                  type="button"
                  disabled={isClaiming === todayDayItem.isoDate}
                  onClick={() => handleClaimToday(todayDayItem)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 px-4 py-2 text-xs font-black text-slate-950 shadow-sm hover:shadow-md active:scale-95 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-900" /> Tuntut +{todayDayItem.coinReward} Koin!
                </button>
              )}

              {/* Butang Buka */}
              <button
                type="button"
                onClick={() => setIsFullOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-xs"
                title="Buka kalendar penuh"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Buka</span>
                <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. FULL EXPANDED 7-DAY VIEW (Apabila Dibuka Penuh) */
        <div className="rounded-3xl border-2 border-blue-200 bg-white p-5 sm:p-7 shadow-md transition-all duration-300 animate-in fade-in zoom-in-98 duration-200">
          {/* Top Header Row in Full View */}
          <div className="mb-5 border-b border-blue-50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md">
                  <Flame className="h-6 w-6 fill-current animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Ganjaran Koin Streak &amp; Log Masuk Harian
                    </h3>
                    <span className="rounded-full bg-orange-100 border border-orange-300 px-2.5 py-0.5 text-[11px] font-black text-orange-900">
                      🔥 Streak {streakDays} Hari
                    </span>
                    {/* Interactive Info Trigger (Tekan untuk lihat penerangan penuh) */}
                    <button
                      type="button"
                      onClick={() => setShowInfo((prev) => !prev)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-700 px-2.5 py-0.5 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                      title={showInfo ? 'Tutup maklumat' : 'Lihat maklumat ganjaran streak'}
                    >
                      <Info className="h-3 w-3 text-orange-600" />
                      <span>{showInfo ? 'Tutup Info' : 'Maklumat'}</span>
                      {showInfo ? (
                        <ChevronUp className="h-3 w-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side in Full View: Butang Kecilkan */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Butang Kecilkan (Kembali ke paparan minimalis) */}
                <button
                  type="button"
                  onClick={() => setIsFullOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-bold transition active:scale-95"
                  title="Kecilkan semula kepada paparan ringkas"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Kecilkan</span>
                </button>
              </div>
            </div>

            {/* Ayat Panjang Hanya Keluar Lepas Ditekan (On-Demand Info) */}
            {showInfo && (
              <div className="mt-3.5 pt-3 border-t border-orange-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-orange-50/90 to-amber-50/80 border border-orange-200 rounded-2xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-950 leading-relaxed font-medium">
                      Log masuk setiap hari untuk menuntut koin percuma! Sekiranya anda terlepas satu hari, ganjaran hari tersebut tidak dapat dituntut semula — tetapi anda tetap boleh menuntut ganjaran pada hari anda masuk kembali.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    className="text-orange-400 hover:text-orange-700 p-0.5 shrink-0 transition"
                    aria-label="Tutup Maklumat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7-Day Interactive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {weekDays.map((day) => {
              const isTodayNotClaimed = day.isToday && !day.isClaimed
              const isMissed = day.isPast && !day.isClaimed

              return (
                <div
                  key={day.isoDate}
                  className={`relative flex flex-col justify-between rounded-2xl p-3 text-center transition-all duration-200 border-2 ${
                    day.isClaimed
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                      : isTodayNotClaimed
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50/80 to-yellow-50/60 shadow-md ring-2 ring-amber-300/80 ring-offset-1'
                      : isMissed
                      ? 'border-slate-200 bg-slate-50/60 opacity-70'
                      : 'border-slate-200 bg-white/60'
                  }`}
                >
                  {/* Top Badge: Hari & Tarikh */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                      <span
                        className={`uppercase tracking-tight ${
                          day.isToday ? 'text-amber-800' : 'text-slate-600'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {day.dateNum} {day.monthStr}
                      </span>
                    </div>

                    {/* Coin Amount Badge */}
                    <div className="my-2 flex flex-col items-center">
                      <div className="text-2xl select-none mb-0.5">
                        {day.isClaimed ? '🪙' : isMissed ? '❌' : day.isToday ? '🎁' : '🪙'}
                      </div>
                      <span
                        className={`text-xs font-black ${
                          day.isClaimed
                            ? 'text-emerald-700'
                            : isMissed
                            ? 'text-slate-400 line-through'
                            : isTodayNotClaimed
                            ? 'text-amber-900 font-black'
                            : 'text-slate-700'
                        }`}
                      >
                        +{day.coinReward} Koin
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                        {day.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action / Status Button */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    {day.isClaimed ? (
                      <span className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-100 py-1.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Dituntut
                      </span>
                    ) : isTodayNotClaimed ? (
                      <button
                        type="button"
                        disabled={isClaiming === day.isoDate}
                        onClick={() => handleClaimToday(day)}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 py-1.5 text-[10px] font-black text-slate-950 shadow-sm hover:from-amber-500 hover:to-yellow-500 active:scale-95 transition animate-pulse"
                      >
                        <Sparkles className="h-3 w-3 text-amber-900" /> Tuntut Koin!
                      </button>
                    ) : isMissed ? (
                      <span className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 py-1.5 text-[10px] font-bold text-slate-400">
                        Terlepas
                      </span>
                    ) : (
                      <span className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100/70 py-1.5 text-[10px] font-bold text-slate-400">
                        <Lock className="h-2.5 w-2.5" /> Akan Datang
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Informative Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Dituntut: Koin telah diterima</span>
              <span className="text-slate-300">•</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Hari Ini: Sedia untuk dituntut</span>
              <span className="text-slate-300">•</span>
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span>Terlepas: Tidak log masuk pada hari tersebut</span>
            </div>
            <div className="font-semibold text-blue-600">
              {isTodayClaimed ? '✓ Anda telah menuntut ganjaran hari ini!' : '⚡ Jangan lupa tuntut ganjaran anda hari ini!'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
