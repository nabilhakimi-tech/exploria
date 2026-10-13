'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  getAllSubjectsProgress,
  detectSubjectFromText,
  KNOWN_QUIZ_SUBJECT_MAP,
  type SubjectId,
} from '@/lib/subjectProgress'

export interface SubjectTrackerItem {
  id: string
  title: string
  icon: string
  href: string
  progressRatio: number
  status: 'not_started' | 'in_progress' | 'completed'
  createdAt: number // Waktu subjek dibina (epoch ms)
  lastUpdated?: number // Waktu terakhir subjek dimulakan/disambung
}

interface DbSubjectItem {
  id: string
  title: string
  category?: string
  createdAt?: Date | string | number
}

interface StudentHomeSubjectTrackerProps {
  dbSubjects?: DbSubjectItem[]
  completedQuizIds?: string[]
}

// Fungsi pembantu untuk memadankan ikon/emoji mengikut tajuk subjek
function getSubjectEmoji(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('matematik') || t.includes('math') || t.includes('sifir')) return '🧮'
  if (t.includes('sains') || t.includes('science')) return '🧪'
  if (t.includes('inggeris') || t.includes('english')) return '🔤'
  if (t.includes('melayu') || t.includes('bahasa')) return '📖'
  if (t.includes('sejarah') || t.includes('history')) return '🏛️'
  if (t.includes('coding') || t.includes('komputer') || t.includes('algoritma') || t.includes('logik')) return '💻'
  if (t.includes('seni') || t.includes('art') || t.includes('visual')) return '🎨'
  if (t.includes('muzik') || t.includes('music')) return '🎵'
  if (t.includes('geografi') || t.includes('geography')) return '🌍'
  if (t.includes('agama') || t.includes('islam') || t.includes('arab')) return '🕌'
  if (t.includes('jasmani') || t.includes('kesihatan')) return '⚽'
  return '📚'
}

// Fungsi pembantu untuk memadankan slug URL subjek
function getSubjectSlug(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('matematik') || t.includes('math')) return 'math'
  if (t.includes('sains') || t.includes('science')) return 'science'
  if (t.includes('inggeris') || t.includes('english')) return 'english'
  if (t.includes('melayu') || t.includes('bahasa')) return 'bahasa'
  if (t.includes('sejarah') || t.includes('history')) return 'history'
  if (t.includes('coding') || t.includes('komputer') || t.includes('logik')) return 'coding'
  if (t.includes('seni') || t.includes('art')) return 'art'
  if (t.includes('muzik') || t.includes('music')) return 'music'
  if (t.includes('geografi') || t.includes('geography')) return 'geography'
  return 'general'
}

// Senarai subjek sandaran sekiranya pangkalan data belum dimuatkan
const FALLBACK_SUBJECTS: SubjectTrackerItem[] = [
  {
    id: 'coding',
    title: 'Coding & Logik',
    icon: '💻',
    href: '/student/quizzes?subject=coding&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1774000000000,
  },
  {
    id: 'english',
    title: 'Bahasa Inggeris',
    icon: '🔤',
    href: '/student/quizzes?subject=english&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1773000000000,
  },
  {
    id: 'science',
    title: 'Sains',
    icon: '🧪',
    href: '/student/quizzes?subject=science&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1772000000000,
  },
  {
    id: 'bahasa',
    title: 'Bahasa Melayu',
    icon: '📖',
    href: '/student/quizzes?subject=bahasa&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1771000000000,
  },
  {
    id: 'math',
    title: 'Matematik',
    icon: '🧮',
    href: '/student/quizzes?subject=math&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1770000000000,
  },
  {
    id: 'history',
    title: 'Sejarah',
    icon: '🏛️',
    href: '/student/quizzes?subject=history&autoOpen=true',
    progressRatio: 0,
    status: 'not_started',
    createdAt: 1769000000000,
  },
]

