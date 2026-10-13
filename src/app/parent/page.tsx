'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle2, Clock, Award, X, Sparkles } from 'lucide-react';
import { useChildAwards, useQuizActivities, useParentChildren } from '@/lib/parent-dashboard';
import type { ParentChild, QuizActivity, ChildAward } from '@/lib/parent-dashboard';
import { OfficialCertificateModal, type CertificateData } from '@/components/ui/OfficialCertificateModal';

const scorePercent = (score: number, total: number) => {
  if (!total || total <= 0) return 0;
  if (score > total && total === 10) return Math.min(Math.round(score), 100);
  return Math.min(Math.max(Math.round((score / total) * 100), 0), 100);
};

function ActivityCalendar({
  activities,
  onSelectDay,
}: {
  activities: QuizActivity[];
  onSelectDay: (day: number, dateStr: string, dayQuizzes: QuizActivity[]) => void;
}) {
  const [monthOffset, setMonthOffset] = useState(0);

  const displayDate = new Date();
  displayDate.setMonth(displayDate.getMonth() + monthOffset);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Map activities to dates in this month
  const quizzesByDay = new Map<number, QuizActivity[]>();
  activities.forEach((quiz) => {
    const actDate = new Date();
    actDate.setDate(actDate.getDate() - quiz.daysAgo);
    if (actDate.getFullYear() === year && actDate.getMonth() === month) {
      const d = actDate.getDate();
      const list = quizzesByDay.get(d) ?? [];
      list.push(quiz);
      quizzesByDay.set(d, list);
    }
  });

  return (
    <section className="rounded-[18px] bg-white p-[18px_20px] shadow-[0_4px_16px_rgba(60,90,120,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a2b49]">Kalendar Aktiviti</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m - 1)}
            aria-label="Bulan sebelumnya"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#cfd9e2] text-[#0072bc] hover:bg-sky-50 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m + 1)}
            aria-label="Bulan seterusnya"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#cfd9e2] text-[#0072bc] hover:bg-sky-50 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs font-bold capitalize text-[#0072bc]">
          {displayDate.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
        </p>
        {monthOffset !== 0 && (
          <button
            type="button"
            onClick={() => setMonthOffset(0)}
            className="text-[11px] font-semibold text-[#0072bc] hover:underline"
          >
            Kembali ke Hari Ini
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['A', 'I', 'S', 'R', 'K', 'J', 'S'].map((day, index) => (
          <span key={`${day}-${index}`} className="font-semibold text-[#6b7a88]">{day}</span>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayQuizzes = quizzesByDay.get(day) ?? [];
          const hasQuiz = dayQuizzes.length > 0;
          const isToday =
            monthOffset === 0 &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (hasQuiz) {
                  const dateStr = `${day} ${displayDate.toLocaleDateString('ms-MY', { month: 'short', year: 'numeric' })}`;
                  onSelectDay(day, dateStr, dayQuizzes);
                }
              }}
              disabled={!hasQuiz}
              aria-current={isToday ? 'date' : undefined}
              aria-label={`${day}${hasQuiz ? `, ${dayQuizzes.length} kuiz dijawab` : ''}${isToday ? ', hari ini' : ''}`}
              className={`rounded-lg py-[7px] transition text-center ${
                hasQuiz
                  ? 'parent-blue-surface font-semibold shadow-xs hover:bg-[#005ea6] cursor-pointer active:scale-95'
                  : 'text-slate-700 hover:bg-slate-100 disabled:hover:bg-transparent disabled:cursor-default'
              } ${isToday ? 'outline outline-2 outline-[#0072bc]' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[#6b7a88]">
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#0072bc]" aria-hidden="true" />
        Hari kuiz dijawab (tekan untuk butiran)
      </p>
    </section>
  );
}

function QuizTimeline({
  selectedChild,
  childProfiles,
  recentOnly = false,
  activities,
  onSelectQuiz,
}: {
  selectedChild: string;
  childProfiles: ParentChild[];
  recentOnly?: boolean;
  activities: QuizActivity[];
  onSelectQuiz: (quiz: QuizActivity) => void;
}) {
  const filteredQuizzes = activities.filter(
    (quiz) => selectedChild === 'all' || quiz.childId === selectedChild,
  );
  const groupedQuizzes = new Map<number, typeof filteredQuizzes>();

  filteredQuizzes.forEach((quiz) => {
    const group = groupedQuizzes.get(quiz.daysAgo) ?? [];
    group.push(quiz);
    groupedQuizzes.set(quiz.daysAgo, group);
  });

  const days = [...groupedQuizzes.keys()].sort((a, b) => a - b);
  const shownDays = recentOnly ? days.slice(0, 2) : days;

  if (shownDays.length === 0) {
    return <p className="py-2 text-sm text-[#6b7a88]">Belum ada aktiviti kuiz.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
      {shownDays.map((daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        return (
          <div key={daysAgo}>
            <div className="parent-blue-surface mb-2.5 flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium">
              {date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
              <span className="tracking-[3px]" aria-hidden="true">⚽🏀</span>
            </div>
            {groupedQuizzes.get(daysAgo)?.map((quiz, index, group) => {
              const percentage = scorePercent(quiz.score, quiz.total);
              const markerColor = percentage >= 80 ? '#0072bc' : percentage >= 60 ? '#5aa9d6' : '#64748b';
              const child = childProfiles.find((c) => c.id === quiz.childId);

              return (
                <button
                  type="button"
                  key={`${quiz.childId}-${quiz.title}-${quiz.id}`}
                  onClick={() => onSelectQuiz(quiz)}
                  className="relative flex w-full text-left gap-2.5 pb-2.5 text-sm rounded-lg hover:bg-sky-50/70 p-1.5 transition"
                >
                  {index < group.length - 1 && (
                    <span className="absolute bottom-0 left-[11px] top-5 w-0.5 bg-[#5aa9d6]" aria-hidden="true" />
                  )}
                  <span className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: markerColor }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1a2b49] leading-snug">{quiz.time} - {quiz.title}</p>
                    <p className="text-xs text-[#6b7a88]">
                      {child?.name ?? 'Anak'} · Skor <span className="font-bold text-[#0072bc]">{quiz.score}/{quiz.total}</span> · {quiz.minutes} minit
                    </p>
                  </div>
                  <span className="parent-blue-surface self-center shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold">
                    {percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ParentDashboardPage() {
  const [selectedChild, setSelectedChild] = useState('all');
  const { children, error: loadError, loading: childrenLoading } = useParentChildren();
  const { activities, loading: activitiesLoading } = useQuizActivities(selectedChild === 'all' ? undefined : selectedChild);
  const { awards, loading: awardsLoading } = useChildAwards(selectedChild === 'all' ? undefined : selectedChild);

  const [activeCertPreview, setActiveCertPreview] = useState<CertificateData | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizActivity | null>(null);
  const [calendarDayModal, setCalendarDayModal] = useState<{
    day: number;
    dateStr: string;
    quizzes: QuizActivity[];
  } | null>(null);

  const visibleAwards = awards;

  const handleAwardClick = (award: ChildAward) => {
    const child = children.find((c) => c.id === award.childId);
    setActiveCertPreview({
      certId: award.certId || `EXP-CERT-${award.id}`,
      studentName: child?.name || award.childName || 'Pelajar Exploria',
      competitionTitle: award.rawTitle || award.title,
      awardLevel: (award.rank as any) || 'EMAS',
      score: award.score || 95,
      totalQuestions: 10,
      date: award.date || '1 Oktober 2026',
      school: child?.school || 'Sekolah Kebangsaan',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_280px]">
      {/* Official Certificate Modal */}
      {activeCertPreview && (
        <OfficialCertificateModal
          certificate={activeCertPreview}
          onClose={() => setActiveCertPreview(null)}
        />
      )}

      {/* Quiz Attempt Modal */}
      {selectedQuiz && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedQuiz(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#cfe2f3] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1a2b49]">{selectedQuiz.title}</h3>
                <p className="text-xs text-slate-500">
                  {children.find((c) => c.id === selectedQuiz.childId)?.name || 'Anak'} · {selectedQuiz.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuiz(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-around rounded-2xl bg-sky-50 p-4 border border-sky-100 text-center">
                <div>
                  <p className="text-xs text-slate-500">Skor</p>
                  <p className="text-2xl font-black text-[#0072bc]">{selectedQuiz.score}/{selectedQuiz.total}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Peratusan</p>
                  <p className="text-2xl font-black text-[#0072bc]">{scorePercent(selectedQuiz.score, selectedQuiz.total)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Masa</p>
                  <p className="text-2xl font-black text-[#0072bc]">{selectedQuiz.minutes} m</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
                <p><strong>Status:</strong> {selectedQuiz.passed ? '✅ Lulus dengan cemerlang' : 'Perlu bimbingan lanjut'}</p>
                <p><strong>Ganjaran XP:</strong> +{selectedQuiz.xpEarned || 50} XP diperoleh</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/parent/activity"
                onClick={() => setSelectedQuiz(null)}
                className="parent-blue-surface inline-flex items-center rounded-xl px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition"
              >
                Lihat Semua Aktiviti
              </Link>
              <button
                type="button"
                onClick={() => setSelectedQuiz(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}

      {/* Calendar Day Quizzes Modal */}
      {calendarDayModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setCalendarDayModal(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#cfe2f3] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1a2b49]">Aktiviti Pada {calendarDayModal.dateStr}</h3>
                <p className="text-xs text-[#0072bc] font-semibold">{calendarDayModal.quizzes.length} Kuiz Dijawab</p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarDayModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
              {calendarDayModal.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-[#1a2b49]">{quiz.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {children.find((c) => c.id === quiz.childId)?.name || 'Anak'} · {quiz.time}
                    </p>
                  </div>
                  <span className="parent-blue-surface rounded-full px-2.5 py-1 text-xs font-bold">
                    {quiz.score}/{quiz.total}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setCalendarDayModal(null)}
                className="parent-blue-surface rounded-xl px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}

      <div className="min-w-0">
        {loadError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}

        <section className="mb-[18px] rounded-[18px] bg-white p-[18px_20px] shadow-[0_4px_16px_rgba(60,90,120,0.08)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold text-[#1a2b49]">Senarai Anak</h1>
            <Link href="/parent/children" className="parent-blue-surface rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition">
              Lihat senarai
            </Link>
          </div>
          {childrenLoading ? (
            <p className="py-6 text-center text-sm text-[#6b7a88]">Memuatkan senarai anak...</p>
          ) : children.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#b8d7ec] bg-[#f7fbfe] p-6 text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#e1effa] text-[#0072bc] text-xl font-bold">
                👨‍👩‍👧‍👦
              </div>
              <p className="font-bold text-[#1a2b49]">Belum ada profil anak didaftarkan</p>
              <p className="mt-1 text-xs text-[#6b7a88] max-w-sm mx-auto">
                Anda belum mengisi borang pendaftaran anak. Sila klik butang di bawah untuk mendaftarkan anak anda bagi memulakan aktiviti kuiz dan sijil pencapaian.
              </p>
              <Link
                href="/parent/add-child"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[#0072bc] bg-white px-5 py-2.5 text-sm font-semibold text-[#0072bc] shadow-xs hover:bg-[#f0f7fc] transition active:scale-95"
              >
                + Tambah Anak Sekarang
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-[18px]">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/parent/children/${child.id}`}
                  className="rounded-xl px-1 text-center text-[15px] font-medium leading-tight hover:bg-[#f3f8fa] focus-visible:outline-[#0072bc] transition"
                  aria-label={`Lihat profil ${child.name}`}
                >
                  <span
                    className="mx-auto mb-1 grid h-[66px] w-[66px] place-items-center overflow-hidden rounded-full border-[3px] text-[34px]"
                    style={{ borderColor: child.color, backgroundColor: `${child.color}2a` }}
                    aria-hidden="true"
                  >
                    {child.image ? <Image src={child.image} alt="" width={66} height={66} unoptimized className="h-full w-full object-cover" /> : child.avatar}
                  </span>
                  {child.name}
                  <span className="mt-1 block text-xs font-normal text-[#6b7a88]">({child.age} tahun)</span>
                </Link>
              ))}
              <Link
                href="/parent/add-child"
                className="flex h-[106px] w-[118px] flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#0072bc] bg-white text-center text-sm font-semibold leading-tight text-[#0072bc] shadow-xs hover:bg-[#f0f7fc] transition active:scale-95"
              >
                <span className="text-[34px] font-light leading-none text-[#0072bc]" aria-hidden="true">+</span>
                Tambah<br />Anak
              </Link>
            </div>
          )}
        </section>

        <section className="mb-[18px] rounded-[18px] bg-white p-[18px_20px] shadow-[0_4px_16px_rgba(60,90,120,0.08)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[#1a2b49]">Aktiviti Anak</h2>
            <label className="flex items-center gap-2 text-sm text-[#536471]">
              <span className="font-medium">Filter:</span>
              <select
                value={selectedChild}
                onChange={(event) => setSelectedChild(event.target.value)}
                className="h-[38px] min-w-[130px] rounded-lg border border-[#cfd9e2] bg-white px-3 text-sm outline-none focus:border-[#0072bc]"
              >
                <option value="all">Semua</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </label>
          </div>
          {activitiesLoading ? (
            <p className="py-2 text-sm text-[#6b7a88]">Memuatkan aktiviti...</p>
          ) : (
            <QuizTimeline
              selectedChild={selectedChild}
              childProfiles={children}
              recentOnly
              activities={activities}
              onSelectQuiz={(quiz) => setSelectedQuiz(quiz)}
            />
          )}
          <Link href="/parent/activity" className="parent-blue-surface mt-3 inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition">
            Lihat semua aktiviti <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-[18px] bg-white p-[18px_20px] shadow-[0_4px_16px_rgba(60,90,120,0.08)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#1a2b49]">Anugerah Anak</h2>
            <Link
              href="/parent/awards"
              className="parent-blue-surface rounded-lg px-4 py-2 text-[13px] font-semibold shadow-xs hover:bg-[#005ea6] transition"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {awardsLoading ? (
              <p className="col-span-full py-2 text-sm text-[#6b7a88]">Memuatkan anugerah...</p>
            ) : visibleAwards.length === 0 ? (
              <p className="col-span-full py-2 text-sm text-[#6b7a88]">Belum ada anugerah.</p>
            ) : (
              visibleAwards.slice(0, 5).map((award, index) => (
                <button
                  type="button"
                  key={`${award.childId}-${award.title}-${index}`}
                  onClick={() => handleAwardClick(award)}
                  className="parent-blue-surface flex min-h-[106px] flex-col items-center justify-center rounded-xl px-1.5 py-3.5 text-center text-[15px] font-semibold shadow-xs hover:bg-[#005ea6] transition active:scale-95 cursor-pointer"
                  title="Tekan untuk pratonton & cetak sijil"
                >
                  <span className="mb-1 text-4xl leading-none" aria-hidden="true">{award.icon}</span>
                  <span className="line-clamp-1">{award.title}</span>
                  <span className="mt-1 text-xs font-normal text-white/85">
                    ({children.find((child) => child.id === award.childId)?.name.split(' ')[0] ?? 'Anak'})
                  </span>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
      <aside className="min-w-0">
        <ActivityCalendar
          activities={activities}
          onSelectDay={(day, dateStr, dayQuizzes) =>
            setCalendarDayModal({ day, dateStr, quizzes: dayQuizzes })
          }
        />
      </aside>
    </div>
  );
}
