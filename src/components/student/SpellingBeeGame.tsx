'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  Shuffle,
  Flame,
  Heart,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle2,
  XCircle,
  Rocket,
  Shield,
  Zap,
  Lock,
  ChevronUp,
  ChevronDown,
  CloudRain,
  Compass,
  Timer,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'

export type SpellingInputMode = 'tiles' | 'wheel' | 'rain' | 'slot'

export interface SpellingWord {
  word: string
  translation: string // Maksud dalam BM
  sentence: string // Ayat contoh dengan perkataan kosong
  category: 'Cadet' | 'Explorer' | 'Cosmic'
  phonetic?: string
}

const SPELLING_DICTIONARY: SpellingWord[] = [
  // Cadet (Easy)
  { word: 'STAR', translation: 'Bintang yang bersinar di langit malam', sentence: 'The brightest ____ in the galaxy.', category: 'Cadet' },
  { word: 'MOON', translation: 'Bulan yang mengelilingi planet bumi', sentence: 'We can see the full ____ tonight.', category: 'Cadet' },
  { word: 'EARTH', translation: 'Planet tempat tinggal manusia', sentence: 'We must take care of planet ____.', category: 'Cadet' },
  { word: 'LIGHT', translation: 'Cahaya yang menerangi kegelapan', sentence: 'The speed of ____ is very fast.', category: 'Cadet' },
  { word: 'SOLAR', translation: 'Berkaitan dengan tenaga atau sistem matahari', sentence: 'Our planet is in the ____ system.', category: 'Cadet' },
  { word: 'SPACE', translation: 'Angkasa lepas di luar atmosfera bumi', sentence: 'Astronauts travel to outer ____.', category: 'Cadet' },
  { word: 'ALIEN', translation: 'Makhluk luar angkasa', sentence: 'He loves drawing funny green ____ characters.', category: 'Cadet' },
  { word: 'ORBIT', translation: 'Peredaran satelit mengelilingi planet', sentence: 'The satellite is in low Earth ____.', category: 'Cadet' },
  { word: 'PILOT', translation: 'Pemandu kapal angkasa atau kapal terbang', sentence: 'The spaceship ____ was very brave.', category: 'Cadet' },
  { word: 'BRAVE', translation: 'Berani menghadapi cabaran', sentence: 'Explorers are ____ and curious.', category: 'Cadet' },

  // Explorer (Medium)
  { word: 'ROCKET', translation: 'Kenderaan roket untuk ke angkasa lepas', sentence: 'The massive ____ launched into the sky.', category: 'Explorer' },
  { word: 'GALAXY', translation: 'Sistem bintang yang luas seperti Bima Sakti', sentence: 'The Milky Way is our home ____.', category: 'Explorer' },
  { word: 'PLANET', translation: 'Objek angkasa besar yang mengorbit matahari', sentence: 'Mars is known as the Red ____.', category: 'Explorer' },
  { word: 'METEOR', translation: 'Batu angkasa yang membakar apabila masuk atmosfera', sentence: 'Look, a shooting star is actually a ____!', category: 'Explorer' },
  { word: 'ENERGY', translation: 'Daya atau tenaga untuk melakukan kerja', sentence: 'Solar panels generate clean ____.', category: 'Explorer' },
  { word: 'FUTURE', translation: 'Masa depan yang penuh teknologi', sentence: 'Robots and AI will shape our ____.', category: 'Explorer' },
  { word: 'ENGINE', translation: 'Enjin penggerak kapal angkasa', sentence: 'The booster ____ ignited with roaring fire.', category: 'Explorer' },
  { word: 'GRAVITY', translation: 'Daya tarikan graviti bumi', sentence: 'Zero ____ makes astronauts float gently.', category: 'Explorer' },
  { word: 'SCIENCE', translation: 'Ilmu sains tentang alam semesta', sentence: 'I love studying space ____ at school.', category: 'Explorer' },
  { word: 'EXPLORE', translation: 'Meneroka kawasan baru yang belum diketahui', sentence: 'We love to ____ new mysteries in the cosmos.', category: 'Explorer' },

  // Cosmic (Advanced)
  { word: 'ASTRONAUT', translation: 'Angkasawan yang menjelajah angkasa', sentence: 'The ____ repaired the space station.', category: 'Cosmic' },
  { word: 'TELESCOPE', translation: 'Alat untuk melihat bintang dan galaksi jauh', sentence: 'The James Webb ____ captured stunning photos.', category: 'Cosmic' },
  { word: 'UNIVERSE', translation: 'Seluruh alam semesta dan isinya', sentence: 'The ____ is unimaginably vast and mysterious.', category: 'Cosmic' },
  { word: 'DISCOVERY', translation: 'Penemuan baharu yang mengagumkan', sentence: 'The scientist made a groundbreaking ____.', category: 'Cosmic' },
  { word: 'SATELLITE', translation: 'Satelit buatan yang mengorbit bumi', sentence: 'Communication depends on orbital ____ signals.', category: 'Cosmic' },
  { word: 'ADVENTURE', translation: 'Pengembaraan yang menarik dan mencabar', sentence: 'Our cosmic space ____ begins right now.', category: 'Cosmic' },
  { word: 'ATMOSPHERE', translation: 'Lapisan udara yang melindungi planet', sentence: 'Earth is protected by a breathable ____.', category: 'Cosmic' },
  { word: 'NAVIGATION', translation: 'Pandu arah kapal angkasa melalui bintang', sentence: 'The star charts assisted the ship ____.', category: 'Cosmic' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

interface LetterTile {
  id: string
  letter: string
  isUsed: boolean
}

interface SpellingBeeGameProps {
  difficulty: 'all' | 'Cadet' | 'Explorer' | 'Cosmic'
  initialInputMode?: SpellingInputMode
  onFinish: (result: { score: number; correctCount: number; maxStreak: number; timeSpent: number }) => void
  onExit: () => void
}

export function SpellingBeeGame({
  difficulty,
  initialInputMode = 'tiles',
  onFinish,
  onExit,
}: SpellingBeeGameProps) {
  const [wordList, setWordList] = useState<SpellingWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputMode, setInputMode] = useState<SpellingInputMode>(initialInputMode)

  const [typedLetters, setTypedLetters] = useState<string[]>([])
  const [availableTiles, setAvailableTiles] = useState<LetterTile[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(90)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [floatingScore, setFloatingScore] = useState<string | null>(null)
  const [speechPitch] = useState(1)
  const [speechRate] = useState(0.85)
  const [bossBattle, setBossBattle] = useState(false)

  // 1. Roda Leret (Wheel) State
  const [wheelPool, setWheelPool] = useState<string[]>([])
  const [wheelPath, setWheelPath] = useState<number[]>([])
  const [isWheelDragging, setIsWheelDragging] = useState(false)
  const [wheelPointerCoord, setWheelPointerCoord] = useState<{ x: number; y: number } | null>(null)
  const wheelRef = useRef<HTMLDivElement | null>(null)

  // 2. Hujan Huruf (Rain) State
  const [rainMeteors, setRainMeteors] = useState<{
    id: number
    letter: string
    x: number
    y: number
    speed: number
  }[]>([])
  const rainNextIdRef = useRef(1)
  const rainReqRef = useRef<number | null>(null)
  const rainLastTimeRef = useRef<number>(0)
  const rainSpawnTimerRef = useRef<number>(0)

  // 3. Gelendong Huruf (Reels) State
  const [reelLetters, setReelLetters] = useState<string[]>([])

  // Instantaneous state refs for 100% accurate single-tap detection
  const typedLettersRef = useRef<string[]>(typedLetters)
  useEffect(() => {
    typedLettersRef.current = typedLetters
  }, [typedLetters])
  const lastHandledMeteorIdRef = useRef<number | null>(null)

  const currentWordObj = wordList[currentIndex] || null
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef(Date.now())

  // Speech Synthesis Helper: Suara sebutan perlahan & jelas secara lalai
  const speakWord = useCallback((word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word.toLowerCase())
      utterance.rate = 0.72
      utterance.pitch = 1
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  // Initialize Word List
  useEffect(() => {
    let pool = [...SPELLING_DICTIONARY]
    if (difficulty !== 'all') {
      pool = pool.filter((w) => w.category === difficulty)
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    setWordList(shuffled)
  }, [difficulty])

  // Setup current word
  const setupWord = useCallback((wordObj: SpellingWord, wordIndex: number) => {
    setTypedLetters([])
    setFeedback('idle')
    setBossBattle((wordIndex + 1) % 5 === 0)
    setWheelPath([])
    setRainMeteors([])

    const targetWord = wordObj.word.toUpperCase()
    const wordLetters = targetWord.split('')

    // Setup Tiles Decoys
    const decoyCount = targetWord.length <= 5 ? 2 : 3
    const decoys: string[] = []
    for (let i = 0; i < decoyCount; i++) {
      const r = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
      decoys.push(r)
    }
    const allLetters = [...wordLetters, ...decoys].sort(() => 0.5 - Math.random())
    const tiles: LetterTile[] = allLetters.map((char, i) => ({
      id: `${char}-${i}-${Date.now()}`,
      letter: char,
      isUsed: false,
    }))
    setAvailableTiles(tiles)

    // Setup Roda Leret (shuffled letters of target word)
    let shuffledWheel = [...wordLetters].sort(() => 0.5 - Math.random())
    if (wordLetters.length > 1 && shuffledWheel.join('') === targetWord) {
      shuffledWheel = [...shuffledWheel].reverse()
    }
    setWheelPool(shuffledWheel)

    // Setup Gelendong Huruf (randomized initial characters for each column)
    const initialReels = wordLetters.map((char) => {
      const offset = Math.floor(Math.random() * 5) + 2
      const code = char.charCodeAt(0) - 65
      return ALPHABET[(code + offset) % 26]
    })
    setReelLetters(initialReels)

    // Speak word
    speakWord(wordObj.word)
  }, [speakWord])

  // Load question when wordList or currentIndex changes
  useEffect(() => {
    if (wordList.length > 0 && currentIndex < wordList.length) {
      setupWord(wordList[currentIndex], currentIndex)
    }
  }, [wordList, currentIndex, setupWord])

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
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
  }, [])

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

  // Evaluate final spelling
  const checkSpelling = useCallback((submittedWord: string) => {
    if (!currentWordObj || feedback !== 'idle') return
    const target = currentWordObj.word.toUpperCase()

    if (submittedWord === target) {
      // CORRECT!
      gameSound.playCorrect()
      setFeedback('correct')

      const multiplier = streak >= 5 ? 3 : streak >= 2 ? 2 : 1
      const basePoints = bossBattle ? 250 : 100
      const earned = basePoints * multiplier

      setScore((s) => s + earned)
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setMaxStreak((m) => Math.max(m, nextStreak))

      setFloatingScore(`+${earned} XP ${multiplier > 1 ? `(${multiplier}x COMBO!)` : ''}`)
      setTimeout(() => setFloatingScore(null), 1200)

      setTimeout(() => {
        if (currentIndex + 1 >= wordList.length) {
          endGame()
        } else {
          setCurrentIndex((i) => i + 1)
        }
      }, 900)
    } else {
      // WRONG!
      gameSound.playWrong()
      setFeedback('wrong')
      setStreak(0)

      const remainingLives = lives - 1
      setLives(remainingLives)

      if (remainingLives <= 0) {
        setTimeout(() => {
          endGame()
        }, 1100)
      } else {
        setTimeout(() => {
          setTypedLetters([])
          setAvailableTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })))
          setWheelPath([])
          setFeedback('idle')
        }, 1100)
      }
    }
  }, [bossBattle, currentIndex, currentWordObj, endGame, feedback, lives, streak, wordList.length])

  // ==========================================
  // MODE 1: JUBIN HURUF CONTROLS
  // ==========================================
  const handleTileClick = (tile: LetterTile) => {
    if (feedback !== 'idle' || tile.isUsed || !currentWordObj) return
    if (typedLetters.length >= currentWordObj.word.length) return

    gameSound.playTileClick()
    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, isUsed: true } : t))
    )
    const nextTyped = [...typedLetters, tile.letter]
    setTypedLetters(nextTyped)

    if (nextTyped.length === currentWordObj.word.length) {
      checkSpelling(nextTyped.join(''))
    }
  }

  const handleBackspace = () => {
    if (feedback !== 'idle' || typedLetters.length === 0) return
    gameSound.playTileClick()
    const lastLetter = typedLetters[typedLetters.length - 1]
    const nextTyped = typedLetters.slice(0, -1)
    setTypedLetters(nextTyped)

    setAvailableTiles((prev) => {
      let freed = false
      return prev.map((t) => {
        if (!freed && t.isUsed && t.letter === lastLetter) {
          freed = true
          return { ...t, isUsed: false }
        }
        return t
      })
    })
    setWheelPath([])
  }

  const handleClear = () => {
    if (feedback !== 'idle' || typedLetters.length === 0) return
    gameSound.playTileClick()
    setTypedLetters([])
    setWheelPath([])
    setAvailableTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })))
  }

  const handleShuffle = () => {
    gameSound.playTileClick()
    setAvailableTiles((prev) => [...prev].sort(() => 0.5 - Math.random()))
    setWheelPool((prev) => [...prev].sort(() => 0.5 - Math.random()))
  }

  const handleUseHint = () => {
    if (hintsUsed >= 3 || !currentWordObj || feedback !== 'idle') return
    const target = currentWordObj.word.toUpperCase()
    const currentLen = typedLetters.length
    if (currentLen < target.length) {
      const neededLetter = target[currentLen]
      gameSound.playPowerup()
      setHintsUsed((h) => h + 1)

      if (inputMode === 'tiles') {
        const matchingTile = availableTiles.find((t) => !t.isUsed && t.letter === neededLetter)
        if (matchingTile) handleTileClick(matchingTile)
      } else if (inputMode === 'slot') {
        // Automatically align the current reel to correct letter
        setReelLetters((prev) => {
          const next = [...prev]
          next[currentLen] = neededLetter
          return next
        })
      } else {
        const nextTyped = [...typedLetters, neededLetter]
        setTypedLetters(nextTyped)
        if (nextTyped.length === target.length) checkSpelling(nextTyped.join(''))
      }
    }
  }

  // Keyboard typing support (works in tiles mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== 'idle' || !currentWordObj) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
        return
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        handleClear()
        return
      }

      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key)) {
        if (inputMode === 'tiles') {
          const matchingTile = availableTiles.find((t) => !t.isUsed && t.letter === key)
          if (matchingTile && typedLetters.length < currentWordObj.word.length) {
            handleTileClick(matchingTile)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [availableTiles, currentWordObj, feedback, typedLetters, inputMode])

  // ==========================================
  // MODE 2: RODA LERET (WHEEL SWIPE) CONTROLS
  // ==========================================
  const wheelNodesCount = wheelPool.length
  const wheelNodePositions = wheelPool.map((_, i) => {
    const angle = (i / Math.max(1, wheelNodesCount)) * 2 * Math.PI - Math.PI / 2
    return {
      x: 50 + 37 * Math.cos(angle),
      y: 50 + 37 * Math.sin(angle),
    }
  })

  const checkWheelHit = (clientX: number, clientY: number, isInitial: boolean) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * 100
    const py = ((clientY - rect.top) / rect.height) * 100
    setWheelPointerCoord({ x: px, y: py })

    let hitIndex = -1
    wheelNodePositions.forEach((pos, idx) => {
      const dx = px - pos.x
      const dy = py - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 15) {
        hitIndex = idx
      }
    })

    if (hitIndex !== -1) {
      setWheelPath((prev) => {
        if (isInitial) {
          gameSound.playTileClick()
          setTypedLetters([wheelPool[hitIndex]])
          return [hitIndex]
        }
        const last = prev[prev.length - 1]
        if (last === hitIndex) return prev

        // Undo move when swiping back
        if (prev.length >= 2 && prev[prev.length - 2] === hitIndex) {
          gameSound.playTileClick()
          const next = prev.slice(0, -1)
          setTypedLetters(next.map((i) => wheelPool[i]))
          return next
        }

        if (!prev.includes(hitIndex)) {
          gameSound.playTileClick()
          const next = [...prev, hitIndex]
          setTypedLetters(next.map((i) => wheelPool[i]))
          return next
        }
        return prev
      })
    }
  }

  const handleWheelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (feedback !== 'idle' || !currentWordObj) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    setIsWheelDragging(true)
    checkWheelHit(e.clientX, e.clientY, true)
  }

  const handleWheelPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isWheelDragging || feedback !== 'idle') return
    checkWheelHit(e.clientX, e.clientY, false)
  }

  const handleWheelPointerUp = () => {
    if (!isWheelDragging) return
    setIsWheelDragging(false)
    setWheelPointerCoord(null)
    if (feedback !== 'idle' || !currentWordObj) return

    const target = currentWordObj.word.toUpperCase()
    if (wheelPath.length === target.length) {
      const spelled = wheelPath.map((i) => wheelPool[i]).join('')
      checkSpelling(spelled)
    } else {
      setWheelPath([])
      setTypedLetters([])
    }
  }

  // ==========================================
  // MODE 3: HUJAN HURUF (RAIN) ENGINE
  // ==========================================
  useEffect(() => {
    if (inputMode !== 'rain' || feedback !== 'idle' || !currentWordObj) {
      return
    }

    const targetWord = currentWordObj.word.toUpperCase()
    let isRunning = true
    let lastTime = performance.now()
    let spawnTimer = 0

    const loop = (time: number) => {
      if (!isRunning) return
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      spawnTimer += dt
      if (spawnTimer > 0.85) {
        spawnTimer = 0
        const currentTyped = typedLettersRef.current
        const neededLetter = targetWord[currentTyped.length] || targetWord[0]

        setRainMeteors((prev) => {
          const hasNeeded = prev.some((m) => m.letter === neededLetter)
          const shouldSpawnNeeded = Math.random() < 0.55 || !hasNeeded
          const letter = shouldSpawnNeeded
            ? neededLetter
            : Math.random() < 0.6
            ? targetWord[Math.floor(Math.random() * targetWord.length)]
            : ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

          return [
            ...prev,
            {
              id: rainNextIdRef.current++,
              letter,
              x: Math.floor(Math.random() * 74) + 13,
              y: -25,
              speed: Math.floor(Math.random() * 25) + 60,
            },
          ]
        })
      }

      // Move meteors down smoothly
      setRainMeteors((prev) =>
        prev
          .map((m) => ({ ...m, y: m.y + m.speed * dt }))
          .filter((m) => m.y < 280)
      )

      rainReqRef.current = requestAnimationFrame(loop)
    }

    rainReqRef.current = requestAnimationFrame(loop)

    return () => {
      isRunning = false
      if (rainReqRef.current) cancelAnimationFrame(rainReqRef.current)
    }
  }, [inputMode, feedback, currentWordObj])

  const handleRainMeteorSelect = (meteor: { id: number; letter: string }) => {
    if (feedback !== 'idle' || !currentWordObj) return
    if (lastHandledMeteorIdRef.current === meteor.id) return
    lastHandledMeteorIdRef.current = meteor.id

    const targetWord = currentWordObj.word.toUpperCase()
    const currentTyped = typedLettersRef.current
    const neededLetter = targetWord[currentTyped.length]

    if (meteor.letter === neededLetter) {
      gameSound.playTileClick()
      // Remove popped meteor instantly
      setRainMeteors((prev) => prev.filter((m) => m.id !== meteor.id))
      const nextTyped = [...currentTyped, meteor.letter]
      typedLettersRef.current = nextTyped
      setTypedLetters(nextTyped)

      if (nextTyped.length === targetWord.length) {
        checkSpelling(nextTyped.join(''))
      }
    } else {
      gameSound.playWrong()
      const remainingLives = lives - 1
      setLives(remainingLives)
      setFeedback('wrong')

      if (remainingLives <= 0) {
        setTimeout(() => endGame(), 1000)
      } else {
        setTimeout(() => setFeedback('idle'), 700)
      }
    }
  }

  // ==========================================
  // MODE 4: GELENDONG HURUF (REELS) CONTROLS
  // ==========================================
  const spinReel = (colIndex: number, delta: number) => {
    if (feedback !== 'idle') return
    gameSound.playTileClick()
    setReelLetters((prev) => {
      const next = [...prev]
      const currentCode = (next[colIndex] || 'A').charCodeAt(0) - 65
      const newCode = (currentCode + delta + 26) % 26
      next[colIndex] = ALPHABET[newCode]
      return next
    })
  }

  if (!currentWordObj) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <p className="text-xl font-bold">Memuatkan Cabaran Spelling Bee...</p>
      </div>
    )
  }

  const targetLength = currentWordObj.word.length
  const progressPercent = ((currentIndex + 1) / Math.max(1, wordList.length)) * 100

  // SVG Polyline for Roda Leret
  let wheelPolylinePoints = wheelPath.map((idx) => `${wheelNodePositions[idx].x},${wheelNodePositions[idx].y}`)
  if (isWheelDragging && wheelPointerCoord && wheelPath.length > 0) {
    wheelPolylinePoints.push(`${wheelPointerCoord.x},${wheelPointerCoord.y}`)
  }

  return (
    <div className="relative mx-auto max-w-4xl select-none rounded-3xl border-2 border-[#544bc9]/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d1e63] via-[#0f1035] to-[#07081a] p-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:p-7">
      
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-950/80 px-3.5 py-1.5 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-300">Soalan</span>
            <span className="text-sm font-black text-white">
              {currentIndex + 1} / {wordList.length}
            </span>
          </div>

          {/* Lives Indicator */}
          <div className="flex items-center gap-1 rounded-full bg-indigo-950/80 px-3 py-1.5 border border-indigo-500/30">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 transition-all duration-300 ${
                  i < lives
                    ? 'fill-sky-400 text-sky-400 scale-100'
                    : 'fill-slate-700 text-slate-600 scale-75 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating Combo Multiplier */}
        {streak >= 2 && (
          <div className="animate-bounce flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg">
            <Flame className="h-4 w-4 fill-white" />
            {streak >= 5 ? '3X MEGA COMBO!' : `${streak}X STREAK!`}
          </div>
        )}
      </div>

      {/* Progress Rocket Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Rocket className="h-3.5 w-3.5 text-cyan-400" /> Kemajuan Ejaan Explorer
          </span>
          <span className="font-bold text-cyan-300">{Math.round(progressPercent)}% Selesai</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-950 border border-indigo-800/50">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Boss Indicator */}
      {bossBattle && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-pink-500/40 py-1.5 px-4 text-xs font-black uppercase text-pink-300 tracking-wider animate-pulse">
          👾 BOSS CHALLENGE: EJAAN BONUS XP TINGGI!
        </div>
      )}

      {/* Audio Pronunciation Card - Padat & Kemas */}
      <div className="mt-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-3 py-2.5 text-center backdrop-blur-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => speakWord(currentWordObj.word)}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-xs font-black text-white shadow-xs transition-all hover:scale-105 active:scale-95 hover:shadow-cyan-500/20 cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5 animate-pulse group-hover:scale-110" />
            <span className="tracking-wide">DENGAR SEBUTAN</span>
          </button>
        </div>

        {/* Clue and Translation */}
        <div className="mt-2 space-y-1">
          <div>
            <span className="inline-block rounded-full bg-blue-600/25 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-cyan-200 shadow-xs">
              PETUNJUK
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-white drop-shadow-sm">
            "{currentWordObj.translation}"
          </p>
          <p className="text-xs font-medium italic text-indigo-200/80">
            {currentWordObj.sentence}
          </p>
        </div>
      </div>

      {/* Target Word Slots Preview (Bahagian Isi Jawapan) */}
      <div className="mt-4 flex flex-col items-center justify-center">
        {/* Timer Alert Tepat di Bahagian Menjawab (Masa di bahagian belakang) */}
        <div className="mb-2.5 flex items-center justify-center gap-3">
          <span className="text-xs font-bold uppercase text-indigo-300 tracking-wider">
            {inputMode === 'slot'
              ? 'Pusingkan Gelendong'
              : `Susun Huruf (${typedLetters.length} / ${targetLength})`}
          </span>

          <div
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-1 font-mono text-sm sm:text-base font-black shadow-md border transition-all ${
              timeLeft <= 15
                ? 'animate-pulse border-sky-300 bg-blue-600 text-white ring-4 ring-sky-400/60 shadow-blue-500/50 scale-105'
                : 'border-indigo-400/40 bg-indigo-900/90 text-white shadow-indigo-950/50'
            }`}
          >
            <span className="text-base sm:text-lg">⏱️</span>
            <span>{timeLeft}s</span>
          </div>
        </div>

        {inputMode !== 'slot' && (
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl transition-all duration-300 ${
              feedback === 'correct'
                ? 'bg-emerald-950/60 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : feedback === 'wrong'
                ? 'animate-shake bg-slate-900/80 border-2 border-slate-400'
                : 'bg-indigo-950/20'
            }`}
          >
            {Array.from({ length: targetLength }).map((_, index) => {
              const letter = typedLetters[index]
              const isFilled = Boolean(letter)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (isFilled && feedback === 'idle') {
                      handleBackspace()
                    }
                  }}
                  disabled={!isFilled || feedback !== 'idle'}
                  className={`relative flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-2xl font-mono text-2xl sm:text-3xl font-black transition-all duration-200 ${
                    feedback === 'correct'
                      ? 'border-2 border-emerald-400 bg-emerald-600 text-white shadow-lg'
                      : feedback === 'wrong'
                      ? 'border-2 border-slate-400 bg-slate-800 text-white'
                      : isFilled
                      ? 'border-2 border-cyan-400 bg-gradient-to-b from-blue-600 to-indigo-800 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 cursor-pointer'
                      : 'border-2 border-dashed border-indigo-600/50 bg-indigo-950/40 text-transparent cursor-default'
                  }`}
                  title={isFilled ? 'Tekan untuk padam huruf' : undefined}
                >
                  {letter || ''}
                  {!isFilled && (
                    <span className="absolute bottom-2 h-1 w-4 rounded-full bg-indigo-600/50" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Feedback message */}
        <div className="min-h-6 mt-2 text-center text-sm font-bold">
          {feedback === 'correct' && (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-4 w-4" /> TEPAT SEKALI! HEBAT!
            </span>
          )}
          {feedback === 'wrong' && (
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <XCircle className="h-4 w-4 text-slate-400" /> Ejaan belum tepat, cuba lagi! (-1 ❤️)
            </span>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: JUBIN HURUF (TOUCH TILES / KEYBOARD)              */}
      {/* ======================================================== */}
      {inputMode === 'tiles' && (
        <div className="mt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-indigo-300">
              Pilih Huruf atau Taip di Papan Kekunci:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseHint}
                disabled={hintsUsed >= 3}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-950/90 border border-indigo-400/40 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-800 hover:text-white disabled:opacity-40 transition cursor-pointer shadow-xs"
                title="Dedahkan huruf seterusnya"
              >
                💡 Hint ({3 - hintsUsed})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-indigo-950/50 p-4 border border-indigo-600/30">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile)}
                disabled={tile.isUsed || feedback !== 'idle'}
                className={`flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl font-mono text-xl sm:text-2xl font-black transition-all active:scale-90 cursor-pointer ${
                  tile.isUsed
                    ? 'scale-90 border border-slate-700 bg-slate-900/40 text-slate-600 opacity-20 cursor-not-allowed'
                    : 'border-2 border-cyan-400/40 bg-gradient-to-b from-cyan-600 to-blue-700 text-white shadow-[0_5px_15px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:border-cyan-300 hover:brightness-110'
                }`}
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: RODA LERET (CIRCULAR SWIPE WHEEL)                */}
      {/* ======================================================== */}
      {inputMode === 'wheel' && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-xs font-medium text-indigo-300 mb-2">
            Leretkan jari atau tetikus melalui huruf mengikut urutan ejaan:
          </p>

          <div
            ref={wheelRef}
            onPointerDown={handleWheelPointerDown}
            onPointerMove={handleWheelPointerMove}
            onPointerUp={handleWheelPointerUp}
            onPointerCancel={handleWheelPointerUp}
            className="relative h-64 w-64 sm:h-72 sm:w-72 rounded-full border-2 border-dashed border-indigo-500/40 bg-indigo-950/50 shadow-inner select-none touch-none"
            style={{ touchAction: 'none' }}
          >
            {/* SVG Connecting Polyline */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="none"
                points={wheelPolylinePoints.join(' ')}
              />
            </svg>

            {/* Letter Hexagon Nodes on circle perimeter */}
            {wheelPool.map((char, idx) => {
              const pos = wheelNodePositions[idx]
              const isSelected = wheelPath.includes(idx)
              const orderIndex = wheelPath.indexOf(idx)

              return (
                <div
                  key={idx}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-13 items-center justify-center font-mono text-xl font-black transition-transform duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 scale-110 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border border-indigo-400/50 hover:scale-105'
                  } rounded-2xl`}
                >
                  {char}
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-slate-950 text-[9px] font-black text-amber-300">
                      {orderIndex + 1}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-900/60 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-800 hover:text-white transition cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" /> Pusing Susunan Roda
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-900/60 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-800 hover:text-white transition cursor-pointer"
            >
              ↺ Semula
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: HUJAN HURUF (METEOR RAIN)                        */}
      {/* ======================================================== */}
      {inputMode === 'rain' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-xs text-indigo-300 font-semibold">
            <span>Ketik huruf yang jatuh mengikut urutan perkataan:</span>
            <span className="text-amber-300 font-bold">
              Cari huruf seterusnya: <span className="text-base text-yellow-400 font-black">{currentWordObj.word[typedLetters.length] || '✓'}</span>
            </span>
          </div>

          <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-b from-[#0c0d2b] to-[#121448] shadow-inner">
            {/* Ambient Star particles */}
            <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Falling Letter Bubbles */}
            {rainMeteors.map((meteor) => (
              <button
                key={meteor.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRainMeteorSelect(meteor)
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRainMeteorSelect(meteor)
                }}
                style={{
                  left: `${meteor.x}%`,
                  top: `${meteor.y}px`,
                  touchAction: 'none',
                }}
                className="absolute -translate-x-1/2 flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 font-mono text-2xl font-black text-white shadow-[0_4px_18px_rgba(56,189,248,0.6)] border-2 border-white/80 active:scale-90 transition-transform hover:brightness-125 cursor-pointer select-none touch-none"
              >
                {meteor.letter}
              </button>
            ))}

            {rainMeteors.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-indigo-300">
                Huruf sedang turun... Bersedia untuk ketik!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 4: GELENDONG HURUF (REELS / CYLINDERS)             */}
      {/* ======================================================== */}
      {inputMode === 'slot' && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-xs font-medium text-indigo-300 mb-3">
            Pusingkan atau tekan butang anak panah untuk menyusun setiap huruf:
          </p>

          {/* Reels Columns Container */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-600/40">
            {Array.from({ length: targetLength }).map((_, colIndex) => {
              const currentLetter = reelLetters[colIndex] || 'A'
              const prevLetter = ALPHABET[(currentLetter.charCodeAt(0) - 65 - 1 + 26) % 26]
              const nextLetter = ALPHABET[(currentLetter.charCodeAt(0) - 65 + 1) % 26]

              return (
                <div
                  key={colIndex}
                  className="flex flex-col items-center gap-1"
                  onWheel={(e) => {
                    e.preventDefault()
                    spinReel(colIndex, e.deltaY > 0 ? 1 : -1)
                  }}
                >
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={() => spinReel(colIndex, -1)}
                    className="grid h-8 w-11 sm:w-13 place-items-center rounded-xl bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-800 hover:text-white active:scale-90 transition cursor-pointer"
                    title="Putar ke atas"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  {/* Reel Cylinder Visual Box */}
                  <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#141642] via-[#212463] to-[#141642] shadow-[0_4px_16px_rgba(6,182,212,0.25)] h-28 w-11 sm:w-13 justify-center">
                    {/* Ghost Top Letter */}
                    <div className="text-xs font-bold text-indigo-400/40 opacity-40 -mb-1">
                      {prevLetter}
                    </div>

                    {/* Active Selected Center Letter */}
                    <div className="grid h-12 w-full place-items-center font-mono text-2xl sm:text-3xl font-black text-white my-1">
                      {currentLetter}
                    </div>

                    {/* Ghost Bottom Letter */}
                    <div className="text-xs font-bold text-indigo-400/40 opacity-40 -mt-1">
                      {nextLetter}
                    </div>
                  </div>

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={() => spinReel(colIndex, 1)}
                    className="grid h-8 w-11 sm:w-13 place-items-center rounded-xl bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-800 hover:text-white active:scale-90 transition cursor-pointer"
                    title="Putar ke bawah"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Lock and Confirm Answer Button */}
          <button
            type="button"
            onClick={() => checkSpelling(reelLetters.join(''))}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-7 py-3 text-sm font-black text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 active:scale-95 transition cursor-pointer"
          >
            <Lock className="h-4 w-4 text-white" />
            <span>KUNCI JAWAPAN &amp; SEMAK</span>
          </button>
        </div>
      )}

      {/* Control Buttons at bottom */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-500/20">
        <div className="flex items-center gap-2">
          {inputMode === 'tiles' && (
            <>
              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 active:scale-95 px-3.5 py-2 text-xs font-black text-indigo-200 hover:text-white shadow-md border border-indigo-700/50 transition cursor-pointer"
                title="Goncang susunan jubin huruf"
              >
                <Shuffle className="h-4 w-4" /> Goncang
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={typedLetters.length === 0 || feedback !== 'idle'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 active:scale-95 px-3.5 py-2 text-xs font-black text-white shadow-md border border-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" /> Kosongkan
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
        >
          Keluar Cabaran
        </button>
      </div>
    </div>
  )
}
