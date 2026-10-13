'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParentChildren, useQuizActivities } from '@/lib/parent-dashboard';
import { ChevronRight, GraduationCap, Search, Activity, Award, UserPlus, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ParentChildrenPage() {
  const { children, error: loadError, loading: childrenLoading } = useParentChildren();
  const { activities } = useQuizActivities();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (child.icNumber && child.icNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    child.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a2b49]">Senarai Anak</h1>
          <p className="mt-1 text-[#6b7a88]">Pilih profil untuk melihat perincian dan perkembangan anak.</p>
        </div>
        <Link
          href="/parent/add-child"
          className="parent-blue-surface inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Anak</span>
        </Link>
      </div>

      {/* Search Bar */}
      {children.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari anak mengikut nama, No. IC/ID, atau tahap..."
            className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1a2b49] outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc] transition"
          />
        </div>
      )}

      {loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {childrenLoading && <p className="col-span-full py-4 text-center text-sm text-[#6b7a88]">Memuatkan senarai anak...</p>}

        {!childrenLoading && filteredChildren.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center border border-[#e3ebf2]">
            <p className="text-slate-600 font-medium">
              {searchQuery ? 'Tiada anak sepadan dengan carian anda.' : 'Belum ada anak didaftarkan.'}
            </p>
            <Link
              href="/parent/add-child"
              className="parent-blue-surface mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition"
            >
              <UserPlus className="h-4 w-4" /> Tambah Anak Sekarang
            </Link>
          </div>
        )}

        {filteredChildren.map((child) => {
          const quizzes = activities.filter((activity) => activity.childId === child.id);
          const average = quizzes.length
            ? Math.min(
                Math.round(
                  quizzes.reduce((sum, activity) => {
                    const pct = activity.score > activity.total && activity.total === 10
                      ? Math.min(activity.score, 100)
                      : Math.min(Math.round((activity.score / activity.total) * 100), 100);
                    return sum + pct;
                  }, 0) / quizzes.length
                ),
                100
              )
            : 0;

          return (
            <div
              key={child.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e3ebf2] bg-white p-5 text-center shadow-[0_4px_16px_rgba(60,90,120,0.06)] transition hover:border-[#0072bc] hover:shadow-md"
            >
              <div>
                <span
                  className="mx-auto mb-3 grid h-[84px] w-[84px] place-items-center overflow-hidden rounded-full border-[3px] text-4xl"
                  style={{ borderColor: child.color, backgroundColor: `${child.color}2a` }}
                >
                  {child.image ? (
                    <Image src={child.image} alt="" width={84} height={84} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    child.avatar
                  )}
                </span>
                <h2 className="text-lg font-bold text-[#1a2b49]">{child.name}</h2>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-[#6b7a88]">
                  <GraduationCap className="h-4 w-4 text-[#0072bc]" />
                  <span>{child.age} tahun · {child.grade}{child.icNumber ? ` (IC: ${child.icNumber})` : ''}</span>
                </p>
                {child.email && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#0072bc] bg-sky-50 rounded-full px-2.5 py-0.5 max-w-full truncate border border-sky-100">
                    <Mail className="h-3 w-3" />
                    <span>{child.email}</span>
                  </p>
                )}
                <p className="mt-3 text-sm text-[#536471]">
                  <span className="font-bold text-[#1a2b49]">{quizzes.length}</span> kuiz · purata{' '}
                  <span className="font-bold text-[#0072bc]">{average}%</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/parent/children/${child.id}`}
                  className="parent-blue-surface w-full inline-flex items-center justify-center rounded-xl py-2 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition active:scale-98"
                >
                  <span>Lihat Profil Penuh</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/parent/activity?childId=${child.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#0072bc] bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Aktiviti</span>
                  </Link>
                  <Link
                    href={`/parent/awards?childId=${child.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#0072bc] bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Anugerah</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
