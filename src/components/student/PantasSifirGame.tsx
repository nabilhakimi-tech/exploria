'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Zap,
  Flame,
  Heart,
  Timer,
  Shield,
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle,
  Crosshair,
  Sparkles,
  Bomb,
  Hourglass,
  ArrowRight,
  Calculator,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

export interface SifirQuestion {
  id: string
  num1: number
  num2: number
  op: '×' | '÷' | 'missing'
  answer: number
  displayPrompt: string
  distractors: number[]
  isBoss?: boolean
}

interface PantasSifirGameProps {
  mode: 'blaster' | 'numpad'
  tableRange: '2-5' | '6-9' | '10-12' | 'all'
  onFinish: (result: { score: number; correctCount: number; maxStreak: number; timeSpent: number }) => void
  onExit: () => void
}

function generateQuestions(range: '2-5' | '6-9' | '10-12' | 'all', count = 30): SifirQuestion[] {
  const list: SifirQuestion[] = []

  let minTable = 2
  let maxTable = 12

  if (range === '2-5') {
    minTable = 2
    maxTable = 5
  } else if (range === '6-9') {
    minTable = 6
    maxTable = 9
  } else if (range === '10-12') {
    minTable = 10
    maxTable = 12
  }

  for (let i = 0; i < count; i++) {
    const isBoss = (i + 1) % 5 === 0
    const first = Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable
    const second = Math.floor(Math.random() * 11) + 2
    const product = first * second

    // Variety of question formats: standard multiplication, missing factor, division
    const qType = i % 4 === 0 ? 'missing' : i % 4 === 3 ? '÷' : '×'

    let displayPrompt = ''
    let answer = product

    if (qType === 'missing') {
      const hideFirst = Math.random() > 0.5
      displayPrompt = hideFirst ? `[ ? ] × ${second} = ${product}` : `${first} × [ ? ] = ${product}`
      answer = hideFirst ? first : second
    } else if (qType === '÷') {
      displayPrompt = `${product} ÷ ${first} = ?`
      answer = second
    } else {
      displayPrompt = `${first} × ${second} = ?`
      answer = product
    }

    // Generate 3 unique distractors
    const distractors = new Set<number>()
    while (distractors.size < 3) {
      const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1)
      const candidate = answer + offset
      if (candidate > 0 && candidate !== answer) {
        distractors.add(candidate)
      }
    }

    const allOptions = [answer, ...Array.from(distractors)].sort(() => 0.5 - Math.random())

    list.push({
      id: `q-${i}-${Date.now()}`,
      num1: first,
      num2: second,
      op: qType,
      answer,
      displayPrompt,
      distractors: allOptions,
      isBoss,
    })
  }

  return list
}

