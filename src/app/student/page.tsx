import Link from 'next/link'
import {
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Rocket,
  Gamepad2,
  Trophy,
  ShoppingBag,
} from 'lucide-react'
import StudentHomeSubjectTracker from '@/components/student/StudentHomeSubjectTracker'
import { getStudentProfile, resolveStudentTargetId } from '@/db/queries'
import { createSupabaseServer } from '@/lib/supabase/server'
import { db } from '@/db'
import { subjects, quizAttempts } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function StudentHomePage() {
  let userEmail: string | undefined
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) userEmail = user.email
  } catch {}

  let dbSubjectsList: { id: string; title: string; category?: string; createdAt?: Date | string | number }[] = []
  try {
    const fetched = await db
      .select({
        id: subjects.id,
        title: subjects.title,
        category: subjects.category,
        createdAt: subjects.createdAt,
      })
      .from(subjects)
      .orderBy(desc(subjects.createdAt))
    dbSubjectsList = fetched
  } catch (err) {
    console.warn('Gagal membaca senarai subjek dari db:', err)
  }

  let dbCompletedQuizIds: string[] = []
  try {
    const childId = await resolveStudentTargetId(undefined, userEmail)
    if (childId) {
      const atts = await db
        .select({ quizId: quizAttempts.quizId })
        .from(quizAttempts)
        .where(eq(quizAttempts.childId, childId))
      dbCompletedQuizIds = atts.map((a) => a.quizId)
    }
  } catch {}

  const profile = await getStudentProfile(undefined, userEmail)

  const studentName = profile?.fullName || 'Pelajar Exploria'
  const studentLevel = profile?.level || 1
  const studentXp = profile?.xp || 0
  const totalAwards = profile?.totalAwards || 0
  const totalQuizzes = profile?.totalQuizzes || 0
  const averageScore = profile?.averageScore || 0
  // Level progress calculation (250 XP per level)
  const currentLevelXp = studentXp % 250
  const progressPercent = Math.min(Math.round((currentLevelXp / 250) * 100), 100)

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8 sm:px-6 space-y-5">
        {/* 1. Gamification Board Ringkas & Bersih (Inspirasi Gambar 1: Clean, Light Sky Blue & Compact) */}
        <section
          aria-label="Profil Ringkas Pelajar"
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-sky-200 bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Kiri: Avatar Bulat & Nama Pelajar (Persis Top Bar Gambar 1) */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-sky-300 text-2xl shadow-xs">
                {profile?.avatarUrl || '🧑‍🚀'}
                <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-blue-500 text-white shadow-xs text-[9px] font-black">
                  ★
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                    {studentName}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-200/80 rounded-full px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                    {profile?.grade || 'Darjah 4'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium truncate">
                  {profile?.schoolName || `${profile?.schoolType || 'SK'} ${profile?.grade || 'Darjah 4'}`}
                </p>
              </div>
            </div>

            {/* Kanan: Gamifikasi (Tahap Pill Kuning seperti Gambar 1, XP Progress & Statistik Ringkas) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Kemajuan XP */}
              <div className="flex items-center gap-2 rounded-full bg-white/90 border border-sky-200 px-2.5 py-1 shadow-2xs">
                <span className="text-[10px] font-extrabold text-sky-900 whitespace-nowrap">
                  {currentLevelXp}/250 XP
                </span>
                <div className="h-1.5 w-14 sm:w-20 rounded-full bg-sky-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Purata Markah Chip */}
              <div
                title="Purata Markah Kuiz"
                className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-sky-200 px-2.5 py-1 text-[11px] font-black text-slate-800 shadow-2xs"
              >
                <TrendingUp className="h-3 w-3 text-blue-600 stroke-[2.5]" />
                <span>{averageScore}%</span>
                <span className="text-[9px] font-semibold text-slate-500 hidden md:inline">Purata</span>
              </div>

              {/* Sijil Chip */}
              <div
                title="Jumlah Sijil Diperolehi"
                className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-sky-200 px-2.5 py-1 text-[11px] font-black text-slate-800 shadow-2xs"
              >
                <Award className="h-3 w-3 text-amber-500 stroke-[2.5]" />
                <span>{totalAwards}</span>
                <span className="text-[9px] font-semibold text-slate-500 hidden md:inline">Sijil</span>
              </div>

              {/* Pill Tahap Biru */}
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 sm:px-3.5 sm:py-1 text-xs sm:text-sm font-black text-white shadow-xs border border-blue-500 shrink-0">
                <span>Tahap {studentLevel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Empat Kad Utama Squircle Gamifikasi (Mirip Rujukan Aplikasi Kanak-Kanak / Duolingo) */}
        <section aria-label="Aktiviti Utama Pelajar" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl tracking-tight flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600 fill-blue-600/20" />
              <span>Jom Mula Pengembaraan!</span>
            </h2>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
              Pilih Aktiviti Anda
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Pembelajaran */}
            <Link
              href="/student/quizzes"
              className="duo-card p-4 sm:p-5 flex flex-col items-center text-center justify-between group transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 fill-blue-600/20 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Pembelajaran
                </h3>
              </div>
              <div className="mt-3.5 w-full">
                <span className="duo-btn-blue text-[11px] py-1.5 px-3 block w-full text-center">
                  Buka Subjek
                </span>
              </div>
            </Link>

            {/* Card 2: Game Arena */}
            <Link
              href="/student/games"
              className="duo-card p-4 sm:p-5 flex flex-col items-center text-center justify-between group transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 fill-blue-600/20 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Game Arena
                </h3>
              </div>
              <div className="mt-3.5 w-full">
                <span className="duo-btn-blue text-[11px] py-1.5 px-3 block w-full text-center">
                  Main Game
                </span>
              </div>
            </Link>

            {/* Card 3: Peperiksaan & Pertandingan */}
            <Link
              href="/student/competition"
              className="duo-card p-4 sm:p-5 flex flex-col items-center text-center justify-between group transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Trophy className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 fill-blue-600/20 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Pertandingan
                </h3>
              </div>
              <div className="mt-3.5 w-full">
                <span className="duo-btn-blue text-[11px] py-1.5 px-3 block w-full text-center">
                  Cabaran Sijil
                </span>
              </div>
            </Link>

            {/* Card 4: Kedai Ganjaran */}
            <Link
              href="/student/redeem"
              className="duo-card p-4 sm:p-5 flex flex-col items-center text-center justify-between group transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 fill-blue-600/20 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Kedai Tebus
                </h3>
              </div>
              <div className="mt-3.5 w-full">
                <span className="duo-btn-blue text-[11px] py-1.5 px-3 block w-full text-center">
                  Tebus Hadiah
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 3. Pusat Pembelajaran (Pusat Pembelajaran Utama Sistem) */}
        <section aria-label="Pusat Pembelajaran" className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
            <div>
              <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600 fill-blue-600/20" />
                <span>Pusat Pembelajaran</span>
              </h2>
              
            </div>
            <Link
              href="/student/quizzes"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition group self-start sm:self-auto"
            >
              <span>Lihat Semua Subjek</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          {/* Komponen Pintar Penjejak Subjek: Subjek Tergendala dengan Baris Garisan & Butang Sambung; Subjek Selesai di-Hide */}
          <StudentHomeSubjectTracker dbSubjects={dbSubjectsList} completedQuizIds={dbCompletedQuizIds} />
        </section>

      </main>
    </div>
  )
}
