'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StudentCoinMissionWidget() {
  const [coins, setCoins] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    // Fetch initial coins from server
    async function loadCoins() {
      try {
        const res = await fetch('/api/student/rewards')
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          if (typeof json.data.coins === 'number') {
            setCoins(json.data.coins)
          }
        }
      } catch (err) {
        console.error('Failed to load coin balance:', err)
      }
    }

    loadCoins()

    // Listen to real-time coin updates from other components (redeem, quiz, etc.)
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

  return (
    <Link
      href="/student/redeem"
      aria-label="Baki Koin Pelajar"
      title="Buka Kedai Tebus Koin"
      className="group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-blue-200 bg-white/95 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-black text-slate-900 shadow-md shadow-blue-500/10 hover:border-blue-400 hover:shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
    >
      <span className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-blue-600 text-white text-xs shadow-xs">
        🪙
      </span>
      <span className="font-extrabold text-blue-950 text-xs sm:text-sm">
        {coins.toLocaleString()}
      </span>
      <span className="text-[11px] font-bold text-slate-500">
        Coin
      </span>
    </Link>
  )
}
