'use client';

import { useState } from 'react';
import { Award, BookOpenCheck, Search, Printer, X, Filter } from 'lucide-react';
import { useParentChildren, useQuizActivities, type QuizActivity } from '@/lib/parent-dashboard';

export default function ParentActivityPage() {
  const [selectedChild, setSelectedChild] = useState('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'pass' | 'needs_work'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizActivity | null>(null);

  const { children, error: loadError, loading: childrenLoading } = useParentChildren();
  const { activities, loading: activitiesLoading } = useQuizActivities(
    selectedChild === 'all' ? undefined : selectedChild
  );

  const calcPercent = (score: number, total: number) => {
    if (!total || total <= 0) return 0;
    if (score > total && total === 10) return Math.min(Math.round(score), 100);
    return Math.min(Math.max(Math.round((score / total) * 100), 0), 100);
  };

  // Apply search & score filters
  const filteredActivities = activities.filter((act) => {
    const percentage = calcPercent(act.score, act.total);
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (scoreFilter === 'high') return percentage >= 80;
    if (scoreFilter === 'pass') return percentage >= 60;
    if (scoreFilter === 'needs_work') return percentage < 60;
    return true;
  });

  const averageScore = filteredActivities.length
    ? Math.min(
        Math.round(
          filteredActivities.reduce((total, activity) => total + calcPercent(activity.score, activity.total), 0) /
            filteredActivities.length
        ),
        100
      )
    : 0;

  const groupedActivities = new Map<number, typeof filteredActivities>();
  filteredActivities.forEach((activity) => {
    const group = groupedActivities.get(activity.daysAgo) ?? [];
    group.push(activity);
    groupedActivities.set(activity.daysAgo, group);
  });

  return (
    <div className="space-y-5">
      {/* Quiz Detail Modal */}
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
                  <p className="text-2xl font-black text-[#0072bc]">
                    {calcPercent(selectedQuiz.score, selectedQuiz.total)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Masa Kuiz</p>
                  <p className="text-2xl font-black text-[#0072bc]">{selectedQuiz.minutes} minit</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5 border border-slate-200">
                <p>
                  <strong>Keputusan:</strong>{' '}
                  {selectedQuiz.passed ? (
                    <span className="font-bold text-emerald-700">Tahniah! Lulus Kuiz.</span>
                  ) : (
                    <span className="font-bold text-amber-700">Perlu ulangkaji semula.</span>
                  )}
                </p>
                <p>
                  <strong>Ganjaran XP:</strong> +{selectedQuiz.xpEarned || 50} XP ditambah ke profil anak
                </p>
                <p>
                  <strong>Tarikh Selesai:</strong> {selectedQuiz.completedAt ? new Date(selectedQuiz.completedAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari ini'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedQuiz(null)}
                className="parent-blue-surface rounded-xl px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}

      {/* Page Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a2b49]">Aktiviti Anak</h1>
          <p className="mt-1 text-[#6b7a88]">Jejaki perkembangan dan aktiviti pembelajaran anak anda.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="parent-blue-surface inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition active:scale-95"
        >
          <Printer className="h-4 w-4" /> Cetak Laporan Aktiviti
        </button>
      </div>

      {loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}

      {/* Filter and Summary Section */}
      <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a2b49]">Ringkasan Aktiviti</h2>
            {activitiesLoading ? (
              <p className="mt-1 text-sm text-[#6b7a88]">Memuatkan...</p>
            ) : (
              <p className="mt-1 text-sm text-[#6b7a88]">
                {filteredActivities.length} kuiz dijawab · purata skor <strong className="text-[#0072bc]">{averageScore}%</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#536471]">
              <span className="font-semibold">Anak:</span>
              <select
                value={selectedChild}
                onChange={(event) => setSelectedChild(event.target.value)}
                className="h-[38px] min-w-[150px] rounded-lg border border-[#cfd9e2] bg-white px-3 text-sm outline-none focus:border-[#0072bc]"
              >
                <option value="all">Semua Anak</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Search & Quick Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kuiz mengikut tajuk..."
              className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-9 pr-3 py-1.5 text-xs text-[#1a2b49] outline-none focus:border-[#0072bc]"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setScoreFilter('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                scoreFilter === 'all'
                  ? 'parent-blue-surface shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setScoreFilter('high')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                scoreFilter === 'high'
                  ? 'parent-blue-surface shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cemerlang (≥80%)
            </button>
            <button
              type="button"
              onClick={() => setScoreFilter('pass')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                scoreFilter === 'pass'
                  ? 'parent-blue-surface shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Lulus (≥60%)
            </button>
            <button
              type="button"
              onClick={() => setScoreFilter('needs_work')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                scoreFilter === 'needs_work'
                  ? 'parent-blue-surface shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Perlu Bimbingan (&lt;60%)
            </button>
          </div>
        </div>
      </section>

      {/* Activity Timeline List */}
      {activitiesLoading ? (
        <section className="rounded-[18px] bg-white p-6 text-sm text-[#6b7a88] shadow-[0_4px_16px_rgba(60,90,120,0.08)]">
          Memuatkan aktiviti kuiz...
        </section>
      ) : filteredActivities.length === 0 ? (
        <section className="rounded-[18px] bg-white p-6 text-sm text-[#6b7a88] shadow-[0_4px_16px_rgba(60,90,120,0.08)] text-center">
          Belum ada aktiviti kuiz yang sepadan dengan tapisan anda.
        </section>
      ) : (
        <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] sm:p-6">
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 lg:grid-cols-2">
            {[...groupedActivities.keys()].sort((a, b) => a - b).map((daysAgo) => {
              const date = new Date();
              date.setDate(date.getDate() - daysAgo);
              const group = groupedActivities.get(daysAgo) ?? [];

              return (
                <div key={daysAgo}>
                  <div className="parent-blue-surface mb-3 flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium">
                    {date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="tracking-[3px]" aria-hidden="true">⚽🏀</span>
                  </div>
                  {group.map((activity, index) => {
                    const percentage = calcPercent(activity.score, activity.total);
                    const child = children.find((item) => item.id === activity.childId);
                    const markerColor = percentage >= 80 ? '#0072bc' : percentage >= 60 ? '#5aa9d6' : '#64748b';

                    return (
                      <article key={`${activity.childId}-${activity.title}-${activity.id}`} className="relative flex gap-3 pb-3 text-sm">
                        {index < group.length - 1 && (
                          <span className="absolute bottom-0 left-[5px] top-4 w-0.5 bg-[#5aa9d6]" aria-hidden="true" />
                        )}
                        <span className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: markerColor }} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#1a2b49] leading-snug">{activity.time} - {activity.title}</h3>
                          <p className="mt-0.5 text-xs text-[#6b7a88]">
                            {child?.name ?? 'Anak'} · Skor <span className="font-bold text-[#0072bc]">{activity.score}/{activity.total}</span> · {activity.minutes} minit
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-start">
                          <span className="parent-blue-surface hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex">
                            <BookOpenCheck className="h-3.5 w-3.5" /> {percentage}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedQuiz(activity)}
                            className="inline-flex items-center rounded-lg border border-[#0072bc] bg-sky-50 px-2.5 py-1 text-xs font-bold text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition"
                          >
                            Perincian
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-[#edf1f4] pt-4 text-xs text-[#6b7a88]">
            <Award className="h-4 w-4 text-[#0072bc]" />
            Skor 80% ke atas ditandakan sebagai pencapaian cemerlang.
          </div>
        </section>
      )}
    </div>
  );
}