export function PantasSifirGame({ mode, tableRange, onFinish, onExit }: PantasSifirGameProps) {
  const [questions, setQuestions] = useState<SifirQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typedInput, setTypedInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isFrozen, setIsFrozen] = useState(false)
  const [activeMultiplier, setActiveMultiplier] = useState(1)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [floatingScore, setFloatingScore] = useState<string | null>(null)
  const [selectedMeteor, setSelectedMeteor] = useState<number | null>(null)
  const [destroyedMeteors, setDestroyedMeteors] = useState<number[]>([])

  // Power-up inventory
  const [timeFreezeAvailable, setTimeFreezeAvailable] = useState(1)
  const [nukeAvailable, setNukeAvailable] = useState(1)
  const [shieldAvailable, setShieldAvailable] = useState(1)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef(Date.now())

  // Initialize Questions
  useEffect(() => {
    setQuestions(generateQuestions(tableRange, 35))
  }, [tableRange])

  const currentQ = questions[currentIndex] || null

  // Main countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (isFrozen) return // Time freeze power-up active

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isFrozen])

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    gameSound.playVictory()
    onFinish({
      score,
      correctCount: currentIndex,
      maxStreak,
      timeSpent,
    })
  }, [currentIndex, maxStreak, onFinish, score])

  // Process answer submission
  const submitAnswerValue = (val: number) => {
    if (feedback !== 'idle' || !currentQ) return

    setSelectedMeteor(val)

    if (val === currentQ.answer) {
      // CORRECT!
      gameSound.playLaser()
      setTimeout(() => gameSound.playCorrect(), 80)
      setFeedback('correct')

      const comboMul = streak >= 5 ? 3 : streak >= 2 ? 2 : 1
      const totalMul = comboMul * activeMultiplier
      const basePoints = currentQ.isBoss ? 200 : 100
      const earned = basePoints * totalMul

      setScore((s) => s + earned)
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setMaxStreak((m) => Math.max(m, nextStreak))

      setFloatingScore(`+${earned} XP ${totalMul > 1 ? `(${totalMul}x COMBO!)` : ''}`)
      setTimeout(() => setFloatingScore(null), 1000)

      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          endGame()
        } else {
          setCurrentIndex((i) => i + 1)
          setTypedInput('')
          setSelectedMeteor(null)
          setDestroyedMeteors([])
          setFeedback('idle')
        }
      }, 550)
    } else {
      // WRONG!
      gameSound.playWrong()
      setFeedback('wrong')
      setStreak(0)
      const remLives = lives - 1
      setLives(remLives)

      if (remLives <= 0) {
        setTimeout(() => endGame(), 800)
      } else {
        setTimeout(() => {
          setTypedInput('')
          setSelectedMeteor(null)
          setFeedback('idle')
        }, 800)
      }
    }
  }

  // Numpad key input
  const handleNumClick = (digit: string) => {
    if (feedback !== 'idle') return
    if (typedInput.length >= 4) return
    gameSound.playTileClick()
    setTypedInput((prev) => prev + digit)
  }

  const handleBackspace = () => {
    if (feedback !== 'idle') return
    gameSound.playTileClick()
    setTypedInput((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (feedback !== 'idle') return
    gameSound.playTileClick()
    setTypedInput('')
  }

  const handleNumpadSubmit = () => {
    if (!typedInput || feedback !== 'idle') return
    const num = parseInt(typedInput, 10)
    if (!isNaN(num)) {
      submitAnswerValue(num)
    }
  }

  // Physical Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== 'idle' || !currentQ) return

      if (mode === 'numpad') {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault()
          handleNumClick(e.key)
        } else if (e.key === 'Backspace') {
          e.preventDefault()
          handleBackspace()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          handleNumpadSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [feedback, currentQ, mode, typedInput])

  // POWER-UPS HANDLERS
  const useTimeFreeze = () => {
    if (timeFreezeAvailable <= 0 || isFrozen) return
    gameSound.playPowerup()
    setTimeFreezeAvailable((p) => p - 1)
    setIsFrozen(true)
    setTimeout(() => setIsFrozen(false), 6000)
  }

  const useLaserNuke = () => {
    if (nukeAvailable <= 0 || !currentQ || feedback !== 'idle') return
    gameSound.playPowerup()
    setNukeAvailable((n) => n - 1)

    // Eliminate 2 wrong distractors in meteor mode or auto-fill in numpad mode
    if (mode === 'blaster') {
      const wrongOpts = currentQ.distractors.filter((n) => n !== currentQ.answer)
      setDestroyedMeteors(wrongOpts.slice(0, 2))
    } else {
      setTypedInput(String(currentQ.answer))
    }
  }

  const useShieldRepair = () => {
    if (shieldAvailable <= 0 || lives >= 3) return
    gameSound.playPowerup()
    setShieldAvailable((s) => s - 1)
    setLives((l) => Math.min(3, l + 1))
  }

  if (!currentQ) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <p className="text-xl font-bold">Menyediakan Arena Pantas Sifir...</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-4xl select-none rounded-3xl border-2 border-[#544bc9]/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131b4d] via-[#0b102e] to-[#040614] p-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:p-7">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-950/80 px-3.5 py-1.5 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-300">Soalan</span>
            <span className="text-sm font-black text-yellow-400">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Lives Indicator */}
          <div className="flex items-center gap-1 rounded-full bg-rose-950/60 px-3 py-1.5 border border-rose-500/30">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 transition-all duration-300 ${
                  i < lives
                    ? 'fill-rose-500 text-rose-500 scale-100'
                    : 'fill-slate-700 text-slate-600 scale-75 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="animate-bounce flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-extrabold text-black shadow-lg">
              <Flame className="h-4 w-4 fill-yellow-200" />
              {streak >= 5 ? '3X MEGA COMBO!' : `${streak}X STREAK!`}
            </div>
          )}

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-1.5 font-mono text-base font-black border ${
              isFrozen
                ? 'animate-pulse border-cyan-400 bg-cyan-900/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : timeLeft <= 15
                ? 'animate-pulse border-red-500 bg-red-600/30 text-red-300'
                : 'border-indigo-400/30 bg-indigo-900/50 text-indigo-100'
            }`}
          >
            {isFrozen ? '❄️ FREEZE' : `⏱️ ${timeLeft}s`}
          </div>

          {/* Score Counter */}
          <div className="relative rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-4 py-1.5 text-right">
            <div className="text-[10px] uppercase font-bold text-yellow-300">Skor XP</div>
            <div className="text-lg font-black text-yellow-400 leading-none">{score}</div>

            {floatingScore && (
              <div className="pointer-events-none absolute -top-7 right-0 animate-out fade-out slide-out-to-top duration-1000 whitespace-nowrap text-sm font-black text-green-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {floatingScore}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boss Round Alert */}
      {currentQ.isBoss && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-900/60 to-purple-900/60 border border-red-500/40 py-1.5 px-4 text-xs font-black uppercase text-red-300 tracking-wider animate-pulse">
          🚀 METEOR BOSS: 2X XP BONUS SOALAN PANTAS!
        </div>
      )}

      {/* Main Question Display Arena */}
      <div className="mt-5 rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-b from-[#1b1c5a]/80 to-[#101238]/90 p-6 text-center shadow-inner backdrop-blur-md">
        <p className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
          Kira Jawapan Sifir Pantas:
        </p>

        <div className="my-4">
          <span className="font-mono text-4xl sm:text-6xl font-black tracking-wider text-yellow-300 drop-shadow-[0_4px_12px_rgba(234,179,8,0.4)]">
            {currentQ.displayPrompt}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="min-h-6 text-sm font-bold">
          {feedback === 'correct' && (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-5 w-5" /> TEPAT! METEOR DIMUSNAHKAN! 💥
            </span>
          )}
          {feedback === 'wrong' && (
            <span className="inline-flex items-center gap-1.5 text-rose-400">
              <XCircle className="h-5 w-5" /> Perisai rosak! Jawapan sebenar: {currentQ.answer} (-1 ❤️)
            </span>
          )}
        </div>
      </div>

      {/* Power-up Action Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={useTimeFreeze}
          disabled={timeFreezeAvailable <= 0 || isFrozen}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 disabled:opacity-30 transition"
        >
          <Hourglass className="h-3.5 w-3.5" /> Freeze Time ({timeFreezeAvailable})
        </button>

        <button
          type="button"
          onClick={useLaserNuke}
          disabled={nukeAvailable <= 0}
          className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-950/50 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 disabled:opacity-30 transition"
        >
          <Bomb className="h-3.5 w-3.5" /> Laser Nuke ({nukeAvailable})
        </button>

        <button
          type="button"
          onClick={useShieldRepair}
          disabled={shieldAvailable <= 0 || lives >= 3}
          className="flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-950/50 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 disabled:opacity-30 transition"
        >
          <Shield className="h-3.5 w-3.5" /> Repair Heart ({shieldAvailable})
        </button>
      </div>

      {/* GAMEPLAY AREA: MODE A (METEOR BLASTER) VS MODE B (CYBER NUMPAD RUSH) */}
      {mode === 'blaster' ? (
        <div className="mt-5">
          <div className="text-center text-xs font-bold text-indigo-300 mb-3">
            🎯 TEMBAK METEOR DENGAN JAWAPAN YANG BETUL:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentQ.distractors.map((option) => {
              const isDestroyed = destroyedMeteors.includes(option)
              const isTargetAnswer = option === currentQ.answer
              const isSelected = selectedMeteor === option

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => submitAnswerValue(option)}
                  disabled={feedback !== 'idle' || isDestroyed}
                  className={`group relative flex flex-col items-center justify-center h-28 sm:h-32 rounded-3xl border-2 font-mono transition-all duration-200 active:scale-95 ${
                    isDestroyed
                      ? 'scale-75 opacity-10 border-slate-700 bg-slate-900 cursor-not-allowed'
                      : feedback === 'correct' && isSelected
                      ? 'border-emerald-400 bg-emerald-600/90 text-white shadow-[0_0_30px_rgba(16,185,129,0.7)] scale-105'
                      : feedback === 'wrong' && isSelected
                      ? 'border-rose-500 bg-rose-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.7)]'
                      : 'border-indigo-400/40 bg-gradient-to-b from-indigo-800/80 to-purple-900/90 text-yellow-300 shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:border-yellow-400 hover:shadow-[0_12px_25px_rgba(234,179,8,0.3)]'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-black">{option}</span>
                  <span className="mt-1 text-[10px] font-bold text-indigo-200 flex items-center gap-1">
                    <Crosshair className="h-3 w-3 text-cyan-400 group-hover:rotate-90 transition-transform" /> Tembak
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* MODE B: CYBER NUMPAD RUSH */
        <div className="mt-5 mx-auto max-w-sm">
          {/* Input Screen Display */}
          <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-indigo-400/50 bg-indigo-950/80 px-5 py-3 shadow-inner">
            <span className="text-xs font-bold text-indigo-300 uppercase">Input:</span>
            <span className="font-mono text-3xl font-black text-yellow-400 tracking-widest min-w-16 text-right">
              {typedInput || '_'}
            </span>
          </div>

          {/* Tactical Arcade Numpad */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumClick(digit)}
                disabled={feedback !== 'idle'}
                className="flex h-14 items-center justify-center rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-800 to-indigo-950 font-mono text-2xl font-black text-white shadow-md active:scale-95 hover:border-indigo-300 hover:brightness-110 transition"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackspace}
              disabled={feedback !== 'idle' || typedInput.length === 0}
              className="flex h-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-950/50 text-rose-300 font-bold text-sm active:scale-95 hover:bg-rose-900/60 disabled:opacity-30 transition"
            >
              ⌫ Padam
            </button>

            <button
              type="button"
              onClick={() => handleNumClick('0')}
              disabled={feedback !== 'idle'}
              className="flex h-14 items-center justify-center rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-800 to-indigo-950 font-mono text-2xl font-black text-white shadow-md active:scale-95 hover:border-indigo-300 hover:brightness-110 transition"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleNumpadSubmit}
              disabled={feedback !== 'idle' || typedInput.length === 0}
              className="flex h-14 items-center justify-center rounded-2xl border border-emerald-400 bg-gradient-to-b from-emerald-600 to-teal-700 font-bold text-sm text-white shadow-lg active:scale-95 hover:brightness-110 disabled:opacity-40 transition"
            >
              ↵ Hantar
            </button>
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="mt-6 flex items-center justify-between pt-3 border-t border-indigo-500/20">
        <span className="text-xs text-indigo-300">
          💡 Skor berganda dengan jawapan pantas berturut-turut!
        </span>
        <button
          type="button"
          onClick={onExit}
          className="rounded-2xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
        >
          Keluar Cabaran
        </button>
      </div>
    </div>
  )
}
