'use client'

import React from 'react'
import { X, Printer, ShieldCheck } from 'lucide-react'

export interface CertificateData {
  certId: string
  studentName: string
  competitionTitle: string
  awardLevel: 'EMAS' | 'PERAK' | 'GANGSA' | 'PENYERTAAN'
  score: number
  totalQuestions: number
  date: string
  school?: string
}

interface OfficialCertificateModalProps {
  certificate: CertificateData | null
  onClose: () => void
}

export function OfficialCertificateModal({ certificate, onClose }: OfficialCertificateModalProps) {
  if (!certificate) return null

  const handlePrint = () => {
    window.print()
  }

  const isGold = certificate.awardLevel === 'EMAS'
  const isSilver = certificate.awardLevel === 'PERAK'
  const isBronze = certificate.awardLevel === 'GANGSA'

  const awardTitle = isGold
    ? 'ANUGERAH PINGAT EMAS (GOLD MEDAL)'
    : isSilver
    ? 'ANUGERAH PINGAT PERAK (SILVER MEDAL)'
    : isBronze
    ? 'ANUGERAH PINGAT GANGSA (BRONZE MEDAL)'
    : 'SIJIL PENYERTAAN RASMI'

  const medalIcon = isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : '🎖️'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Controls toolbar for screen display */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full bg-[#0072bc] hover:bg-[#005ea6] px-5 py-2.5 text-sm font-bold text-white shadow-xl active:scale-95 transition"
        >
          <Printer className="h-4 w-4" /> Cetak / Simpan PDF
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-900/90 border border-white/20 p-2.5 text-white hover:bg-slate-800 active:scale-95 transition shadow-lg"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Certificate Sheet (A4 Landscape aspect) */}
      <div className="relative my-auto w-full max-w-[900px] bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none print:my-0">
        
        {/* Certificate Outer Border Frame */}
        <div className="p-5 sm:p-8 border-[12px] border-double border-[#b38b2d] bg-[#fdfbf7] relative">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-[#b38b2d] text-2xl font-serif">✤</div>
          <div className="absolute top-2 right-2 text-[#b38b2d] text-2xl font-serif">✤</div>
          <div className="absolute bottom-2 left-2 text-[#b38b2d] text-2xl font-serif">✤</div>
          <div className="absolute bottom-2 right-2 text-[#b38b2d] text-2xl font-serif">✤</div>

          {/* Inner Golden Line */}
          <div className="border border-[#d4af37]/60 p-6 sm:p-8 text-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-[#fcfaf4] to-[#f7f2e5]">

            {/* Header / Logo */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🚀</span>
                <span className="font-mono text-2xl font-black tracking-widest text-[#151a54] uppercase">
                  EXPLORIA SKILL PORTAL
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-bold tracking-[0.25em] text-[#8c6d1f] uppercase">
                National Academic & Skills Olympiad
              </p>
            </div>

            {/* Certificate Title */}
            <div className="my-6">
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-wider text-[#1c183d] uppercase">
                SIJIL PENGHARGAAN RASMI
              </h1>
              <div className="mx-auto mt-2 h-0.5 w-36 bg-gradient-to-r from-transparent via-[#b38b2d] to-transparent" />
            </div>

            {/* Body Description */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-serif italic text-slate-600">
                Dengan sukacitanya diperakui bahawa
              </p>

              {/* Student Name */}
              <div className="my-3">
                <span className="inline-block border-b-2 border-[#b38b2d] pb-1 font-serif text-2xl sm:text-4xl font-black text-[#0f172a] uppercase tracking-wide">
                  {certificate.studentName}
                </span>
                {certificate.school && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {certificate.school}
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm font-serif text-slate-700 max-w-lg mx-auto leading-relaxed">
                Telah berjaya menyertai dan menunjukkan kecemerlangan luar biasa dalam acara pertandingan rasmi:
              </p>

              <h2 className="font-sans text-lg sm:text-xl font-black text-[#1b1c60] uppercase tracking-wide">
                &quot;{certificate.competitionTitle}&quot;
              </h2>

              {/* Award Badge Pill */}
              <div className="my-4 inline-flex items-center gap-2 rounded-full border-2 bg-gradient-to-r px-6 py-2 shadow-md shadow-amber-900/10 scale-105 sm:scale-110 border-[#b38b2d] bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-100">
                <span className="text-2xl">{medalIcon}</span>
                <span className="text-xs sm:text-sm font-black tracking-wider text-[#573d09] uppercase">
                  {awardTitle}
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-500">
                Markah Rasmi: <span className="text-[#10195a] font-black text-sm">{certificate.score}%</span> (Status: Disahkan Peringkat Kebangsaan)
              </p>
            </div>

            {/* Footer / Signatures & Seal */}
            <div className="mt-10 grid grid-cols-3 items-end pt-4 border-t border-[#d4af37]/30 text-left">
              
              {/* Left: Date & Cert ID */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tarikh Penganugerahan</p>
                <p className="text-xs font-bold text-slate-800">{certificate.date}</p>
                <p className="mt-2 text-[10px] font-mono text-slate-400">
                  ID: <span className="font-bold text-slate-700">{certificate.certId}</span>
                </p>
              </div>

              {/* Center: Gold Embossed Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-double border-[#b38b2d] bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-lg text-slate-900">
                  <div className="flex flex-col items-center justify-center text-center p-1">
                    <ShieldCheck className="h-5 w-5 text-amber-950" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-amber-950">
                      OFFICIAL SEAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Signature */}
              <div className="text-right">
                <div className="inline-block border-b border-slate-700 pb-1 px-4">
                  <span className="font-serif italic font-bold text-xs sm:text-sm text-slate-800">
                    Dr. Rizal Iskandar
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                  Pengarah Akademik Exploria
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
