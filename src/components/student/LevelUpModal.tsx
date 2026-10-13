'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Trophy, ShoppingBag, ArrowRight, X } from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  previousLevel?: number
  coinReward?: number
  unlockedItemName?: string
}

export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  previousLevel = 1,
  coinReward,
  unlockedItemName,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      gameSound.playVictory()
    }
  }, [isOpen])

  if (!isOpen) return null

  const rewardCoins = coinReward || (100 + Math.max(newLevel - 2, 0) * 50)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-white via-blue-50/50 to-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-64 rounded-full bg-amber-300/30 blur-3xl" />

        {/* Animated Trophy / Star Badge */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-xl shadow-amber-400/30 text-5xl animate-bounce">
          🏆
          <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white font-black text-xs shadow-md border-2 border-white">
            ★
          </span>
        </div>

        {/* Header Badges */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3.5 py-1 text-xs font-black uppercase text-slate-950 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> NAIK TAHAP LEVEL!
        </div>

        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tahniah! Tahap {newLevel} Tercapai!
        </h2>
        
        <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Kerja hebat! Usaha berterusan anda membuahkan hasil. Anda telah naik dari <strong>Tahap {previousLevel}</strong> ke <strong>Tahap {newLevel}</strong>!
        </p>

        {/* Rewards Box */}
        <div className="my-5 space-y-2.5 rounded-2xl bg-white p-4 border-2 border-blue-100 shadow-sm text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-600">
              🪙 Ganjaran Bonus Tahap:
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-black text-amber-900">
              +{rewardCoins} Koin Emas
            </span>
          </div>

          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-blue-700">
              ✨ Barang Rare Terbuka:
            </span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-black text-blue-900">
              {unlockedItemName || `Item Khas Tahap ${newLevel}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/student/redeem"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-sky-700 active:scale-95 transition"
          >
            <ShoppingBag className="h-4 w-4 text-amber-300" /> Buka Kedai Penebusan
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Teruskan
          </button>
        </div>

      </div>
    </div>
  )
}
