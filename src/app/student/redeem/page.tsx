'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Coins,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Gift,
  Lock,
  Zap,
  Star,
  Award,
  Crown,
  History,
  AlertCircle,
  ExternalLink,
  Flame,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Gamepad2,
  BookOpen,
  Trophy,
  X,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

export interface RedeemItem {
  id: string
  title: string
  category: 'avatar' | 'frame' | 'powerup'
  description: string
  cost: number
  emoji: string
  tag: string
  gradient: string
  requiredLevel: number
  rarity: 'Biasa' | 'Rare' | 'Epik' | 'Legenda'
}

const REDEEM_CATALOG: RedeemItem[] = [
  // 1. Avatars
  {
    id: 'av_3',
    title: 'Musang Galaksi Comel',
    category: 'avatar',
    description: 'Karakter musang pintar penjelajah bintang dan galaksi.',
    cost: 250,
    emoji: '🦊',
    tag: 'Avatar Rare',
    gradient: 'from-blue-500 to-sky-400',
    requiredLevel: 2,
    rarity: 'Rare',
  },
  {
    id: 'av_1',
    title: 'Astronaut Cyber Gold',
    category: 'avatar',
    description: 'Avatar angkasa edisi terhad dengan sut perak berkilauan.',
    cost: 300,
    emoji: '🧑‍🚀',
    tag: 'Avatar Rare',
    gradient: 'from-blue-600 to-blue-400',
    requiredLevel: 3,
    rarity: 'Rare',
  },
  {
    id: 'av_5',
    title: 'Naga Neon Mythic',
    category: 'avatar',
    description: 'Avatar legenda naga kosmik bercahaya neon berkuasa tinggi.',
    cost: 400,
    emoji: '🐉',
    tag: 'Avatar Epik',
    gradient: 'from-blue-700 to-sky-500',
    requiredLevel: 4,
    rarity: 'Epik',
  },
  {
    id: 'av_2',
    title: 'Mecha Robot Alpha',
    category: 'avatar',
    description: 'Karakter robot pintar berteknologi tinggi untuk profil anda.',
    cost: 450,
    emoji: '🤖',
    tag: 'Avatar Epik',
    gradient: 'from-blue-600 to-sky-400',
    requiredLevel: 5,
    rarity: 'Epik',
  },
  {
    id: 'av_4',
    title: 'Ahli Sains Cosmic',
    category: 'avatar',
    description: 'Pakar eksperimen graviti dan kimia angkasa lepas.',
    cost: 500,
    emoji: '🧙‍♂️',
    tag: 'Avatar Legenda',
    gradient: 'from-slate-900 to-blue-800',
    requiredLevel: 6,
    rarity: 'Legenda',
  },

  // 2. Frames & Badges
  {
    id: 'fr_3',
    title: 'Lencana Bintang Penjelajah',
    category: 'frame',
    description: 'Lencana bintang perak khas di sisi nama anda di papan pendahulu.',
    cost: 150,
    emoji: '🌟',
    tag: 'Lencana Profil',
    gradient: 'from-blue-400 to-sky-300',
    requiredLevel: 1,
    rarity: 'Biasa',
  },
  {
    id: 'fr_2',
    title: 'Aura Kilat Neon Biru',
    category: 'frame',
    description: 'Aura elektrik bercahaya biru mengelilingi gambar profil pelajar.',
    cost: 200,
    emoji: '⚡',
    tag: 'Bingkai Rare',
    gradient: 'from-blue-600 to-cyan-500',
    requiredLevel: 2,
    rarity: 'Rare',
  },
  {
    id: 'fr_4',
    title: 'Gelombang Api Phoenix Biru',
    category: 'frame',
    description: 'Bingkai berapi mistik lambang semangat pantang menyerah kalah.',
    cost: 280,
    emoji: '🔥',
    tag: 'Bingkai Rare',
    gradient: 'from-blue-700 to-sky-400',
    requiredLevel: 3,
    rarity: 'Rare',
  },
  {
    id: 'fr_1',
    title: 'Bingkai Mahkota Diraja',
    category: 'frame',
    description: 'Hiasan bingkai profil mahkota untuk mempamerkan kehebatan anda.',
    cost: 350,
    emoji: '👑',
    tag: 'Bingkai Epik',
    gradient: 'from-blue-600 to-blue-800',
    requiredLevel: 4,
    rarity: 'Epik',
  },
  {
    id: 'fr_5',
    title: 'Bingkai Aurora Galaksi Nova',
    category: 'frame',
    description: 'Aura aurora kosmik berkilauan edisi terhad untuk sang juara sejati.',
    cost: 550,
    emoji: '🌌',
    tag: 'Bingkai Legenda',
    gradient: 'from-slate-950 to-blue-700',
    requiredLevel: 6,
    rarity: 'Legenda',
  },

  // 3. Power-ups
  {
    id: 'pw_3',
    title: 'Pek 3x Nyawa Tambahan',
    category: 'powerup',
    description: 'Dapatkan 1 nyawa hati kecemasan tambahan dalam cabaran Spelling Bee.',
    cost: 80,
    emoji: '❤️',
    tag: 'Kuasa Game',
    gradient: 'from-blue-500 to-sky-400',
    requiredLevel: 1,
    rarity: 'Biasa',
  },
  {
    id: 'pw_1',
    title: 'Pek 5x Freeze Time Sifir',
    category: 'powerup',
    description: 'Bekukan pemasa meteor selama 5 saat dalam permainan Meteor Sifir Blaster.',
    cost: 100,
    emoji: '❄️',
    tag: 'Kuasa Game',
    gradient: 'from-sky-400 to-blue-600',
    requiredLevel: 1,
    rarity: 'Biasa',
  },
  {
    id: 'pw_2',
    title: 'Pek 3x Laser Nuke Blaster',
    category: 'powerup',
    description: 'Musnahkan semua meteor di skrin secara serentak dengan letupan laser.',
    cost: 120,
    emoji: '💥',
    tag: 'Kuasa Game',
    gradient: 'from-blue-700 to-blue-900',
    requiredLevel: 1,
    rarity: 'Biasa',
  },
  {
    id: 'pw_4',
    title: 'Pengganda Skor 2x XP Boost',
    category: 'powerup',
    description: 'Gandakan skor mata ganjaran anda selama 1 pusingan permainan.',
    cost: 140,
    emoji: '✨',
    tag: 'Kuasa Game',
    gradient: 'from-blue-600 to-sky-400',
    requiredLevel: 2,
    rarity: 'Rare',
  },
]

