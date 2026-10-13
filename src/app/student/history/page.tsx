'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  RotateCcw,
  Search,
  Star,
  Trophy,
  XCircle,
  Loader2,
} from 'lucide-react'

type HistoryItem = {
  id: string
  date: string
  completedAt: string
  subject: string
  category: string
  score: number
  xp: number
  passed: boolean
  emoji: string
  accent?: string
}

type HistoryFilter = 'all' | 'passed' | 'highest' | 'latest'

const filters: { id: HistoryFilter; label: string; icon?: typeof Trophy }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'passed', label: 'Lulus Sahaja', icon: Trophy },
  { id: 'highest', label: 'Skor Tertinggi', icon: Star },
  { id: 'latest', label: 'Terkini', icon: CalendarDays },
]

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all')

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/student/history')
        const json = await res.json()
        if (json.success) {
          setHistoryData(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const visibleHistory = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('ms')
    const filtered = historyData.filter((item) => {
      const matchesSearch = !term || `${item.subject} ${item.category}`.toLocaleLowerCase('ms').includes(term)
      return matchesSearch && (activeFilter !== 'passed' || item.passed)
    })

    if (activeFilter === 'highest') return filtered.sort((a, b) => b.score - a.score)
    if (activeFilter === 'latest') return filtered.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    return filtered
  }, [activeFilter, historyData, search])

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-16">
      
      {/* Banner Tajuk Rekod Pembelajaran - Saiz Selesa & Seimbang (75% Skala Asal) */}
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

          {/* Baris 2: Tajuk Utama Rekod Pembelajaran */}
          <div className="flex items-center gap-3">
            <History className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Rekod Pembelajaran
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        
        {/* Search & Filter Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
          <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-blue-50/50 border border-blue-100 px-3 text-slate-400">
            <Search className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kuiz mengikut subjek atau tajuk..."
              className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tapis sejarah kuiz">
            {filters.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeFilter === id}
                onClick={() => setActiveFilter(id)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                  activeFilter === id
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white border border-blue-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Modern History Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-4 py-3 text-center w-12">#</th>
                  <th scope="col" className="px-4 py-3">Tajuk Kuiz</th>
                  <th scope="col" className="px-4 py-3">Kategori</th>
                  <th scope="col" className="px-4 py-3">Skor & Ganjaran</th>
                  <th scope="col" className="px-4 py-3">Tarikh Selesai</th>
                  <th scope="col" className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleHistory.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-lg">
                          {item.emoji}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {item.subject}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 ${
                              item.passed ? 'text-blue-700' : 'text-slate-600'
                            }`}
                          >
                            {item.passed ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-blue-600" /> Lulus
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-slate-500" /> Perlu Ulang
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-1 text-xs font-semibold text-blue-900">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm ${
                            item.score >= 80 ? 'text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          {item.score}%
                        </span>
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                          +{item.xp} XP
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 font-medium text-xs">
                      {item.date}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/student/quizzes"
                        className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-50 transition"
                      >
                        <RotateCcw className="h-3 w-3 text-blue-600" /> Ulang Kuiz
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleHistory.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              Tiada rekod kuiz dijumpai dengan carian tersebut.
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
