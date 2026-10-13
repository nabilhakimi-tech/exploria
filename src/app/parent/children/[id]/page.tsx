'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Award,
  BookOpenCheck,
  ChevronLeft,
  GraduationCap,
  Mail,
  Edit3,
  Trash2,
  Copy,
  Printer,
  Check,
  X,
  Lock,
  Building2,
} from 'lucide-react';
import {
  useChildAwards,
  useQuizActivities,
  useParentChildren,
  updateParentChild,
  deleteParentChild,
  type QuizActivity,
  type ChildAward,
} from '@/lib/parent-dashboard';
import { OfficialCertificateModal, type CertificateData } from '@/components/ui/OfficialCertificateModal';
import { SchoolCombobox } from '@/components/parent/SchoolCombobox';

const avatars = ['👦', '👧', '🧒', '👶', '🧑', '🐱'];
const avatarColors = ['#5aa99b', '#3f8f9a', '#f5994a', '#e8574f', '#7a6be0', '#7fb8d6'];

export default function ParentChildProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const childId = params?.id || '';
  const { children, error: loadError, loading: childrenLoading, refetch } = useParentChildren();
  const { activities: quizzes, loading: quizzesLoading } = useQuizActivities(childId);
  const { awards, loading: awardsLoading } = useChildAwards(childId);

  const [activeCertPreview, setActiveCertPreview] = useState<CertificateData | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizActivity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Edit form state
  const child = children.find((item) => item.id === childId);
  const [editName, setEditName] = useState('');
  const [editIcNumber, setEditIcNumber] = useState('');
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const openEditModal = () => {
    if (!child) return;
    setEditName(child.name);
    setEditIcNumber(child.icNumber || '');
    setEditSchoolName(child.schoolName || '');
    setEditGrade(child.grade);
    setEditGender(child.gender || 'Tidak dinyatakan');
    setEditColor(child.color || avatarColors[0]);
    setEditAvatar(child.avatar || avatars[0]);
    setSaveError('');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;
    setSaveLoading(true);
    setSaveError('');
    try {
      await updateParentChild(child.id, {
        name: editName,
        icNumber: editIcNumber,
        schoolName: editSchoolName,
        grade: editGrade,
        gender: editGender,
        color: editColor,
        avatar: editAvatar,
      });
      refetch();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal mengemaskini profil anak.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!child) return;
    setSaveLoading(true);
    try {
      await deleteParentChild(child.id);
      router.push('/parent/children');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memadam profil anak.');
      setSaveLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const loginIdentifier = child?.icNumber || child?.email;
    if (!loginIdentifier) return;
    const textToCopy = `Akaun Log Masuk Exploria Pelajar:\nNo. ID / IC: ${loginIdentifier}\nKata Laluan: (Kata laluan yang didaftarkan)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  const handlePreviewAward = (award: ChildAward) => {
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

  const calcPercent = (score: number, total: number) => {
    if (!total || total <= 0) return 0;
    if (score > total && total === 10) return Math.min(Math.round(score), 100);
    return Math.min(Math.max(Math.round((score / total) * 100), 0), 100);
  };

  const percentages = quizzes.map((activity) => calcPercent(activity.score, activity.total));
  const average = percentages.length
    ? Math.min(Math.round(percentages.reduce((sum, score) => sum + score, 0) / percentages.length), 100)
    : 0;
  const highestScore = percentages.length ? Math.min(Math.max(...percentages), 100) : 0;

  if (loadError) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{loadError}</p>;
  if (childrenLoading) return <p className="p-4 text-sm text-[#6b7a88]">Memuatkan profil anak...</p>;
  if (!child) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#22303c]">Profil anak tidak ditemui</h1>
        <Link href="/parent/children" className="parent-blue-surface mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold">
          <ChevronLeft className="mr-1 h-4 w-4" /> Kembali ke senarai anak
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {/* Official Certificate Modal */}
      {activeCertPreview && (
        <OfficialCertificateModal
          certificate={activeCertPreview}
          onClose={() => setActiveCertPreview(null)}
        />
      )}

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
                <p className="text-xs text-slate-500">{selectedQuiz.time} · {selectedQuiz.minutes} minit</p>
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
                  <p className="text-2xl font-black text-[#0072bc]">{calcPercent(selectedQuiz.score, selectedQuiz.total)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">XP</p>
                  <p className="text-2xl font-black text-[#0072bc]">+{selectedQuiz.xpEarned || 50}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedQuiz.passed ? '✅ Percubaan kuiz lulus dengan cemerlang!' : 'Ulangkaji semula topik ini disyorkan.'}
              </p>
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

      {/* Edit Child Modal */}
      {isEditing && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsEditing(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#cfe2f3] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#1a2b49]">Kemaskini Profil Anak</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">Nama Penuh</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-[#0072bc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">Darjah / Tingkatan</label>
                  <input
                    type="text"
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-[#0072bc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">Jantina</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#0072bc]"
                  >
                    <option>Lelaki</option>
                    <option>Perempuan</option>
                    <option>Tidak dinyatakan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700">No. ID / IC Anak</label>
                <input
                  type="text"
                  value={editIcNumber}
                  onChange={(e) => setEditIcNumber(e.target.value)}
                  placeholder="Contoh: 150201-10-1234 atau ID12345"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-[#0072bc]"
                />
              </div>

              <div>
                <SchoolCombobox
                  value={editSchoolName}
                  onChange={setEditSchoolName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Pilih Avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`h-10 w-10 text-xl rounded-full grid place-items-center border-2 ${
                        editAvatar === av ? 'border-[#0072bc] bg-sky-50' : 'border-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Warna Latar</label>
                <div className="flex gap-2">
                  {avatarColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditColor(col)}
                      style={{ backgroundColor: col }}
                      className={`h-7 w-7 rounded-full border-2 ${
                        editColor === col ? 'border-slate-900 ring-2 ring-[#0072bc]' : 'border-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {saveError && <p className="text-xs font-bold text-red-600">{saveError}</p>}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="parent-blue-surface rounded-xl px-5 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition disabled:opacity-50"
                >
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsDeleting(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Padam Profil Anak?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Adakah anda pasti mahu memadam profil <strong>{child.name}</strong>? Tindakan ini tidak boleh dibatalkan.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsDeleting(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteChild}
                disabled={saveLoading}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {saveLoading ? 'Memadam...' : 'Ya, Padam Profil'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Top Navigation & Profile Header */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/parent/children" className="parent-blue-surface inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition">
          <ChevronLeft className="mr-1 h-4 w-4" /> Senarai Anak
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openEditModal}
            className="parent-blue-surface inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Kemaskini Profil</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleting(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
            title="Padam profil anak"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Padam</span>
          </button>
        </div>
      </div>

      {/* Child Card Header */}
      <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] sm:p-6">
        <h1 className="mb-4 text-xl font-bold text-[#1a2b49]">Profil Anak</h1>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] text-5xl"
            style={{ borderColor: child.color, backgroundColor: `${child.color}2a` }}
          >
            {child.image ? (
              <Image src={child.image} alt={`Gambar profil ${child.name}`} width={96} height={96} unoptimized className="h-full w-full object-cover" />
            ) : (
              child.avatar
            )}
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-2xl font-bold text-[#1a2b49]">{child.name}</h2>
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-[#6b7a88]">
              <span>{child.age} tahun</span>
              <span aria-hidden="true">·</span>
              <span>{child.gender}</span>
            </p>
            <p className="flex items-center gap-1 text-sm text-[#6b7a88]">
              <GraduationCap className="h-4 w-4 text-[#0072bc]" /> {child.grade} {child.icNumber ? `· No. ID/IC: ${child.icNumber}` : ''}
            </p>

            {child.schoolName && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-[#0072bc]" /> {child.schoolName}
              </p>
            )}

            {(child.icNumber || child.email) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#0072bc] font-bold bg-sky-50 px-3 py-1 rounded-md border border-sky-100">
                  <Lock className="h-3.5 w-3.5 text-[#0072bc]" />
                  <span>Log masuk: {child.icNumber || child.email}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="parent-blue-surface inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs hover:bg-[#005ea6] transition"
                  title="Salin No. IC dan Kata Laluan Anak"
                >
                  {copiedInfo ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedInfo ? 'Disalin!' : 'Salin Info Log Masuk'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Kuiz Dijawab', value: quizzes.length },
          { label: 'Purata Skor', value: `${average}%` },
          { label: 'Skor Tertinggi', value: `${highestScore}%` },
          { label: 'Anugerah', value: awards.length },
        ].map((stat) => (
          <div key={stat.label} className="parent-blue-surface rounded-[14px] p-3 text-center shadow-xs">
            <p className="text-xs text-white/85">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Quiz Activities List */}
      <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#1a2b49]">Aktiviti Kuiz</h2>
          <BookOpenCheck className="h-5 w-5 text-[#0072bc]" />
        </div>
        {quizzes.length === 0 ? (
          <p className="text-sm text-[#6b7a88]">Belum ada aktiviti kuiz untuk profil ini.</p>
        ) : (
          <div className="divide-y divide-[#edf1f4]">
            {[...quizzes].sort((a, b) => a.daysAgo - b.daysAgo).map((activity) => {
              const date = new Date();
              date.setDate(date.getDate() - activity.daysAgo);
              return (
                <div key={activity.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <h3 className="font-semibold text-[#1a2b49]">{activity.quizTitle}</h3>
                    <p className="mt-1 text-xs text-[#6b7a88]">
                      {date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })} · {activity.time} · {activity.minutes} minit
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="parent-blue-surface rounded-full px-3 py-1 text-xs font-bold">
                      Skor {activity.score}/{activity.total}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedQuiz(activity)}
                      className="inline-flex items-center rounded-lg border border-[#0072bc] bg-sky-50 px-2.5 py-1 text-xs font-bold text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition"
                    >
                      Perincian
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Link href="/parent/activity" className="mt-4 inline-flex min-h-10 items-center text-sm font-bold text-[#0072bc] hover:underline">
          Lihat semua aktiviti <ChevronLeft className="ml-1 h-4 w-4 rotate-180" />
        </Link>
      </section>

      {/* Awards Section */}
      <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#1a2b49]">Anugerah</h2>
          <Award className="h-5 w-5 text-[#0072bc]" />
        </div>
        {awards.length === 0 ? (
          <p className="text-sm text-[#6b7a88]">Belum ada anugerah.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {awards.map((award) => (
              <div key={award.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#e2f2fa] p-4 text-[#16305a] border border-[#d2e8f7]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">{award.icon}</span>
                  <div>
                    <p className="font-bold">{award.title}</p>
                    <p className="text-xs text-[#536b80]">{award.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewAward(award)}
                  className="parent-blue-surface shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition active:scale-95"
                >
                  <Printer className="h-3.5 w-3.5" /> Cetak Sijil
                </button>
              </div>
            ))}
          </div>
        )}
        <Link href="/parent/awards" className="parent-blue-surface mt-4 inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition">
          Lihat pilihan sijil fizikal dan medal <ChevronLeft className="ml-1 h-4 w-4 rotate-180" />
        </Link>
      </section>
    </div>
  );
}