const LEVEL_REWARDS_DATA = [
  { level: 2, xpRequired: 250, coinReward: 100, title: 'Penjelajah Angkasa', unlockedItems: 'Musang Galaksi & Aura Neon' },
  { level: 3, xpRequired: 500, coinReward: 150, title: 'Cendekiawan Muda', unlockedItems: 'Astronaut Gold & Api Phoenix' },
  { level: 4, xpRequired: 750, coinReward: 200, title: 'Pahlawan Sains & Sifir', unlockedItems: 'Mahkota Diraja & Naga Neon' },
  { level: 5, xpRequired: 1000, coinReward: 250, title: 'Master Kombo Galaksi', unlockedItems: 'Mecha Robot Alpha' },
  { level: 6, xpRequired: 1250, coinReward: 300, title: 'Legenda Kosmik Diraja', unlockedItems: 'Ahli Sains Cosmic & Bingkai Aurora' },
  { level: 7, xpRequired: 1500, coinReward: 350, title: 'Adiwira Bintang Unggul', unlockedItems: 'Item Rahsia Kosmik' },
  { level: 8, xpRequired: 1750, coinReward: 400, title: 'Grandmaster Exploria', unlockedItems: 'Mahkota Galaksi Tertinggi' },
]

type FilterTab = 'all' | 'inventory' | 'rare' | 'avatar' | 'frame' | 'powerup'