export default function StudentHomeSubjectTracker({
  dbSubjects,
  completedQuizIds = [],
}: StudentHomeSubjectTrackerProps) {
  // Bina senarai asas subjek dengan nyahduplikasi mengikut slug (cth Sejarah & Sejarah SK disatukan)
  const baseSubjects: SubjectTrackerItem[] = useMemo(() => {
    if (dbSubjects && dbSubjects.length > 0) {
      const seenSlugs = new Set<string>()
      const uniqueList: SubjectTrackerItem[] = []

      // Utamakan subjek dengan nama lengkap (cth Sejarah SK) atau yang mempunyai kuiz
      const sortedDb = [...dbSubjects].sort((a, b) => {
        // Jika satu ada 'SK' atau perkataan lebih spesifik berbanding nama tunggal, utamakan yang spesifik
        const aLen = a.title.length
        const bLen = b.title.length
        return bLen - aLen
      })

      for (const s of sortedDb) {
        const slug = getSubjectSlug(s.title)
        if (seenSlugs.has(slug)) {
          continue
        }
        seenSlugs.add(slug)
        uniqueList.push({
          id: slug,
          title: s.title,
          icon: getSubjectEmoji(s.title),
          href: `/student/quizzes?subject=${slug}&autoOpen=true`,
          progressRatio: 0,
          status: 'not_started',
          createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
        })
      }
      return uniqueList
    }
    return FALLBACK_SUBJECTS
  }, [dbSubjects])

  const [subjects, setSubjects] = useState<SubjectTrackerItem[]>(baseSubjects)
  const [showCompleted, setShowCompleted] = useState(false)

  // Fungsi penyelarasan kemajuan dinamik real-time
  const syncProgress = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      // 1. Baca kemajuan subjek dari subjectProgress helper
      const subjectMap = getAllSubjectsProgress()

      // 2. Baca kemajuan modul tersimpan
      const rawModules = localStorage.getItem('exploria_modules_progress')
      const modMap: Record<
        string,
        {
          read?: boolean
          visual?: boolean
          video?: boolean
          quiz?: boolean
          subjectId?: string
          subject?: string
          title?: string
          passed?: boolean
          score?: number
          lastUpdated?: number
        }
      > = rawModules ? JSON.parse(rawModules) : {}

      const updated = baseSubjects.map((sub) => {
        let hasHalfwayModule = false
        let halfwayStepsCount = 0
        let halfwayMaxTime = 0
        let hasCompletedModule = false
        let completedMaxTime = 0

        Object.keys(modMap).forEach((modId) => {
          const m = modMap[modId]
          const matchedSub =
            KNOWN_QUIZ_SUBJECT_MAP[modId] ||
            m.subjectId ||
            detectSubjectFromText(m.subject || '', m.title || '', modId)

          const isMatch =
            matchedSub === sub.id ||
            (sub.id === 'history' && modId.includes('ca888888')) ||
            (sub.id === 'science' && (modId.includes('ca111111') || modId.includes('ca444444'))) ||
            (sub.id === 'math' && (modId.includes('ca222222') || modId.includes('ca555555'))) ||
            (sub.id === 'english' && (modId.includes('ca333333') || modId.includes('ca777777'))) ||
            (sub.id === 'bahasa' && modId.includes('ca666666'))

          if (!isMatch) return

          // Modul ini selesai jika: kuiz selesai, atau markah ada, atau semua 4 langkah selesai, atau passed, atau ada dalam rekod DB
          const isDone =
            Boolean(m.quiz) ||
            Boolean(m.passed) ||
            (m.score !== undefined && m.score !== null) ||
            Boolean(m.read && m.visual && m.video && m.quiz) ||
            Boolean(completedQuizIds && completedQuizIds.includes(modId))

          const isStarted = Boolean(m.read || m.visual || m.video || m.quiz)

          if (isDone) {
            hasCompletedModule = true
            if (m.lastUpdated) completedMaxTime = Math.max(completedMaxTime, m.lastUpdated)
          } else if (isStarted) {
            // Pelajar mulakan membaca/gambar/video tetapi BELUM selesai kuiz -> tergendala / sedang dijalani
            hasHalfwayModule = true
            const steps = [m.read, m.visual, m.video].filter(Boolean).length
            halfwayStepsCount = Math.max(halfwayStepsCount, steps)
            if (m.lastUpdated) halfwayMaxTime = Math.max(halfwayMaxTime, m.lastUpdated)
          }
        })

        // Juga semak rekod langsung dalam subjectMap
        const direct =
          subjectMap[sub.id] ||
          (sub.id === 'history' ? subjectMap['sejarah'] : undefined) ||
          (sub.id === 'science' ? subjectMap['sains'] : undefined) ||
          (sub.id === 'math' ? subjectMap['matematik'] : undefined) ||
          (sub.id === 'bahasa' ? subjectMap['melayu'] : undefined)

        // 1. Jika ada modul yang tergendala (separuh jalan) -> 'in_progress' (Paparkan Sambung)
        if (hasHalfwayModule) {
          const ratio = Math.min(Math.max(halfwayStepsCount / 4, 0.25), 0.75)
          return {
            ...sub,
            progressRatio: ratio,
            status: 'in_progress' as const,
            lastUpdated: halfwayMaxTime || sub.lastUpdated || Date.now(),
          }
        }

        // 2. Jika tiada modul tergendala DAN ada modul yang sudah selesai (atau rekod direct selesai) -> 'completed' (Selesai -> disembunyikan/hilang dari 5 kad utama)
        if (hasCompletedModule || direct?.status === 'completed' || (direct && direct.ratio >= 1.0)) {
          return {
            ...sub,
            progressRatio: 1.0,
            status: 'completed' as const,
            lastUpdated: completedMaxTime || direct?.lastUpdated || sub.lastUpdated || Date.now(),
          }
        }

        // 3. Jika rekod direct menunjukkan in_progress
        if (direct && direct.status === 'in_progress' && direct.ratio < 1.0) {
          return {
            ...sub,
            progressRatio: direct.ratio,
            status: 'in_progress' as const,
            lastUpdated: direct.lastUpdated || sub.lastUpdated,
          }
        }

        // 4. Belum dimulakan
        return {
          ...sub,
          progressRatio: 0,
          status: 'not_started' as const,
        }
      })

      setSubjects(updated)
    } catch (err) {
      console.warn('Ralat membaca status kemajuan subjek di Utama:', err)
    }
  }, [baseSubjects, completedQuizIds])

  // Muat dan dengar kemas kini kemajuan
  useEffect(() => {
    syncProgress()

    window.addEventListener('exploria_progress_changed', syncProgress)
    window.addEventListener('storage', syncProgress)
    window.addEventListener('focus', syncProgress)

    return () => {
      window.removeEventListener('exploria_progress_changed', syncProgress)
      window.removeEventListener('storage', syncProgress)
      window.removeEventListener('focus', syncProgress)
    }
  }, [syncProgress])

  // 1. Asingkan subjek yang selesai (di-hide secara lalai dari paparan utama)
  const completedSubjects = subjects.filter((s) => s.status === 'completed')
  const activeSubjects = subjects.filter((s) => s.status !== 'completed')

  // 2. SUSUNAN KEUTAMAAN:
  //    - Keutamaan 1: Subjek "Sedang Dijalani" (Sambung) diutamakan DAHULU sebelum yang lain!
  //    - Keutamaan 2: Bagi yang sama status, susun mengikut waktu terbaru subjek itu dibina (createdAt descending)
  const sortedSubjects = [...activeSubjects].sort((a, b) => {
    const aInProgress = a.status === 'in_progress'
    const bInProgress = b.status === 'in_progress'

    // Utamakan yang sedang dijalani di hadapan sekali
    if (aInProgress && !bInProgress) return -1
    if (!aInProgress && bInProgress) return 1

    // Jika kedua-duanya sedang dijalani, utamakan yang terkini disentuh
    if (aInProgress && bInProgress) {
      return (b.lastUpdated || 0) - (a.lastUpdated || 0)
    }

    // Jika kedua-duanya belum mula, susun mengikut waktu terbaru subjek itu dibina
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  // 3. HADKAN HANYA 5 SUBJEK SAHAJA DALAM SATU MASA
  //    Memenuhi susun atur grid 5 lajur yang kemas dalam 1 baris
  const visibleSubjects = sortedSubjects.slice(0, 5)

  return (
    <div className="space-y-3.5">
      {/* Grid Minimalis: Tepat 5 Subjek Sahaja Dalam Satu Masa (Sedang Dijalani Diutamakan) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {visibleSubjects.map((sub) => {
          const isInProgress = sub.status === 'in_progress'
          // Lebar baris garis kemajuan (tanpa nombor peratus)
          const lineFillPercent = Math.min(Math.max(Math.round(sub.progressRatio * 100), 20), 95)

          return (
            <div
              key={sub.title}
              className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 sm:p-4 min-h-[160px] transition transform hover:-translate-y-1 hover:scale-105 shadow-lg ${
                isInProgress
                  ? 'border-blue-300 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 ring-2 ring-blue-400/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl'
              }`}
            >
              <div>
                {/* 1. Gambar & Status Tag */}
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl sm:text-3xl leading-none drop-shadow-xs">
                      {sub.icon}
                    </span>

                    {/* Status Sedang Dijalani */}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-800 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>Sedang Dijalani</span>
                      </span>
                    )}
                  </div>

                  {/* 2. Title Subject dengan Font yang Lebih Kecil & Truncate demi Mengekalkan Size Card */}
                  <div className="h-5 flex items-center w-full">
                    <h3
                      className="text-xs sm:text-[13px] font-black text-slate-900 tracking-tight truncate leading-tight w-full"
                      title={sub.title}
                    >
                      {sub.title}
                    </h3>
                  </div>
                </div>

                {/* 3. Sedang Dijalani Progress (Garis Kemajuan Sahaja, Tanpa Angka Peratus) */}
                <div className="mt-3">
                  {isInProgress ? (
                    <div className="space-y-1">
                      <div
                        role="progressbar"
                        aria-label={`Kemajuan ${sub.title}`}
                        className="h-2 w-full rounded-full bg-blue-100 overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                          style={{ width: `${lineFillPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    // Ruang penampan untuk menyamakan ketinggian kad yang belum bermula
                    <div className="h-2 w-full rounded-full bg-slate-100" />
                  )}
                </div>
              </div>

              {/* 4. Butang Sambung Sahaja (Atau Mula bagi yang belum mula) */}
              <div className="mt-3.5 pt-1">
                {isInProgress ? (
                  <Link
                    href={sub.href}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 py-2 text-xs font-black text-white shadow-md hover:from-blue-600 hover:to-blue-800 transition transform hover:scale-105 group"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Sambung</span>
                  </Link>
                ) : (
                  <Link
                    href={sub.href}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition transform hover:scale-105 group"
                  >
                    <span>Mula</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Baris Ringkas Subjek yang Selesai (Disembunyikan / Hide Secara Lalai) */}
      {completedSubjects.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              {completedSubjects.length} subjek selesai (disorok)
            </span>
            {showCompleted ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {showCompleted && (
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {completedSubjects.map((sub) => (
                <div
                  key={sub.title}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl">{sub.icon}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{sub.title}</h4>
                      <span className="text-[10px] text-emerald-600 font-bold">Selesai ✓</span>
                    </div>
                  </div>
                  <Link
                    href={sub.href}
                    className="rounded-lg bg-emerald-50 hover:bg-emerald-100 p-1.5 text-emerald-700 transition"
                    title="Ulang Kaji Semula"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
