'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    label: 'PEMBELAJARAN',
    title: 'Terokai Modul Pembelajaran Subjek!',
    description: 'Pilih topik, pelajari nota konsep teras dan uji kefahaman anda hari ini.',
    art: '🚀',
    action: 'Mula Belajar',
    href: '/student/quizzes',
    background: 'bg-[linear-gradient(90deg,#075985,#0284c7)]',
    accent: 'bg-white text-sky-900 border-white font-extrabold shadow-sm',
  },
  {
    label: 'PERTANDINGAN',
    title: 'Cabaran Peperiksaan Rasmi Exploria',
    description: 'Sertai pertandingan berjadual untuk merebut pingat emas dan sijil pencapaian.',
    art: '🏆',
    action: 'Sertai Sekarang',
    href: '/student/competition',
    background: 'bg-[linear-gradient(90deg,#1e40af,#2563eb)]',
    accent: 'bg-white text-blue-900 border-white font-extrabold shadow-sm',
  },
  {
    label: 'PENCAPAIAN',
    title: 'Kumpul Lencana & Naikan Tahap XP Anda!',
    description: 'Selesaikan kuiz dan aktiviti permainan untuk membuka lencana baharu.',
    art: '🎖️',
    action: 'Lihat Lencana',
    href: '/student/achievements',
    background: 'bg-[linear-gradient(90deg,#0369a1,#0284c7)]',
    accent: 'bg-white text-blue-900 border-white font-extrabold shadow-sm',
  },
]

export default function StudentAnnouncementBanner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [isPaused])

  const moveSlide = (direction: number) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <section
      data-ad-slot="student-header-banner"
      data-ad-format="carousel"
      aria-roledescription="carousel"
      aria-label="Pengumuman"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
      }}
      className="relative h-[118px] overflow-hidden bg-[#0369a1] text-white max-[640px]:h-[150px]"
    >
      <span className="absolute right-[56px] top-2 z-10 text-[10px] text-blue-100/90 font-bold">Makluman</span>
      {slides.map((slide, index) => (
        <div
          key={slide.label}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          aria-hidden={activeSlide !== index}
          className={`absolute inset-0 flex items-center justify-center gap-7 px-[90px] transition-[opacity,transform,visibility] duration-500 max-[1000px]:px-[60px] max-[640px]:flex-wrap max-[640px]:content-center max-[640px]:gap-3 max-[640px]:px-12 ${slide.background} ${activeSlide === index ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-6 opacity-0'}`}
        >
          <span className="flex-none text-[54px] max-[640px]:hidden" aria-hidden="true">{slide.art}</span>
          <div className="max-w-[520px] text-left max-[640px]:w-full max-[640px]:text-center">
            <span className={`mb-[5px] inline-block rounded-full px-[10px] py-0.5 text-[11px] font-bold ${slide.accent}`}>{slide.label}</span>
            <h1 className="text-[25px] font-bold leading-[1.15] max-[640px]:text-[19px]">{slide.title}</h1>
            <p className="mt-[3px] text-[13.5px] text-blue-100 max-[640px]:text-xs">{slide.description}</p>
          </div>
          <Link
            href={slide.href}
            tabIndex={activeSlide === index ? 0 : -1}
            className={`flex-none whitespace-nowrap rounded-full border-2 px-5 py-[9px] text-sm font-bold transition-transform hover:-translate-y-0.5 max-[640px]:px-3.5 max-[640px]:py-1.5 max-[640px]:text-xs ${slide.accent}`}
          >
            {slide.action}
          </Link>
        </div>
      ))}
      <button
        type="button"
        aria-label="Pengumuman sebelumnya"
        onClick={() => moveSlide(-1)}
        className="absolute left-[14px] top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-white/70 bg-white/20 text-white hover:bg-white/40 max-[640px]:left-2 max-[640px]:h-[26px] max-[640px]:w-[26px]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Pengumuman seterusnya"
        onClick={() => moveSlide(1)}
        className="absolute right-[14px] top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-white/70 bg-white/20 text-white hover:bg-white/40 max-[640px]:right-2 max-[640px]:h-[26px] max-[640px]:w-[26px]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-[7px] left-0 right-0 z-10 flex justify-center gap-[6px]">
        {slides.map((slide, index) => (
          <button
            key={slide.label}
            type="button"
            aria-label={`Tunjukkan pengumuman ${index + 1}`}
            aria-pressed={activeSlide === index}
            onClick={() => setActiveSlide(index)}
            className={`h-[9px] rounded-full transition-all ${activeSlide === index ? 'w-[22px] bg-white' : 'w-[9px] bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  )
}
