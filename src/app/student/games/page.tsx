'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookA,
  Calculator,
  Trophy,
  Zap,
  Star,
  Timer,
  Medal,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Gamepad2,
  Target,
  Flame,
  Award,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react'
import { SpellingBeeGame } from '@/components/student/SpellingBeeGame'
import { PantasSifirGame } from '@/components/student/PantasSifirGame'
import { gameSound } from '@/lib/gameSound'
import LevelUpModal from '@/components/student/LevelUpModal'

type GameType = 'spelling' | 'sifir'

interface GameResult {
  score: number
  correctCount: number
  maxStreak: number
  timeSpent: number
}

interface HighScoreRecord {
  spelling: number
  sifir: number
}

export default function StudentGamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [levelUpModalData, setLevelUpModalData] = useState<{
    newLevel: number
    previousLevel?: number
    coinReward?: number
  } | null>(null)

  // Spelling Bee Settings
  const [spellingLevel, setSpellingLevel] = useState<'Cadet' | 'Explorer' | 'Cosmic'>('Cadet')
  const [spellingInputMode, setSpellingInputMode] = useState<'tiles' | 'wheel' | 'rain' | 'slot'>('tiles')

  // Pantas Sifir Settings
  const [sifirMode, setSifirMode] = useState<'blaster' | 'numpad'>('blaster')
  const [sifirRange, setSifirRange] = useState<'2-5' | '6-9' | '10-12' | 'all'>('all')

  // Expandable Info disclosure states
  const [showSpellingInfo, setShowSpellingInfo] = useState(false)
  const [showSifirInfo, setShowSifirInfo] = useState(false)
  const [showSpellingSettings, setShowSpellingSettings] = useState(false)
  const [showSifirSettings, setShowSifirSettings] = useState(false)

  // Game active state
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [highScores, setHighScores] = useState<HighScoreRecord>({ spelling: 0, sifir: 0 })

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  // Load high scores and persisted game settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedScores = localStorage.getItem('exploria_competition_scores')
        if (savedScores) {
          setHighScores(JSON.parse(savedScores))
        }

        const savedSettings = localStorage.getItem('exploria_game_settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (parsed.spellingLevel && ['Cadet', 'Explorer', 'Cosmic'].includes(parsed.spellingLevel)) {
            setSpellingLevel(parsed.spellingLevel)
          }
          if (parsed.spellingInputMode && ['tiles', 'wheel', 'rain', 'slot'].includes(parsed.spellingInputMode)) {
            setSpellingInputMode(parsed.spellingInputMode)
          }
          if (parsed.sifirMode && ['blaster', 'numpad'].includes(parsed.sifirMode)) {
            setSifirMode(parsed.sifirMode)
          }
          if (parsed.sifirRange && ['2-5', '6-9', '10-12', 'all'].includes(parsed.sifirRange)) {
            setSifirRange(parsed.sifirRange)
          }
        }
      } catch {}
      setIsSettingsLoaded(true)
    }
  }, [])

  // Save game settings to localStorage whenever changed
  useEffect(() => {
    if (!isSettingsLoaded) return
    if (typeof window !== 'undefined') {
      try {
        const settingsToSave = {
          spellingLevel,
          spellingInputMode,
          sifirMode,
          sifirRange,
        }
        localStorage.setItem('exploria_game_settings', JSON.stringify(settingsToSave))
      } catch {}
    }
  }, [spellingLevel, spellingInputMode, sifirMode, sifirRange, isSettingsLoaded])

  const toggleSound = () => {
    gameSound.isMuted = !gameSound.isMuted
    setIsMuted(gameSound.isMuted)
  }

  const handleStartGame = (game: GameType) => {
    setSelectedGame(game)
    setGameResult(null)
    setIsPlaying(true)
    gameSound.playLaser()
  }

  const handleGameFinish = (result: GameResult) => {
    setGameResult(result)
    setIsPlaying(false)

    if (selectedGame) {
      const currentHigh = highScores[selectedGame] || 0
      if (result.score > currentHigh) {
        const newHigh = { ...highScores, [selectedGame]: result.score }
        setHighScores(newHigh)
        try {
          localStorage.setItem('exploria_competition_scores', JSON.stringify(newHigh))
        } catch {}
      }

      // Sync XP to Supabase database profile
      fetch('/api/student/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(Math.round(result.score / 10), 100),
          passed: result.correctCount >= 3,
          xpEarned: Math.min(result.score, 500),
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.leveledUp) {
            setLevelUpModalData({
              newLevel: json.data.newLevel,
              previousLevel: json.data.previousLevel,
              coinReward: 100 + (json.data.newLevel - 2) * 50,
            })
          }
        })
        .catch((err) => console.error('Failed to submit game score to DB:', err))

      // Mark mission m2 as completed in DB for this student
      fetch('/api/student/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_mission', missionId: 'm2' }),
      }).catch(() => {})
    }
  }

  const handleExitGame = () => {
    setIsPlaying(false)
    setGameResult(null)
  }

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-16">
      
      {/* Banner Tajuk Game Arena - Saiz Selesa & Seimbang (75% Skala Asal) */}
      <header className="relative border-b border-blue-200 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#1d4ed8] text-white px-5 py-6 sm:px-8 sm:py-7 shadow-md overflow-hidden">
        {/* Subtle Ambient Radial Lights */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-88 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-88 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl pr-28 sm:pr-36">
          {/* Baris 1: Butang Kembali & Sound Toggle */}
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Home</span>
            </Link>

            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 shadow-xs cursor-pointer"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-rose-300" /> <span>Mute</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-emerald-300 animate-pulse" /> <span>Audio Hidup</span>
                </>
              )}
            </button>
          </div>

          {/* Baris 2: Tajuk Bersih & Rekod Skor Tinggi (Dikekalkan) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Game Arena
              </h1>
            </div>

            {/* High Score Badges (Dikekalkan Seperti Gambar 1) */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-center backdrop-blur-md shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Trophy className="h-3 w-3 text-white" /> Rekod Ejaan
                </div>
                <div className="text-base sm:text-lg font-black text-white">{highScores.spelling} XP</div>
              </div>
              <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-center backdrop-blur-md shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Trophy className="h-3 w-3 text-white" /> Rekod Sifir
                </div>
                <div className="text-base sm:text-lg font-black text-white">{highScores.sifir} XP</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">

        {/* GAME STATE 1: SELECTION LOBBY */}
        {!isPlaying && !gameResult && (
          <div className="space-y-6">

            {/* Game Selection Cards - Playful Chunky Cards (Matching Picture 1 with Exploria Blue Theme) */}
            <div className="grid gap-6 md:grid-cols-2 items-start">

              {/* 1. BREAKING WORDS (Ejaan) CARD */}
              <div
                className={`group flex flex-col justify-between overflow-hidden rounded-[32px] sm:rounded-[36px] border-[3px] bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
                  selectedGame === 'spelling' ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-blue-200/90 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                    Breaking Words
                  </h2>

                  {/* Cute Character Artwork matching Picture 1 */}
                  <div className="my-5 flex items-center justify-center py-1">
                    <img
                      src="/games/breaking-art-clean.png"
                      alt="Breaking Words Character"
                      className="h-44 sm:h-48 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Active Badges & Quick Settings Toggle */}
                  <div className="w-full">
                    {/* 2 Perkara: Tahap & Cara */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-3.5 py-1 text-xs font-black text-blue-700">
                        {spellingLevel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-3.5 py-1 text-xs font-black text-blue-700">
                        {spellingInputMode === 'tiles' ? 'Jubin' : spellingInputMode === 'wheel' ? 'Leret' : spellingInputMode === 'rain' ? 'Hujan' : 'Gelendong'}
                      </span>
                    </div>

                    {/* Butang Ubah Tetapan Di Bawah Daripada 2 Perkara Itu */}
                    <div className="flex justify-center mb-2">
                      <button
                        type="button"
                        onClick={() => setShowSpellingSettings((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-600 transition active:scale-95 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>{showSpellingSettings ? 'Tutup Pilihan' : 'Ubah Tetapan'}</span>
                        {showSpellingSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Expandable Settings Drawer */}
                    {showSpellingSettings && (
                      <div className="mt-3 space-y-2.5 rounded-2xl bg-white/95 p-3.5 border border-blue-200 shadow-xs text-left animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Tahap Cabaran
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['Cadet', 'Explorer', 'Cosmic'] as const).map((lvl) => {
                              const isActive = spellingLevel === lvl
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setSpellingLevel(lvl)}
                                  className={`rounded-xl py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-xs font-black'
                                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Cara Menjawab
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'tiles' as const, label: 'Jubin' },
                              { id: 'wheel' as const, label: 'Leret' },
                              { id: 'rain' as const, label: 'Hujan' },
                              { id: 'slot' as const, label: 'Gelendong' },
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSpellingInputMode(m.id)}
                                className={`rounded-xl py-1.5 px-1 text-xs font-bold transition active:scale-95 cursor-pointer ${
                                  spellingInputMode === m.id
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Maklumat Lanjut toggle */}
                        <div className="border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowSpellingInfo((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span>{showSpellingInfo ? 'Sembunyi panduan' : 'Panduan permainan'}</span>
                            {showSpellingInfo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {showSpellingInfo && (
                            <div className="mt-2 rounded-xl bg-blue-50/80 border border-blue-100 p-2.5 space-y-1 text-xs text-slate-700 font-medium">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>4 Gaya Menjawab: Jubin Huruf, Roda Leret, Hujan Huruf &amp; Gelendong</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>Sistem suara Text-to-Speech (Pronunciation)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>3 Nyawa Hati + Pengganda Skor Kombo</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chunky Tactile Play Button */}
                <button
                  type="button"
                  onClick={() => handleStartGame('spelling')}
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Main
                </button>
              </div>

              {/* 2. COUNTING WITH BONI (Matematik / Sifir) CARD */}
              <div
                className={`group flex flex-col justify-between overflow-hidden rounded-[32px] sm:rounded-[36px] border-[3px] bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
                  selectedGame === 'sifir' ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-blue-200/90 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                    Counting with Boni
                  </h2>

                  {/* Cute Character Artwork matching Picture 1 */}
                  <div className="my-5 flex items-center justify-center py-1">
                    <img
                      src="/games/counting-art-clean.png"
                      alt="Counting with Boni Character"
                      className="h-44 sm:h-48 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Active Badges & Quick Settings Toggle */}
                  <div className="w-full">
                    {/* 2 Perkara: Gaya & Sifir */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-3.5 py-1 text-xs font-black text-blue-700">
                        {sifirMode === 'blaster' ? 'Tembak Meteor' : 'Cyber Numpad'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-3.5 py-1 text-xs font-black text-blue-700">
                        Sifir: {sifirRange === 'all' ? 'Semua' : sifirRange}
                      </span>
                    </div>

                    {/* Butang Ubah Tetapan Di Bawah Daripada 2 Perkara Itu */}
                    <div className="flex justify-center mb-2">
                      <button
                        type="button"
                        onClick={() => setShowSifirSettings((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-600 transition active:scale-95 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>{showSifirSettings ? 'Tutup Pilihan' : 'Ubah Tetapan'}</span>
                        {showSifirSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Expandable Settings Drawer */}
                    {showSifirSettings && (
                      <div className="mt-3 space-y-2.5 rounded-2xl bg-white/95 p-3.5 border border-blue-200 shadow-xs text-left animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Gaya Permainan
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSifirMode('blaster')}
                              className={`rounded-xl py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                                sifirMode === 'blaster'
                                  ? 'bg-blue-600 text-white shadow-xs font-black'
                                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Tembak Meteor
                            </button>
                            <button
                              type="button"
                              onClick={() => setSifirMode('numpad')}
                              className={`rounded-xl py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                                sifirMode === 'numpad'
                                  ? 'bg-blue-600 text-white shadow-xs font-black'
                                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Cyber Numpad
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Pilihan Sifir
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(['2-5', '6-9', '10-12', 'all'] as const).map((rng) => (
                              <button
                                key={rng}
                                type="button"
                                onClick={() => setSifirRange(rng)}
                                className={`rounded-xl py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                                  sifirRange === rng
                                    ? 'bg-blue-600 text-white shadow-xs font-black'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {rng === 'all' ? 'Semua' : rng}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Maklumat Lanjut toggle */}
                        <div className="border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowSifirInfo((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span>{showSifirInfo ? 'Sembunyi panduan' : 'Panduan permainan'}</span>
                            {showSifirInfo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {showSifirInfo && (
                            <div className="mt-2 rounded-xl bg-blue-50/80 border border-blue-100 p-2.5 space-y-1 text-xs text-slate-700 font-medium">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>Darab, Bahagi &amp; Tempat Kosong ([ ? ] × 6 = 42)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>Kuasa Khas: Freeze Time, Laser Nuke, Shield</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chunky Tactile Play Button */}
                <button
                  type="button"
                  onClick={() => handleStartGame('sifir')}
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Main
                </button>
              </div>

            </div>
          </div>
        )}

        {/* GAME STATE 2: ACTIVE GAMEPLAY */}
        {isPlaying && selectedGame === 'spelling' && (
          <SpellingBeeGame
            difficulty={spellingLevel}
            initialInputMode={spellingInputMode}
            onFinish={handleGameFinish}
            onExit={handleExitGame}
          />
        )}

        {isPlaying && selectedGame === 'sifir' && (
          <PantasSifirGame
            mode={sifirMode}
            tableRange={sifirRange}
            onFinish={handleGameFinish}
            onExit={handleExitGame}
          />
        )}

        {/* GAME STATE 3: RESULTS / PODIUM */}
        {gameResult && (
          <div className="mx-auto max-w-lg rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-9 text-center shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-lg animate-bounce">
              <Trophy className="h-10 w-10" />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase text-blue-900 border border-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Permainan Selesai
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Syabas, Kapten!
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pencapaian cemerlang dalam latihan Game Arena Exploria!
            </p>

            {/* Stat Grid */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-3.5">
                <div className="text-2xl font-black text-blue-900 leading-none">{gameResult.score}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Skor XP</div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-3.5">
                <div className="text-2xl font-black text-blue-900 leading-none">{gameResult.correctCount}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Betul</div>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5">
                <div className="text-2xl font-black text-blue-900 leading-none">{gameResult.maxStreak}x</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Streak</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/90 py-2 px-3 text-xs font-bold text-blue-900 flex items-center justify-center gap-1.5">
              Skor &amp; ganjaran XP telah direkodkan dalam profil pelajar anda!
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => selectedGame && handleStartGame(selectedGame)}
                className="duo-btn-blue px-6 py-3 text-xs sm:text-sm flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Main Lagi
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false)
                  setGameResult(null)
                  setSelectedGame(null)
                }}
                className="duo-btn-white px-5 py-3 text-xs sm:text-sm"
              >
                Pilih Game Lain
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Celebratory Level Up Modal */}
      {levelUpModalData && (
        <LevelUpModal
          isOpen={!!levelUpModalData}
          onClose={() => setLevelUpModalData(null)}
          newLevel={levelUpModalData.newLevel}
          previousLevel={levelUpModalData.previousLevel}
          coinReward={levelUpModalData.coinReward}
        />
      )}
    </div>
  )
}
