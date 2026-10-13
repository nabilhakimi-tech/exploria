'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Award,
  Timer,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sparkles,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Flame,
  Star,
  UsersRound,
  ExternalLink,
  ChevronRight,
  Gamepad2,
  Lock,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { OfficialCertificateModal, type CertificateData } from '@/components/ui/OfficialCertificateModal'
import { gameSound } from '@/lib/gameSound'
import LevelUpModal from '@/components/student/LevelUpModal'

export interface OfficialCompetition {
  id: string
  title: string
  subject: string
  emoji: string
  description: string
  status: 'active' | 'upcoming' | 'closed'
  statusLabel: string
  dates: string
  durationMinutes: number
  totalQuestions: number
  participantsCount: number
  hasAttempted?: boolean
  attemptScore?: number | null
  attemptPassed?: boolean | null
  attemptCompletedAt?: string | null
  certData?: {
    certId: string
    awardLevel: 'EMAS' | 'PERAK' | 'GANGSA'
    score: number
    competitionTitle: string
  } | null
  questions: ExamQuestion[]
}

export interface ExamQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export default function StudentCompetitionPage() {
  const [selectedComp, setSelectedComp] = useState<OfficialCompetition | null>(null)
  const [examState, setExamState] = useState<'lobby' | 'rules' | 'active' | 'completed'>('lobby')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [integrityPledge, setIntegrityPledge] = useState(false)
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null)

  // Pre-submission confirmation dialog state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [unansweredQuestions, setUnansweredQuestions] = useState<Array<{ number: number; index: number; id: number }>>([])

  // Exam Result State
  const [examScorePercentage, setExamScorePercentage] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [awardRank, setAwardRank] = useState<'EMAS' | 'PERAK' | 'GANGSA' | null>(null)
  const [isPassed, setIsPassed] = useState(false)
  const [generatedCertificate, setGeneratedCertificate] = useState<CertificateData | null>(null)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [competitions, setCompetitions] = useState<OfficialCompetition[]>([])
  const [studentProfile, setStudentProfile] = useState<{ id: string; fullName: string; grade: string; schoolName: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [levelUpModalData, setLevelUpModalData] = useState<{
    newLevel: number
    previousLevel?: number
    coinReward?: number
  } | null>(null)

  const fetchCompetitions = async (profileId?: string) => {
    try {
      const url = profileId ? `/api/student/competitions?childId=${profileId}` : '/api/student/competitions'
      const compRes = await fetch(url)
      const compJson = await compRes.json()

      if (compJson.success && Array.isArray(compJson.data)) {
        const mapped = compJson.data.map((c: any) => {
          const status = c.isActive ? 'active' : 'upcoming'
          return {
            id: c.id,
            title: c.title,
            subject: c.subjectTitle || 'Umum',
            emoji: c.emoji || '🏆',
            description: c.description || '',
            status,
            statusLabel: status === 'active' ? 'SEDANG BERLANGSUNG' : 'AKAN DATANG',
            dates: `${new Date(c.startTime).toLocaleDateString('ms-MY')} - ${new Date(c.endTime).toLocaleDateString('ms-MY')}`,
            durationMinutes: c.durationMinutes || 10,
            totalQuestions: c.questions.length,
            participantsCount: c.questions.length * 20 + 35,
            hasAttempted: Boolean(c.hasAttempted),
            attemptScore: c.attemptScore,
            attemptPassed: c.attemptPassed,
            attemptCompletedAt: c.attemptCompletedAt,
            certData: c.certData,
            questions: c.questions.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
            })),
          }
        })
        setCompetitions(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch competitions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function initData() {
      try {
        const profRes = await fetch('/api/student/profile')
        const profJson = await profRes.json()
        let pId: string | undefined

        if (profJson.success && profJson.data) {
          setStudentProfile(profJson.data)
          pId = profJson.data.id
        }
        await fetchCompetitions(pId)
      } catch (err) {
        console.error('Failed to init competition data', err)
        setLoading(false)
      }
    }
    initData()
  }, [])

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer effect
  useEffect(() => {
    if (examState !== 'active') return

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examState])

  const handleSelectCompetition = (comp: OfficialCompetition) => {
    if (comp.status !== 'active') return
    if (comp.hasAttempted) {
      setBlockedNotice(
        `Anda telah menamatkan peperiksaan "${comp.title}". Pertandingan rasmi hanya boleh diduduki sekali sahaja bagi setiap sesi aktif. Pentadbir boleh membuka semula sesi sekiranya anda dibenarkan menjawab semula.`
      )
      return
    }
    setBlockedNotice(null)
    setSelectedComp(comp)
    setExamState('rules')
    setIntegrityPledge(false)
  }

  const handleStartExam = () => {
    if (!selectedComp || !integrityPledge) return
    setUserAnswers({})
    setCurrentQuestionIndex(0)
    setSecondsRemaining(selectedComp.durationMinutes * 60)
    setExamState('active')
    gameSound.playLaser()
  }

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    gameSound.playTileClick()
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  // Pre-submission confirmation check
  const handleRequestSubmitExam = () => {
    if (!selectedComp) return
    const unanswered = selectedComp.questions
      .map((q, idx) => ({
        number: idx + 1,
        index: idx,
        id: q.id,
        answered: userAnswers[q.id] !== undefined,
      }))
      .filter((item) => !item.answered)
      .map((item) => ({ number: item.number, index: item.index, id: item.id }))

    setUnansweredQuestions(unanswered)
    setIsConfirmModalOpen(true)
  }

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsConfirmModalOpen(false)
    if (!selectedComp) return

    // Calculate score
    let correct = 0
    selectedComp.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++
      }
    })

    const total = selectedComp.questions.length
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = scorePct >= 50

    // Determine Award: Only students who pass (>= 50%) obtain a ranked medal award
    let rank: 'EMAS' | 'PERAK' | 'GANGSA' | null = null
    if (scorePct >= 85) rank = 'EMAS'
    else if (scorePct >= 70) rank = 'PERAK'
    else if (scorePct >= 50) rank = 'GANGSA'

    setCorrectAnswersCount(correct)
    setExamScorePercentage(scorePct)
    setAwardRank(rank)
    setIsPassed(passed)

    // Generate Official Certificate Record ONLY if passed and ranked
    let cert: CertificateData | null = null
    let certCode = ''
    if (passed && rank) {
      certCode = `EXP-${rank}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      cert = {
        certId: certCode,
        studentName: studentProfile?.fullName || 'Pelajar Exploria',
        competitionTitle: selectedComp.title,
        awardLevel: rank,
        score: scorePct,
        totalQuestions: total,
        date: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
        school: studentProfile?.schoolName || 'Sekolah Kebangsaan',
      }
      setGeneratedCertificate(cert)
    } else {
      setGeneratedCertificate(null)
    }

    setExamState('completed')

    // Mark current competition as attempted in state immediately
    setCompetitions((prev) =>
      prev.map((c) =>
        c.id === selectedComp.id
          ? {
              ...c,
              hasAttempted: true,
              attemptScore: scorePct,
              attemptPassed: passed,
              certData:
                passed && rank
                  ? {
                      certId: certCode,
                      awardLevel: rank,
                      score: scorePct,
                      competitionTitle: selectedComp.title,
                    }
                  : null,
            }
          : c
      )
    )

    // Submit to DB API
    fetch('/api/student/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: studentProfile?.id,
        quizId: selectedComp.id,
        score: correct,
        passed,
        xpEarned: scorePct * 10,
        certData:
          passed && rank
            ? {
                certId: certCode,
                competitionTitle: selectedComp.title,
                awardLevel: rank,
                score: scorePct,
              }
            : undefined,
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
      .catch((err) => console.error('Failed to submit exam', err))

    if (passed) {
      gameSound.playVictory()
    } else {
      gameSound.playWrong()
    }
  }

  const formatMinutes = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-20">
      {/* Official Certificate Modal */}
      {isCertModalOpen && generatedCertificate && (
        <OfficialCertificateModal
          certificate={generatedCertificate}
          onClose={() => setIsCertModalOpen(false)}
        />
      )}

      {/* Pre-Submission Confirmation Dialog */}
      {isConfirmModalOpen && selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            {unansweredQuestions.length === 0 ? (
              /* All Questions Answered */
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner mb-4">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-800 uppercase mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Semua Soalan Telah Dijawab ({selectedComp.questions.length}/{selectedComp.questions.length})
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  Sahkan Penghantaran Peperiksaan?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Adakah anda pasti mahu menghantar peperiksaan ini sekarang? Setelah dihantar, jawapan anda akan dimuktamadkan secara rasmi dan anda tidak boleh menduduki peperiksaan ini lagi bagi sesi ini.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Semak Semula Jawapan
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Ya, Hantar Peperiksaan Rasmi
                  </button>
                </div>
              </div>
            ) : (
              /* There are Unanswered Questions */
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      Peringatan Peperiksaan
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      Terdapat {unansweredQuestions.length} Soalan Belum Dijawab!
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Anda belum memilih jawapan bagi soalan-soalan berikut. Sila klik pada nombor soalan untuk pergi terus menjawabnya:
                </p>

                {/* List of Unanswered Questions as clickable pills */}
                <div className="my-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5">
                  <div className="text-[11px] font-bold text-amber-900 uppercase mb-2">
                    Senarai Soalan Yang Belum Dijawab:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unansweredQuestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentQuestionIndex(item.index)
                          setIsConfirmModalOpen(false)
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100 hover:border-amber-400 active:scale-95 transition shadow-sm"
                        title={`Klik untuk jawab Soalan ${item.number}`}
                      >
                        <span>Soalan {item.number}</span>
                        <ArrowRight className="h-3 w-3 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Anda disyorkan menjawab semua soalan untuk memperoleh markah maksimum. Namun begitu, jika anda{' '}
                  <strong className="text-slate-700">tidak mahu menjawab soalan ini dan tetap mahu menghantar sekarang</strong>, anda dibenarkan menghantar.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(unansweredQuestions[0].index)
                      setIsConfirmModalOpen(false)
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                  >
                    Kembali Menjawab (Soalan {unansweredQuestions[0].number})
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="w-full sm:w-auto rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 active:scale-95 transition"
                  >
                    Tetap Mahu Hantar ({unansweredQuestions.length} Kosong)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner Tajuk Pertandingan - Saiz Selesa & Seimbang (75% Skala Asal) */}
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

          {/* Baris 2: Tajuk Utama Pertandingan */}
          <div className="flex items-center gap-3">
            <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pertandingan
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* Blocked Attempt Notification Alert */}
        {blockedNotice && (
          <div className="mb-6 rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-950">Peperiksaan Telah Selesai Diduduki</h4>
                <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">{blockedNotice}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBlockedNotice(null)}
              className="text-blue-800 hover:text-blue-950 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 1. LOBBY STATE: GAMIFIED 3D PODIUM & SENARAI PERTANDINGAN RASMI */}
        {examState === 'lobby' && (
          <div className="space-y-6">
            
            {/* 3D Gamified Podium & Leaderboard Section (Like Reference Image Screen 3) */}
            <section
              aria-label="Papan Pendahulu & Podium"
              className="relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-b from-blue-100/60 via-white to-blue-50/40 p-6 sm:p-8 shadow-sm"
            >
              {/* Confetti & Star Accents */}
              <div className="pointer-events-none absolute top-4 left-6 text-xl opacity-60">✨</div>
              <div className="pointer-events-none absolute top-8 right-12 text-2xl opacity-60">🎉</div>
              <div className="pointer-events-none absolute bottom-6 left-10 text-xl opacity-50">🌟</div>

              {/* Header Pill */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-white px-5 py-1.5 text-xs sm:text-sm font-black text-blue-900 shadow-sm">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span>Leaderboard Rasmi Exploria</span>
                </div>
                <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  Podium Juara Terhebat
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-md">
                  Pelajar dengan skor tertinggi dalam siri peperiksaan &amp; cabaran berjadual terkini
                </p>
              </div>

              {/* 3D Podium Display */}
              <div className="mt-8 flex items-end justify-center gap-2 sm:gap-6 max-w-lg mx-auto">
                {/* 2nd Place Podium */}
                <div className="flex flex-col items-center w-24 sm:w-28">
                  <div className="relative flex flex-col items-center mb-2">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-2xl sm:text-3xl shadow-md">
                      👧
                    </div>
                    <span className="mt-1 text-xs font-black text-slate-900 truncate max-w-full">
                      Grace
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 rounded-full px-2 py-0.2 border border-blue-200">
                      99 PTS
                    </span>
                  </div>
                  {/* Podium Column */}
                  <div className="w-full h-28 sm:h-32 rounded-t-2xl border-2 border-blue-300 bg-gradient-to-b from-blue-300 to-blue-400 flex flex-col items-center justify-start pt-3 shadow-md">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-900 font-black text-sm shadow-sm border border-blue-200">
                      2
                    </span>
                  </div>
                </div>

                {/* 1st Place Podium (Tallest & Center with Crown) */}
                <div className="flex flex-col items-center w-28 sm:w-36 -mt-4">
                  <div className="relative flex flex-col items-center mb-2">
                    <span className="text-2xl animate-bounce">👑</span>
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white bg-blue-600 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-xl ring-4 ring-blue-200">
                      👦
                    </div>
                    <span className="mt-1 text-xs sm:text-sm font-black text-slate-900 truncate max-w-full">
                      Kiki (Juara)
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black text-white bg-blue-600 rounded-full px-2.5 py-0.5 shadow-xs">
                      100 PTS
                    </span>
                  </div>
                  {/* Podium Column */}
                  <div className="w-full h-36 sm:h-44 rounded-t-2xl border-2 border-blue-400 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-start pt-3 shadow-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-900 font-black text-base shadow-sm border-2 border-blue-300">
                      1
                    </span>
                  </div>
                </div>

                {/* 3rd Place Podium */}
                <div className="flex flex-col items-center w-24 sm:w-28">
                  <div className="relative flex flex-col items-center mb-2">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-2xl sm:text-3xl shadow-md">
                      🧑
                    </div>
                    <span className="mt-1 text-xs font-black text-slate-900 truncate max-w-full">
                      Nico
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 rounded-full px-2 py-0.2 border border-blue-200">
                      98 PTS
                    </span>
                  </div>
                  {/* Podium Column */}
                  <div className="w-full h-20 sm:h-24 rounded-t-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col items-center justify-start pt-3 shadow-md">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-900 font-black text-sm shadow-sm border border-blue-200">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Ranks 4, 5, 6 Capsule List (Like Reference Screen 3) */}
              <div className="mt-6 max-w-md mx-auto space-y-2">
                {[
                  { rank: 4, name: 'Jhon', score: 97, emoji: '🧑‍🚀' },
                  { rank: 5, name: 'Quincy', score: 96, emoji: '🦊' },
                  { rank: 6, name: studentProfile?.fullName || 'Anda (Peserta)', score: 95, emoji: '⭐' },
                ].map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between rounded-2xl border-2 border-blue-100 bg-white px-4 py-2.5 shadow-xs hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                        {item.rank}
                      </span>
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-blue-900 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                      {item.score} PTS
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Senarai Pertandingan Rasmi Dibawah Podium */}
            <div className="flex items-center justify-between px-1 pt-2">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Acara Pertandingan Semasa
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Disahkan Pentadbir
              </span>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
                  Memuatkan Pertandingan...
                </div>
              ) : (
                competitions.map((comp) => {
                  const isActive = comp.status === 'active'
                  return (
                    <article
                      key={comp.id}
                      className={`overflow-hidden rounded-3xl border-2 bg-white p-5 sm:p-6 shadow-sm transition-all ${
                        isActive
                          ? comp.hasAttempted
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-blue-100 hover:border-blue-400 hover:shadow-md'
                          : 'border-slate-200 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-inner border border-blue-100">
                            {comp.emoji}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {comp.statusLabel}
                              </span>
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                                {comp.subject}
                              </span>
                              {comp.hasAttempted && (
                                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> TELAH MENJAWAB ({comp.attemptScore}%)
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                              {comp.title}
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                              {comp.description}
                            </p>

                            {/* Metadata */}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5 text-blue-600" /> {comp.dates}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Timer className="h-3.5 w-3.5 text-blue-600" /> {comp.durationMinutes} Minit Peperiksaan
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <UsersRound className="h-3.5 w-3.5 text-blue-600" /> {comp.participantsCount} Peserta Berdaftar
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:shrink-0 flex sm:flex-col justify-end items-end gap-2">
                          {isActive ? (
                            comp.hasAttempted ? (
                              <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto">
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                                >
                                  <Lock className="h-3.5 w-3.5" /> Peperiksaan Telah Dihantar
                                </button>
                                {comp.certData && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGeneratedCertificate({
                                        certId: comp.certData!.certId,
                                        studentName: studentProfile?.fullName || 'Pelajar Exploria',
                                        competitionTitle: comp.title,
                                        awardLevel: comp.certData!.awardLevel as any,
                                        score: comp.certData!.score,
                                        totalQuestions: comp.totalQuestions,
                                        date: comp.attemptCompletedAt
                                          ? new Date(comp.attemptCompletedAt).toLocaleDateString('ms-MY', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                            })
                                          : new Date().toLocaleDateString('ms-MY'),
                                        school: studentProfile?.schoolName || 'Sekolah Kebangsaan',
                                      })
                                      setIsCertModalOpen(true)
                                    }}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black text-amber-900 hover:bg-amber-100 transition shadow-sm"
                                  >
                                    <Trophy className="h-3.5 w-3.5 text-amber-600" /> Lihat Sijil Peringkat ({comp.certData.awardLevel})
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectCompetition(comp)}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3 font-bold text-white shadow-md hover:from-blue-700 hover:to-sky-700 active:scale-95 transition"
                              >
                                Masuk Peperiksaan <ArrowRight className="h-4 w-4" />
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="rounded-2xl border border-slate-300 bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                            >
                              Akan Dibuka Pentadbir
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* 2. RULES & INTEGRITY PLEDGE */}
        {examState === 'rules' && selectedComp && (
          <div className="mx-auto max-w-2xl rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="text-3xl">{selectedComp.emoji}</span>
              <div>
                <span className="text-xs font-bold uppercase text-blue-600">Peperiksaan Rasmi</span>
                <h2 className="text-2xl font-bold text-slate-900">{selectedComp.title}</h2>
              </div>
            </div>

            <div className="my-5 space-y-3 text-sm text-slate-700">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Peraturan Peperiksaan:
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  Masa yang diperuntukkan adalah <strong>{selectedComp.durationMinutes} minit</strong> untuk{' '}
                  <strong>{selectedComp.questions.length} soalan</strong>.
                </li>
                <li>Setelah peperiksaan bermula, pemasa tidak boleh dijeda (paused).</li>
                <li>
                  <strong>Peringatan Satu Percubaan:</strong> Ini adalah peperiksaan pertandingan rasmi. Anda hanya dibenarkan menduduki peperiksaan ini sekali sahaja.
                </li>
                <li>
                  <strong>Kelayakan Sijil:</strong> Sijil rasmi hanya dianugerahkan kepada peserta yang <strong>lulus dan memperoleh peringkat</strong> (Gangsa ≥50%, Perak ≥70%, atau Emas ≥85%).
                </li>
              </ul>

              {/* Integrity Box */}
              <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integrityPledge}
                    onChange={(e) => setIntegrityPledge(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-amber-950 leading-relaxed">
                    Saya berikrar bahawa saya akan menjawab semua soalan peperiksaan ini dengan jujur atas usaha saya sendiri tanpa bantuan pihak lain.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExamState('lobby')}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal / Kembali
              </button>

              <button
                type="button"
                onClick={handleStartExam}
                disabled={!integrityPledge}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3 font-bold text-white shadow-md hover:from-blue-700 hover:to-sky-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Mula Menjawab Peperiksaan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. ACTIVE EXAM TAKING INTERFACE */}
        {examState === 'active' && selectedComp && (
          <div className="rounded-3xl border-2 border-blue-200 bg-white p-5 sm:p-8 shadow-xl">
            {/* Exam Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600">{selectedComp.title}</span>
                <div className="text-sm font-bold text-slate-800">
                  Soalan {currentQuestionIndex + 1} daripada {selectedComp.questions.length}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Countdown Timer */}
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-base font-black shadow-inner border ${
                    secondsRemaining <= 120
                      ? 'animate-pulse border-red-400 bg-red-100 text-red-700'
                      : 'border-blue-200 bg-blue-50 text-blue-900'
                  }`}
                >
                  <Timer className="h-4 w-4 text-blue-600" /> {formatMinutes(secondsRemaining)}
                </div>

                {/* Quick Submit Button in Header */}
                <button
                  type="button"
                  onClick={handleRequestSubmitExam}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-600" /> Hantar Peperiksaan
                </button>
              </div>
            </div>

            {/* Question Navigation Bubbles */}
            <div className="my-4 flex flex-wrap items-center gap-2">
              {selectedComp.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined
                const isCurrent = currentQuestionIndex === idx

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-8 w-8 rounded-xl font-mono text-xs font-bold transition ${
                      isCurrent
                        ? 'border-2 border-blue-600 bg-blue-600 text-white shadow'
                        : isAnswered
                        ? 'border border-blue-400 bg-blue-50 text-blue-800 font-black'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {/* Active Question Box */}
            {selectedComp.questions[currentQuestionIndex] && (
              <div className="my-6 space-y-4">
                <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase">
                    Soalan {currentQuestionIndex + 1}
                  </span>
                  <h3 className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
                    {selectedComp.questions[currentQuestionIndex].question}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {selectedComp.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                    const qId = selectedComp.questions[currentQuestionIndex].id
                    const isSelected = userAnswers[qId] === optIdx

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qId, optIdx)}
                        className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left font-medium transition active:scale-98 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-sm ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-sm sm:text-base">{opt}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer navigation */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Soalan Sebelumnya
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < selectedComp.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Soalan Seterusnya →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestSubmitExam}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3 font-bold text-white shadow-md hover:from-blue-700 hover:to-sky-700 active:scale-95 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Hantar Peperiksaan Rasmi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. COMPLETED / RESULTS PODIUM STATE */}
        {examState === 'completed' && selectedComp && (
          <div>
            {isPassed && awardRank && generatedCertificate ? (
              /* PASSED & RANKED PODIUM: OFFICIAL CERTIFICATE AVAILABLE */
              <div className="mx-auto max-w-xl rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-9 text-center shadow-xl animate-in zoom-in-95 duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-4xl shadow-xl animate-bounce text-white">
                  {awardRank === 'EMAS' ? '🥇' : awardRank === 'PERAK' ? '🥈' : '🥉'}
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1 text-xs font-black uppercase text-blue-900 border border-blue-200">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  {awardRank === 'EMAS'
                    ? 'ANUGERAH PINGAT EMAS'
                    : awardRank === 'PERAK'
                    ? 'ANUGERAH PINGAT PERAK'
                    : 'ANUGERAH PINGAT GANGSA'}
                </div>

                <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                  Tahniah, {generatedCertificate.studentName}!
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                  Anda telah berjaya menamatkan <span className="font-bold text-blue-900">&quot;{selectedComp.title}&quot;</span> dengan cemerlang.
                </p>

                {/* Score breakdown */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-3.5">
                    <div className="text-2xl sm:text-3xl font-black text-blue-900 leading-none">
                      {examScorePercentage}%
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Markah Rasmi</div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white p-3.5">
                    <div className="text-2xl sm:text-3xl font-black text-blue-900 leading-none">
                      {correctAnswersCount}/{selectedComp.questions.length}
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Jawapan Betul</div>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5">
                    <div className="text-xl sm:text-2xl font-black text-blue-900 leading-none">
                      {awardRank}
                    </div>
                    <div className="text-[10px] font-bold text-blue-700 uppercase mt-1">Status Pingat</div>
                  </div>
                </div>

                {/* Certificate CTA */}
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📜</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Sijil Digital Rasmi Layak Diterima</h4>
                      <p className="text-xs text-slate-600">
                        ID Sijil: <span className="font-mono font-bold text-blue-900">{generatedCertificate.certId}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCertModalOpen(true)}
                    className="duo-btn-blue px-6 py-3 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" /> Lihat & Cetak Sijil PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExamState('lobby')
                      setSelectedComp(null)
                    }}
                    className="duo-btn-white px-5 py-3 text-xs sm:text-sm"
                  >
                    Kembali ke Senarai Pertandingan
                  </button>
                </div>

                <p className="mt-4 text-[11px] font-medium text-slate-500">
                  💡 Peringatan: Ibu bapa anda boleh memuat turun sijil ini atau membuat tempahan Sijil Fizikal Berbingkai & Medal Logam melalui <strong>Parent Dashboard</strong>.
                </p>
              </div>
            ) : (
              /* FAILED / NOT RANKED: NO CERTIFICATE AWARDED */
              <div className="mx-auto max-w-xl rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-9 text-center shadow-xl animate-in zoom-in-95 duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-3xl shadow-inner">
                  📋
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1 text-xs font-black uppercase text-rose-800 border border-rose-200">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  KEPUTUSAN: TIDAK LULUS (Tiada Peringkat)
                </div>

                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                  Peperiksaan Selesai Ditamatkan
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                  Anda telah menamatkan peperiksaan <span className="font-bold text-slate-800">&quot;{selectedComp.title}&quot;</span>.
                </p>

                {/* Score breakdown */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3.5">
                    <div className="text-2xl sm:text-3xl font-black text-rose-900 leading-none">
                      {examScorePercentage}%
                    </div>
                    <div className="text-[10px] font-bold text-rose-600 uppercase mt-1">Markah Anda</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                      {correctAnswersCount}/{selectedComp.questions.length}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Jawapan Betul</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <div className="text-base sm:text-lg font-black text-slate-700 leading-none mt-1">
                      Tiada Pingat
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Status</div>
                  </div>
                </div>

                {/* No Certificate Explanation Callout */}
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                        Sijil Rasmi Tidak Layak Diperoleh
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Sijil rasmi hanya dianugerahkan kepada peserta yang <strong>lulus dan memperoleh peringkat</strong> (Pingat Gangsa ≥50%, Perak ≥70%, atau Emas ≥85%).
                      </p>
                      <p className="text-xs text-amber-800 font-medium pt-1">
                        💡 Jangan berputus asa! Anda boleh mengulang kaji bahan rujukan di portal ini dan menduduki semula apabila pihak pentadbir membuka sesi peperiksaan seterusnya.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setExamState('lobby')
                      setSelectedComp(null)
                    }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-blue-600 px-6 font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                  >
                    Kembali ke Senarai Pertandingan
                  </button>

                  <Link
                    href="/student"
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Ulang Kaji Bahan Pembelajaran
                  </Link>
                </div>
              </div>
            )}
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