export default function StudentRedeemPage() {
  const [coins, setCoins] = useState(200)
  const [studentLevel, setStudentLevel] = useState(1)
  const [studentXp, setStudentXp] = useState(0)
  const [redeemedIds, setRedeemedIds] = useState<string[]>([])
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [confirmRedeemModal, setConfirmRedeemModal] = useState<RedeemItem | null>(null)
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false)
  const [celebrationModal, setCelebrationModal] = useState<RedeemItem | null>(null)
  const [notEnoughModal, setNotEnoughModal] = useState<RedeemItem | null>(null)
  const [lockedItemModal, setLockedItemModal] = useState<RedeemItem | null>(null)
  const [claimedLevelModal, setClaimedLevelModal] = useState<{ level: number; coinReward: number; title: string } | null>(null)
  const [isClaimingLevel, setIsClaimingLevel] = useState<number | null>(null)
  const [studentId, setStudentId] = useState<string>('')
  
  // Customization & Equipping state
  const [avatarUrl, setAvatarUrl] = useState<string>('🧑‍🚀')
  const [equippedAvatarId, setEquippedAvatarId] = useState<string | null>(null)
  const [equippedFrameId, setEquippedFrameId] = useState<string | null>(null)
  const [isEquipping, setIsEquipping] = useState<string | null>(null)
  const [equipToast, setEquipToast] = useState<{ title: string; emoji: string; type: string } | null>(null)

  // Simplified Level Rewards Drawer state
  const [showMilestonesDetail, setShowMilestonesDetail] = useState<boolean>(false)
  const [isClaimingAll, setIsClaimingAll] = useState<boolean>(false)

  // Load coins, level, xp, and redeemed items directly from database API
  useEffect(() => {
    let isMounted = true

    async function loadRewardsData() {
      try {
        const res = await fetch('/api/student/rewards')
        const json = await res.json()
        if (json.success && json.data) {
          if (!isMounted) return
          setStudentId(json.data.studentId || '')
          setCoins(json.data.coins ?? 200)
          setStudentLevel(json.data.level ?? 1)
          setStudentXp(json.data.xp ?? 0)
          setRedeemedIds(json.data.redeemedItems || [])
          setClaimedLevelRewards(json.data.claimedLevelRewards || [])
          if (json.data.avatarUrl) setAvatarUrl(json.data.avatarUrl)
          if (json.data.equippedAvatar) setEquippedAvatarId(json.data.equippedAvatar)
          if (json.data.equippedFrame) setEquippedFrameId(json.data.equippedFrame)
        }
      } catch (err) {
        console.error('Failed to load student rewards data from DB:', err)
      }
    }

    loadRewardsData()

    // Listen to coin updates from other components
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

  // Handle Confirm Redeem Item (Called after student confirms in confirmation modal)
  const handleConfirmRedeem = async (item: RedeemItem) => {
    if (isRedeeming || redeemedIds.includes(item.id)) return

    if (studentLevel < item.requiredLevel) {
      setConfirmRedeemModal(null)
      gameSound.playWrong()
      setLockedItemModal(item)
      return
    }

    if (coins < item.cost) {
      setConfirmRedeemModal(null)
      gameSound.playWrong()
      setNotEnoughModal(item)
      return
    }

    setIsRedeeming(true)
    gameSound.playVictory()
    const newTotal = coins - item.cost
    const newRedeemed = [...redeemedIds, item.id]

    setCoins(newTotal)
    setRedeemedIds(newRedeemed)
    setConfirmRedeemModal(null)
    setCelebrationModal(item)

    // Automatically equip upon redeeming
    if (item.category === 'avatar') {
      setEquippedAvatarId(item.id)
      setAvatarUrl(item.emoji)
    } else if (item.category === 'frame') {
      setEquippedFrameId(item.id)
    }

    // Sync to DB
    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem_item',
          itemId: item.id,
          cost: item.cost,
          requiredLevel: item.requiredLevel,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setCoins(json.data.coins)
        setRedeemedIds(json.data.redeemedItems)
        if (json.data.avatarUrl) {
          setAvatarUrl(json.data.avatarUrl)
          window.dispatchEvent(
            new CustomEvent('student_avatar_updated', {
              detail: { avatarUrl: json.data.avatarUrl },
            })
          )
        }
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to persist redeem item to DB:', err)
    } finally {
      setIsRedeeming(false)
    }
  }

  // Handle Equip Item (Allows student to switch avatar or frame anytime to their preference)
  const handleEquipItem = async (item: RedeemItem) => {
    if (!redeemedIds.includes(item.id)) return

    setIsEquipping(item.id)
    gameSound.playLevelUp()

    // Optimistic state update
    if (item.category === 'avatar') {
      setEquippedAvatarId(item.id)
      setAvatarUrl(item.emoji)
    } else if (item.category === 'frame') {
      setEquippedFrameId(item.id)
    }

    setEquipToast({
      title: item.title,
      emoji: item.emoji,
      type: item.category === 'avatar' ? 'Avatar Profil' : 'Bingkai Profil',
    })

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'equip_item',
          itemId: item.id,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        if (json.data.avatarUrl) {
          setAvatarUrl(json.data.avatarUrl)
          window.dispatchEvent(
            new CustomEvent('student_avatar_updated', {
              detail: { avatarUrl: json.data.avatarUrl },
            })
          )
        }
        if (json.data.equippedAvatar) setEquippedAvatarId(json.data.equippedAvatar)
        if (json.data.equippedFrame) setEquippedFrameId(json.data.equippedFrame)
      }
    } catch (err) {
      console.error('Failed to equip item:', err)
    } finally {
      setIsEquipping(null)
      setTimeout(() => {
        setEquipToast(null)
      }, 4000)
    }
  }

  // Handle Claim Level Reward
  const handleClaimLevelReward = async (levelNumber: number, rewardCoins: number, title: string) => {
    if (studentLevel < levelNumber || claimedLevelRewards.includes(levelNumber)) return

    setIsClaimingLevel(levelNumber)
    gameSound.playVictory()

    // Optimistic update
    const newCoins = coins + rewardCoins
    const newClaimed = [...claimedLevelRewards, levelNumber]
    setCoins(newCoins)
    setClaimedLevelRewards(newClaimed)
    setClaimedLevelModal({ level: levelNumber, coinReward: rewardCoins, title })

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_level_reward',
          targetLevel: levelNumber,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setCoins(json.data.coins)
        setClaimedLevelRewards(json.data.claimedLevelRewards)
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to claim level reward:', err)
    } finally {
      setIsClaimingLevel(null)
    }
  }

  // Handle Claim All Level Rewards at Once (One-Click)
  const handleClaimAllLevelRewards = async () => {
    if (unclaimedMilestones.length === 0 || isClaimingAll) return

    setIsClaimingAll(true)
    gameSound.playVictory()

    const allClaimedLvl = Array.from(new Set([...claimedLevelRewards, ...unclaimedMilestones.map((m) => m.level)]))
    const addedCoins = totalUnclaimedCoins
    setCoins(coins + addedCoins)
    setClaimedLevelRewards(allClaimedLvl)
    setClaimedLevelModal({
      level: studentLevel,
      coinReward: addedCoins,
      title: `${unclaimedMilestones.length} Ganjaran Tahap Level`,
    })

    try {
      const res = await fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim_all_level_rewards' }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setCoins(json.data.coins)
        setClaimedLevelRewards(json.data.claimedLevelRewards)
        window.dispatchEvent(
          new CustomEvent('student_coins_updated', {
            detail: { coins: json.data.coins },
          })
        )
      }
    } catch (err) {
      console.error('Failed to claim all level rewards:', err)
    } finally {
      setIsClaimingAll(false)
    }
  }

  // Level progress calculation
  const currentLevelXp = studentXp % 250
  const xpToNextLevel = Math.max(250 - currentLevelXp, 0)
  const progressPercent = Math.min(Math.round((currentLevelXp / 250) * 100), 100)

  // Unclaimed level rewards list & total coin calculation
  const unclaimedMilestones = LEVEL_REWARDS_DATA.filter(
    (m) => studentLevel >= m.level && !claimedLevelRewards.includes(m.level)
  )
  const totalUnclaimedCoins = unclaimedMilestones.reduce((acc, cur) => acc + cur.coinReward, 0)
  const unclaimedLevelsCount = unclaimedMilestones.length

  // Filter items
  const filteredItems = REDEEM_CATALOG.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'inventory') return redeemedIds.includes(item.id)
    if (activeTab === 'rare') return item.rarity === 'Rare' || item.rarity === 'Epik' || item.rarity === 'Legenda'
    return item.category === activeTab
  })

  const ownedItemsCount = REDEEM_CATALOG.filter((item) => redeemedIds.includes(item.id)).length

  const getFrameRing = (frameId: string | null) => {
    switch (frameId) {
      case 'fr_1': return 'ring-4 ring-blue-600 shadow-lg shadow-blue-400/40'
      case 'fr_2': return 'ring-4 ring-sky-400 shadow-lg shadow-cyan-300/40'
      case 'fr_3': return 'ring-4 ring-blue-300 shadow-lg shadow-blue-200/40'
      case 'fr_4': return 'ring-4 ring-blue-700 shadow-lg shadow-blue-500/40'
      case 'fr_5': return 'ring-4 ring-slate-900 shadow-lg shadow-slate-900/40'
      default: return 'ring-2 ring-blue-300 shadow-sm'
    }
  }

  const getFrameName = (frameId: string | null) => {
    const found = REDEEM_CATALOG.find((i) => i.id === frameId)
    return found ? found.title : 'Bingkai Standard'
  }

  const getAvatarName = (avatarId: string | null, currentEmoji: string) => {
    const found = REDEEM_CATALOG.find((i) => i.id === avatarId || i.emoji === currentEmoji)
    return found ? found.title : 'Karakter Asas'
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Rare':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Epik':
        return 'bg-blue-600 text-white border-blue-700 font-bold'
      case 'Legenda':
        return 'bg-slate-950 text-white border-slate-800 font-black shadow-xs'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Banner Tajuk Kedai Tebus - Saiz Selesa & Seimbang (75% Skala Asal) */}
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

          {/* Baris 2: Tajuk Bersih & Rekod Koin / Tahap (Dikekalkan Seperti Gambar 1) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Kedai Tebus
              </h1>
            </div>

            {/* Stat Badges (Dikekalkan Seperti Gambar 1) */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-center backdrop-blur-md shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Coins className="h-3 w-3 text-amber-300" /> Baki Koin
                </div>
                <div className="text-base sm:text-lg font-black text-white">{coins.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-center backdrop-blur-md shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 text-amber-300 fill-current" /> Tahap {studentLevel}
                </div>
                <div className="text-base sm:text-lg font-black text-white">{studentXp} XP</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 space-y-7">
        
        {/* Section 1: Ganjaran Pencapaian Tahap Level (Versi Dipermudahkan / Simplified) */}
        {unclaimedLevelsCount > 0 ? (
          <section aria-label="Ganjaran Naik Tahap Level" className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xl shadow-xs animate-bounce">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900">
                      {unclaimedLevelsCount} Ganjaran Level Sedia Dituntut! (+{totalUnclaimedCoins} 🪙)
                    </h2>
                    <span className="rounded-full bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 animate-pulse">
                      Bonus Koin
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tahniah atas kenaikan tahap! Tuntut koin emas bonus anda dengan 1-klik pantas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isClaimingAll}
                  onClick={handleClaimAllLevelRewards}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:from-amber-500 hover:to-yellow-500 active:scale-95 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-800" /> Tuntut Semua (+{totalUnclaimedCoins} Koin)
                </button>
                <button
                  type="button"
                  onClick={() => setShowMilestonesDetail(!showMilestonesDetail)}
                  className="rounded-xl border border-amber-300 bg-white px-2.5 py-2 text-xs font-bold text-amber-950 hover:bg-amber-50 transition"
                >
                  {showMilestonesDetail ? 'Tutup ▲' : 'Perincian ▼'}
                </button>
              </div>
            </div>

            {/* Collapsible Details Drawer */}
            {showMilestonesDetail && (
              <div className="mt-3.5 pt-3 border-t border-amber-200/80 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LEVEL_REWARDS_DATA.map((milestone) => {
                    const isAchieved = studentLevel >= milestone.level
                    const isClaimed = claimedLevelRewards.includes(milestone.level)
                    const canClaim = isAchieved && !isClaimed

                    return (
                      <div
                        key={milestone.level}
                        className={`rounded-xl border p-2 text-center text-xs ${
                          isClaimed
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                            : canClaim
                            ? 'border-amber-400 bg-amber-50 shadow-xs ring-1 ring-amber-300'
                            : 'border-slate-200 bg-white opacity-60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px]">
                          <span>Tahap {milestone.level}</span>
                          <span className="text-amber-800 font-black">+{milestone.coinReward} 🪙</span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-[11px] truncate mt-0.5">{milestone.title}</p>
                        <div className="mt-1">
                          {isClaimed ? (
                            <span className="text-[10px] text-emerald-700 font-bold">✓ Dituntut</span>
                          ) : canClaim ? (
                            <button
                              type="button"
                              onClick={() => handleClaimLevelReward(milestone.level, milestone.coinReward, milestone.title)}
                              className="w-full rounded-lg bg-amber-400 py-0.5 text-[10px] font-black text-slate-950 hover:bg-amber-500"
                            >
                              Tuntut
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Terkunci</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section aria-label="Ganjaran Naik Tahap Level" className="rounded-2xl border border-blue-100 bg-white px-4 py-2.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <span>
                  <strong>Ganjaran Tahap Level:</strong> Anda berada di <strong>Tahap {studentLevel}</strong>. Semua ganjaran tahap semasa telah dituntut.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMilestonesDetail(!showMilestonesDetail)}
                className="text-[11px] font-bold text-blue-600 hover:underline shrink-0 text-left sm:text-right"
              >
                {showMilestonesDetail ? 'Tutup Perincian Tahap ▲' : 'Lihat Senarai Tahap (1 - 8) ▼'}
              </button>
            </div>

            {/* Collapsible Details Drawer when all claimed */}
            {showMilestonesDetail && (
              <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LEVEL_REWARDS_DATA.map((milestone) => {
                    const isAchieved = studentLevel >= milestone.level
                    const isClaimed = claimedLevelRewards.includes(milestone.level)

                    return (
                      <div
                        key={milestone.level}
                        className={`rounded-xl border p-2 text-center text-xs ${
                          isClaimed
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                            : isAchieved
                            ? 'border-blue-200 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white opacity-60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px]">
                          <span>Tahap {milestone.level}</span>
                          <span className="text-amber-800 font-black">+{milestone.coinReward} 🪙</span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-[11px] truncate mt-0.5">{milestone.title}</p>
                        <div className="mt-1">
                          {isClaimed ? (
                            <span className="text-[10px] text-emerald-700 font-bold">✓ Dituntut</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Terkunci (Tahap {milestone.level})</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section 2: Penampilan Profil Pelajar Semasa (Versi Ringkas / Compact) */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-2xl shadow-sm border-2 border-white ${getFrameRing(equippedFrameId)}`}>
              <span>{avatarUrl}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-black text-slate-900">Watak: {getAvatarName(equippedAvatarId, avatarUrl)}</span>
                <span className="text-slate-300">•</span>
                <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                  {getFrameName(equippedFrameId)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                💡 Anda bebas menukar mana-mana avatar &amp; bingkai yang telah ditebus bila-bila masa tanpa caj koin!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Koleksi Saya ({ownedItemsCount})
          </button>
        </section>

        {/* Section 3: Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-xs">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua Ganjaran' },
              { id: 'inventory', label: `🎒 Koleksi Saya (${ownedItemsCount})` },
              { id: 'rare', label: '✨ Barang Rare & Epik' },
              { id: 'avatar', label: '🧑‍🚀 Avatar' },
              { id: 'frame', label: '👑 Bingkai Profil' },
              { id: 'powerup', label: '⚡ Kuasa Arked' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as FilterTab)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50/60 text-slate-700 hover:bg-blue-100/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            Menunjukkan {filteredItems.length} item
          </div>
        </div>

        {/* Empty State for Inventory Tab */}
        {activeTab === 'inventory' && filteredItems.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl mb-3">🎒</div>
            <h3 className="text-lg font-black text-slate-800">Koleksi Anda Masih Kosong</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Anda belum menebus sebarang watak avatar atau bingkai lagi. Kumpul koin dan capai Tahap Level baharu untuk menebus item kegemaran anda!
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Lihat Katalog Ganjaran
            </button>
          </div>
        )}

        {/* Section 4: Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isRedeemed = redeemedIds.includes(item.id)
            const isLevelLocked = studentLevel < item.requiredLevel
            const canAfford = coins >= item.cost
            const isEquippedAvatar = item.category === 'avatar' && (equippedAvatarId === item.id || (!equippedAvatarId && avatarUrl === item.emoji))
            const isEquippedFrame = item.category === 'frame' && equippedFrameId === item.id

            return (
              <article
                key={item.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isEquippedAvatar || isEquippedFrame
                    ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-300/50'
                    : isRedeemed
                    ? 'border-blue-200 bg-blue-50/20'
                    : isLevelLocked
                    ? 'border-slate-200 bg-slate-50/50'
                    : canAfford
                    ? 'border-blue-100 hover:border-blue-400'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header Visual */}
                  <div className={`relative flex h-28 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-50 to-sky-100 border border-blue-100 overflow-hidden shadow-inner ${
                    isLevelLocked ? 'grayscale-[40%]' : ''
                  }`}>
                    <span className="text-5xl select-none transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">
                      {item.emoji}
                    </span>

                    {/* Top Right: Rarity Tag */}
                    <span className={`absolute top-2.5 right-2.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase shadow-xs ${getRarityBadge(item.rarity)}`}>
                      {item.rarity}
                    </span>

                    {/* Top Left: Level Requirement Badge */}
                    <span className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase shadow-xs flex items-center gap-1 ${
                      isLevelLocked
                        ? 'bg-slate-900/80 text-white border border-slate-700'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isLevelLocked ? (
                        <>
                          <Lock className="h-2.5 w-2.5" /> Tahap {item.requiredLevel}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5" /> Buka (Tahap {item.requiredLevel})
                        </>
                      )}
                    </span>

                    {isRedeemed && (
                      <span className={`absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs ${
                        isEquippedAvatar || isEquippedFrame ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-blue-600'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" /> {isEquippedAvatar || isEquippedFrame ? 'Sedang Digunakan' : 'Telah Dimiliki'}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-black text-amber-950">
                        <span>🪙</span> {item.cost}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Level Lock Indicator */}
                    {isLevelLocked && (
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                        <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Kunci: Capai <strong>Tahap {item.requiredLevel}</strong> untuk buka item rare ini.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Redeem & Equip Action Button */}
                <div className="mt-6 border-t border-slate-100 pt-3.5">
                  {isRedeemed ? (
                    item.category === 'avatar' ? (
                      isEquippedAvatar ? (
                        <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 py-2.5 text-xs font-black text-emerald-800 shadow-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sedang Dipakai (Avatar Aktif)
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isEquipping === item.id}
                          onClick={() => handleEquipItem(item)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Pakai Avatar Ini (Ubah Citarasa)
                        </button>
                      )
                    ) : item.category === 'frame' ? (
                      isEquippedFrame ? (
                        <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-amber-400 bg-amber-50 py-2.5 text-xs font-black text-amber-900 shadow-xs">
                          <CheckCircle2 className="h-4 w-4 text-amber-600" /> Sedang Dipasang (Bingkai Aktif)
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isEquipping === item.id}
                          onClick={() => handleEquipItem(item)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-slate-950 shadow-md hover:from-amber-600 hover:to-yellow-600 active:scale-95 transition"
                        >
                          <Crown className="h-3.5 w-3.5 text-slate-900" /> Pasang Bingkai Ini (Ubah Citarasa)
                        </button>
                      )
                    ) : (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 py-2.5 text-xs font-bold text-sky-800">
                        <Zap className="h-4 w-4 text-sky-600" /> Sedia Digunakan di Permainan
                      </div>
                    )
                  ) : isLevelLocked ? (
                    <button
                      type="button"
                      onClick={() => setLockedItemModal(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Lock className="h-3.5 w-3.5 text-slate-500" /> Terkunci (Perlu Tahap {item.requiredLevel})
                    </button>
                  ) : canAfford ? (
                    <button
                      type="button"
                      onClick={() => {
                        gameSound.playClick()
                        setConfirmRedeemModal(item)
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-sky-700 active:scale-95 transition"
                    >
                      <span>🪙</span> Tebus Sekarang ({item.cost} Koin)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNotEnoughModal(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition"
                    >
                      <Lock className="h-3.5 w-3.5 text-slate-400" /> Perlu {item.cost - coins} Lagi Koin
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Motivational Card: How to get XP and Coins */}
        <section className="rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700 text-2xl shadow-xs">
                ⭐
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Cara Menaikkan Tahap Level & Kumpul Koin</h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                  Selesaikan nota pembelajaran subjek (+40 XP), main cabaran Game Arena (+ skoring XP), atau jawab peperiksaan rasmi (+800 XP) untuk membuka barang rare dan menuntut ganjaran koin level!
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Link
                href="/student/quizzes"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5" /> Belajar Subjek
              </Link>
              <Link
                href="/student/games"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                <Gamepad2 className="h-3.5 w-3.5" /> Main Game
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 0. Modal Pengesahan Penebusan (Pilih Tebus atau Batal) */}
      {confirmRedeemModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-blue-300 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Butang Tutup / X */}
            <button
              type="button"
              disabled={isRedeeming}
              onClick={() => {
                gameSound.playClick()
                setConfirmRedeemModal(null)
              }}
              className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Ikon Item dengan Glow */}
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-5xl shadow-xl shadow-blue-500/30">
              <span className="transform hover:scale-110 transition duration-300">{confirmRedeemModal.emoji}</span>
              <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm shadow-md border-2 border-white">
                🪙
              </span>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-black uppercase text-blue-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Pengesahan Penebusan
            </div>

            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Penebusan Ganjaran
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Adakah anda ingin menebus <strong className="text-slate-950">&quot;{confirmRedeemModal.title}&quot;</strong>?
            </p>

            {/* Ringkasan Pengiraan Koin */}
            <div className="my-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-xs text-left shadow-xs">
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Koin Semasa Anda:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <span>🪙</span> {coins.toLocaleString()} Koin
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold text-rose-600 border-t border-dashed border-slate-200 pt-2">
                  <span>Harga Tebus:</span>
                  <span className="font-black flex items-center gap-1">
                    <span>- 🪙</span> {confirmRedeemModal.cost.toLocaleString()} Koin
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between font-black text-slate-900 border-t border-blue-200 bg-blue-50/90 px-3.5 py-3">
                <span className="text-blue-950">Baki Koin Selepas Tebus:</span>
                <span className="text-blue-700 flex items-center gap-1 text-sm font-black">
                  <span>🪙</span> {(coins - confirmRedeemModal.cost).toLocaleString()} Koin
                </span>
              </div>
            </div>

            {/* Butang Tindakan: Batal atau Tebus */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isRedeeming}
                onClick={() => {
                  gameSound.playClick()
                  setConfirmRedeemModal(null)
                }}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isRedeeming}
                onClick={() => handleConfirmRedeem(confirmRedeemModal)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-sky-700 active:scale-95 transition disabled:opacity-50"
              >
                {isRedeeming ? (
                  <span>Sedang Menebus...</span>
                ) : (
                  <>
                    <span>🪙</span> Tebus Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Modal Kejayaan Penebusan Item */}
      {celebrationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-300 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-4xl shadow-lg animate-bounce">
              {celebrationModal.emoji}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Penebusan Berjaya!
            </div>

            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Tahniah! Ganjaran Ditebus
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Anda telah berjaya menebus <strong>&quot;{celebrationModal.title}&quot;</strong> dengan nilai <strong>{celebrationModal.cost} Koin</strong>.
            </p>

            <div className="my-5 rounded-2xl bg-blue-50 p-3.5 border border-blue-100 text-xs font-semibold text-blue-900">
              ✨ Baki Koin Anda Kini: <strong>{coins.toLocaleString()} Koin</strong>
            </div>

            <button
              type="button"
              onClick={() => setCelebrationModal(null)}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 py-3 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-sky-700 transition"
            >
              Kembali ke Kedai
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal Ganjaran Tahap Level Berjaya Dituntut */}
      {claimedLevelModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-400 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 text-4xl shadow-lg animate-bounce">
              🪙
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Ganjaran Tahap Dituntut!
            </div>

            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Tahniah! +{claimedLevelModal.coinReward} Koin Emas
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Pencapaian <strong>Tahap {claimedLevelModal.level} ({claimedLevelModal.title})</strong> anda telah dihadiahkan dengan <strong>+{claimedLevelModal.coinReward} Koin Emas</strong>!
            </p>

            <div className="my-5 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs font-bold text-amber-950">
              ✨ Jumlah Koin Terkini: <strong>{coins.toLocaleString()} Koin</strong>
            </div>

            <button
              type="button"
              onClick={() => setClaimedLevelModal(null)}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-xs font-black text-slate-950 shadow-md hover:from-amber-600 hover:to-yellow-600 transition"
            >
              Teruskan Menjelajah
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal Item Rare Terkunci (Locked Item Modal) */}
      {lockedItemModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-slate-300 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-3xl shadow-sm">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>

            <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-black uppercase ${getRarityBadge(lockedItemModal.rarity)}`}>
              Barang {lockedItemModal.rarity}
            </div>

            <h3 className="mt-2 text-xl font-black text-slate-900">
              Item Ini Memerlukan Tahap {lockedItemModal.requiredLevel}!
            </h3>
            
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Anda kini berada di <strong>Tahap {studentLevel}</strong>. Anda perlu mara <strong>{lockedItemModal.requiredLevel - studentLevel} tahap lagi</strong> untuk membuka kunci <strong>&quot;{lockedItemModal.title}&quot;</strong>!
            </p>

            <div className="my-4 rounded-xl bg-blue-50 p-3 border border-blue-200 text-xs text-blue-900 font-bold text-left space-y-1">
              <div className="flex items-center gap-1.5">
                <span>📚</span> Ulangkaji nota subjek untuk peroleh <strong>+40 XP</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🎮</span> Main cabaran Game Arena untuk peroleh <strong>+XP pantas</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🏆</span> Sertai Peperiksaan Rasmi untuk peroleh sehingga <strong>+800 XP</strong>!
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setLockedItemModal(null)}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
              <Link
                href="/student/quizzes"
                onClick={() => setLockedItemModal(null)}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white shadow-xs hover:bg-blue-700 transition"
              >
                Kumpul XP Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Koin Tidak Mencukupi */}
      {notEnoughModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-200 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-3xl shadow-sm">
              <AlertCircle className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-900">
              Koin Tidak Mencukupi!
            </h3>
            <p className="mt-1.5 text-xs text-slate-600">
              Anda mempunyai <strong>{coins} Koin</strong>, manakala item <strong>&quot;{notEnoughModal.title}&quot;</strong> memerlukan <strong>{notEnoughModal.cost} Koin</strong>.
            </p>

            <div className="my-4 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 font-bold">
              💡 Anda hanya memerlukan <strong>{notEnoughModal.cost - coins} Koin lagi</strong>! Selesaikan misi harian atau tuntut ganjaran tahap untuk tambah koin.
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setNotEnoughModal(null)}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
              <Link
                href="/student/quizzes"
                onClick={() => setNotEnoughModal(null)}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white shadow-xs hover:bg-blue-700 transition"
              >
                Kumpul Koin Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Floating Equip Toast Notification */}
      {equipToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border-2 border-emerald-400 bg-slate-950/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-3xl shadow-md">
            {equipToast.emoji}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3 w-3" /> Citarasa Berjaya Ditukar!
            </p>
            <p className="text-sm font-black text-white">
              {equipToast.type}: <span className="text-amber-300">{equipToast.title}</span> kini aktif!
            </p>
          </div>
        </aside>
      )}

    </div>
  )
}
