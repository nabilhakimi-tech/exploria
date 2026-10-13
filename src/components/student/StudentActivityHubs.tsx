'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Gamepad2,
  Trophy,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  X,
} from 'lucide-react'

interface HubItem {
  id: 'arcade' | 'competition'
  href: string
  title: string
  tagline: string
  badge: string
  icon: typeof Gamepad2
  iconColor: string
  action: string
  description: string
  highlights: string[]
}

const HUBS: HubItem[] = [
  {
    id: 'arcade',
    href: '/student/games',
    title: 'Game Arcade',
    tagline: 'Latihan interaktif & cabaran arked',
    badge: 'Arked Interaktif',
    icon: Gamepad2,
    iconColor: 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md',
    action: 'Masuk Game Arcade',
    description:
      'Latihan interaktif berasaskan audio sebutan suara Text-to-Speech di Astro Spelling Hive, atau tembak meteor nombor pantas di Meteor Sifir Blaster!',
    highlights: ['🎙️ Sebutan Audio', '☄️ Tembakan Laser', '❤️ 3 Nyawa Hati', '🔥 Multiplier Kombo'],
  },
  {
    id: 'competition',
    href: '/student/competition',
    title: 'Pertandingan',
    tagline: 'Peperiksaan rasmi berjadual & sijil',
    badge: 'Pensijilan Rasmi',
    icon: Trophy,
    iconColor: 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-md',
    action: 'Sertai Pertandingan',
    description:
      'Peperiksaan berjadual yang disahkan oleh pentadbir Exploria. Capai markah cemerlang untuk kelayakan Sijil Rasmi Digital & Pingat Emas, Perak, atau Gangsa.',
    highlights: ['🥇 Emas (≥85%)', '🥈 Perak (70-84%)', '🥉 Gangsa (50-69%)', '📜 Sijil PDF'],
  },
]

export default function StudentActivityHubs() {
  const [expandedId, setExpandedId] = useState<'arcade' | 'competition' | null>(null)

  const toggleExpand = (id: 'arcade' | 'competition') => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <section aria-label="Arena & Pertandingan Utama" className="space-y-3">
      {/* Clean, punchy section title with minimal text */}
      <div className="flex items-center px-1">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600 fill-blue-600" /> Arena &amp; Pertandingan
        </h2>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 items-start">
        {HUBS.map((hub) => {
          const Icon = hub.icon
          const isExpanded = expandedId === hub.id

          return (
            <article
              key={hub.id}
              className={`relative overflow-hidden rounded-3xl border-2 bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                isExpanded ? 'border-blue-400 ring-2 ring-blue-100' : 'border-blue-100/90 hover:border-blue-300'
              }`}
            >
              {/* Minimalist Top Content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl ${hub.iconColor}`}>
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {hub.title}
                      </h3>
                      {/* Interactive Info Trigger (Tekan untuk lihat maklumat panjang) */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(hub.id)}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2.5 py-0.5 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                        title={isExpanded ? 'Tutup maklumat' : 'Lihat maklumat penuh'}
                      >
                        <Info className="h-3 w-3 text-blue-600" />
                        <span>{isExpanded ? 'Tutup Info' : 'Maklumat'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Primary Direct CTA Button */}
                  <Link
                    href={hub.href}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md active:scale-95 transition"
                  >
                    <span>Masuk</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Long Text & Details: ONLY VISIBLE AFTER PRESSING (Lepas tekan baru keluar semua itu) */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                        <Sparkles className="h-3 w-3 text-blue-600" /> {hub.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(hub.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Tutup"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      {hub.description}
                    </p>

                    {/* Highlights Pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                      {hub.highlights.map((item, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
