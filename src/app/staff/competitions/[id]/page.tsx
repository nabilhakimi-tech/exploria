'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Clock,
  HelpCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import '@/app/staff/admin.css';

interface Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  createdAt?: string;
}

interface Competition {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  difficulty?: string;
  emoji?: string;
  durationMinutes?: number;
  isActive: boolean;
  isTournament?: boolean;
  startTime?: string;
  endTime?: string;
  lastOpenedAt?: string;
  createdAt?: string;
}

interface Subject {
  id: string;
  title: string;
  category: string;
}

export default function StaffCompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEditCompetitionOpen, setIsEditCompetitionOpen] = useState(false);
  const [editCompFormData, setEditCompFormData] = useState<Record<string, any>>({});

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [addQuestionFormData, setAddQuestionFormData] = useState({
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswer: 'A',
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestionFormData, setEditQuestionFormData] = useState({
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswer: 'A',
  });

  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/competitions/${competitionId}`);
      const json = await res.json();
      if (json.success) {
        setCompetition(json.competition);
        setSubject(json.subject);
        setQuestions(json.questions || []);
        setAllSubjects(json.subjects || []);
        setAttemptsCount(json.attemptsCount || 0);
      } else {
        showToast(json.error || 'Gagal memuat data pertandingan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (competitionId) {
      fetchCompetitionData();
    }
  }, [competitionId]);

  // Open Edit Competition Modal
  const handleOpenEditCompetition = () => {
    if (!competition) return;
    setEditCompFormData({
      title: competition.title,
      description: competition.description || '',
      subjectId: competition.subjectId,
      difficulty: competition.difficulty || 'SEDERHANA',
      durationMinutes: competition.durationMinutes || 10,
      emoji: competition.emoji || '🏆',
      isActive: competition.isActive,
    });
    setIsEditCompetitionOpen(true);
  };

  // Submit Edit Competition
  const handleEditCompetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/competitions/${competitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: editCompFormData }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Maklumat pertandingan berjaya dikemaskini!');
        setIsEditCompetitionOpen(false);
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal mengemaskini maklumat pertandingan', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Competition Active Status
  const handleToggleStatus = async () => {
    if (!competition) return;
    try {
      const nextActive = !competition.isActive;
      const res = await fetch(`/api/staff/competitions/${competitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { isActive: nextActive } }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(nextActive ? 'Sesi pertandingan kini dibuka!' : 'Sesi pertandingan telah ditutup.');
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal menukar status sesi', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    }
  };

  // Reset Student Attempts
  const handleResetAttempts = async () => {
    if (!confirm('Adakah anda pasti ingin membuka semula sesi dan membenarkan pelajar menduduki semula ujian ini?')) {
      return;
    }
    try {
      const res = await fetch(`/api/staff/competitions/${competitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { isActive: true, resetAttempts: true } }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Kitaran baharu dibuka! Percubaan pelajar telah diset semula.');
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal reset sesi', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    }
  };

  // Open Add Question Modal
  const handleOpenAddQuestion = () => {
    setAddQuestionFormData({
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctAnswer: 'A',
    });
    setIsAddQuestionOpen(true);
  };

  // Submit Add Question
  const handleAddQuestionSubmit = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    const opts = [
      addQuestionFormData.optA.trim(),
      addQuestionFormData.optB.trim(),
      addQuestionFormData.optC.trim(),
      addQuestionFormData.optD.trim(),
    ].filter(Boolean);

    if (opts.length < 2) {
      showToast('Sila masukkan sekurang-kurangnya 2 pilihan jawapan', 'error');
      return;
    }

    let correctText = addQuestionFormData.optA.trim();
    if (addQuestionFormData.correctAnswer === 'B') correctText = addQuestionFormData.optB.trim();
    else if (addQuestionFormData.correctAnswer === 'C') correctText = addQuestionFormData.optC.trim();
    else if (addQuestionFormData.correctAnswer === 'D') correctText = addQuestionFormData.optD.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/competitions/${competitionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: addQuestionFormData.questionText.trim(),
          options: opts,
          correctAnswer: correctText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Soalan berjaya ditambah ke pertandingan!');
        if (keepOpen) {
          setAddQuestionFormData({
            questionText: '',
            optA: '',
            optB: '',
            optC: '',
            optD: '',
            correctAnswer: 'A',
          });
        } else {
          setIsAddQuestionOpen(false);
        }
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal menambah soalan', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: Question) => {
    const opts = Array.isArray(q.options) ? q.options : [];
    let selectedAnsKey = 'A';
    if (opts[1] && opts[1] === q.correctAnswer) selectedAnsKey = 'B';
    else if (opts[2] && opts[2] === q.correctAnswer) selectedAnsKey = 'C';
    else if (opts[3] && opts[3] === q.correctAnswer) selectedAnsKey = 'D';

    setEditQuestionFormData({
      questionText: q.questionText,
      optA: opts[0] || '',
      optB: opts[1] || '',
      optC: opts[2] || '',
      optD: opts[3] || '',
      correctAnswer: selectedAnsKey,
    });
    setEditingQuestion(q);
  };

  // Submit Edit Question
  const handleEditQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const opts = [
      editQuestionFormData.optA.trim(),
      editQuestionFormData.optB.trim(),
      editQuestionFormData.optC.trim(),
      editQuestionFormData.optD.trim(),
    ].filter(Boolean);

    if (opts.length < 2) {
      showToast('Sila masukkan sekurang-kurangnya 2 pilihan jawapan', 'error');
      return;
    }

    let correctText = editQuestionFormData.optA.trim();
    if (editQuestionFormData.correctAnswer === 'B') correctText = editQuestionFormData.optB.trim();
    else if (editQuestionFormData.correctAnswer === 'C') correctText = editQuestionFormData.optC.trim();
    else if (editQuestionFormData.correctAnswer === 'D') correctText = editQuestionFormData.optD.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/competitions/${competitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          data: {
            questionText: editQuestionFormData.questionText.trim(),
            options: opts,
            correctAnswer: correctText,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Soalan berjaya dikemaskini!');
        setEditingQuestion(null);
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal mengemaskini soalan', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Question
  const handleDeleteQuestionConfirm = async () => {
    if (!deletingQuestion) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/staff/competitions/${competitionId}?questionId=${deletingQuestion.id}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (json.success) {
        showToast('Soalan telah dipadam');
        setDeletingQuestion(null);
        fetchCompetitionData();
      } else {
        showToast(json.error || 'Gagal memadam soalan', 'error');
      }
    } catch {
      showToast('Ralat sambungan rangkaian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const sq = searchQuery.toLowerCase();
    const inText = q.questionText.toLowerCase().includes(sq);
    const inOptions = Array.isArray(q.options) && q.options.some((opt) => opt.toLowerCase().includes(sq));
    return inText || inOptions;
  });

  return (
    <div className="staff-admin-body" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 32px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.text}
        </div>
      )}

      {/* Top Header / Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/staff/sections/competitions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Pertandingan
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Urus Pertandingan & Bank Soalan
          </span>
        </div>

        <button
          onClick={fetchCompetitionData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Segarkan
        </button>
      </div>

      {/* Main Hero Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', maxWidth: '800px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                flexShrink: 0,
              }}
            >
              {competition?.emoji || '🏆'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {competition ? competition.title : 'Memuatkan Pertandingan...'}
                </h1>
                {competition && (
                  <span
                    style={{
                      background: competition.isActive ? '#ecfdf5' : '#f1f5f9',
                      color: competition.isActive ? '#059669' : '#64748b',
                      border: `1px solid ${competition.isActive ? '#a7f3d0' : '#cbd5e1'}`,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {competition.isActive ? 'Sedang Berlangsung' : 'Dijadualkan / Tutup'}
                  </span>
                )}
                {subject && (
                  <span
                    style={{
                      background: '#e0f2fe',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {subject.title} ({subject.category})
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                {competition?.description || 'Pertandingan kuiz rasmi Exploria yang menawarkan sijil dan pingat pengiktirafan.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleOpenEditCompetition}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Pencil size={16} style={{ color: '#db2777' }} />
              Edit Rekod Pertandingan
            </button>

            <button
              onClick={handleOpenAddQuestion}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={18} />
              Tambah Soalan Baharu
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Bilangan Soalan
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CircleHelp size={20} style={{ color: '#0284c7' }} />
              {questions.length} soalan
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Tempoh Masa Ujian
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: '#f59e0b' }} />
              {competition?.durationMinutes || 10} minit
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Tahap Kesukaran
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: '#ec4899' }} />
              {competition?.difficulty || 'SEDERHANA'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Penyertaan Pelajar
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: '#10b981' }} />
              {attemptsCount} percubaan
            </div>
          </div>
        </div>

        {/* Quick Sesi Controls */}
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#166534' }}>
            <span>⚡</span>
            <span>
              Status Sesi Semasa: <strong>{competition?.isActive ? 'DIBUKA (Pelajar boleh jawab)' : 'DITUTUP (Menunggu admin buka)'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleToggleStatus}
              type="button"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: competition?.isActive ? '#fee2e2' : '#dcfce7',
                color: competition?.isActive ? '#dc2626' : '#15803d',
                border: `1px solid ${competition?.isActive ? '#fca5a5' : '#86efac'}`,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {competition?.isActive ? 'Tutup Sesi Sekarang' : 'Buka / Aktifkan Sesi'}
            </button>

            <button
              onClick={handleResetAttempts}
              type="button"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#059669',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Buka Semula (Reset Percubaan Pelajar)
            </button>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div style={{ marginBottom: '40px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Bank Soalan Pertandingan ({questions.length})
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
              Soalan-soalan yang akan dipaparkan secara rawak kepada pelajar semasa pertandingan berlangsung.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Cari teks soalan atau jawapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                background: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* Question Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Memuatkan bank soalan dari database...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#64748b',
              }}
            >
              <HelpCircle size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
              {searchQuery ? 'Tiada soalan yang sepadan dengan carian' : 'Belum Ada Soalan Dimasukkan'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
              {searchQuery
                ? 'Cuba gunakan kata kunci lain untuk mencari soalan.'
                : 'Tambah soalan kuiz aneka pilihan (MCQ) ke dalam pertandingan ini supaya pelajar boleh mula bertanding.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAddQuestion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Tambah Soalan Pertama Sekarang
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredQuestions.map((q, idx) => {
              const opts = Array.isArray(q.options) ? q.options : [];
              return (
                <div
                  key={q.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px -1px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Question Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '14px',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        Soalan {idx + 1}
                      </span>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.5 }}>
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Question Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Pencil size={13} style={{ color: '#db2777' }} />
                        Edit Soalan
                      </button>

                      <button
                        onClick={() => setDeletingQuestion(q)}
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        title="Padam Soalan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '10px',
                      marginTop: '12px',
                    }}
                  >
                    {opts.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx] || `${oIdx + 1}`;
                      const isCorrect = opt.trim() === q.correctAnswer?.trim();

                      return (
                        <div
                          key={oIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isCorrect ? '#f0fdf4' : '#f8fafc',
                            border: `1.5px solid ${isCorrect ? '#22c55e' : '#e2e8f0'}`,
                            fontSize: '13px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                background: isCorrect ? '#22c55e' : '#e2e8f0',
                                color: isCorrect ? '#ffffff' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {letter}
                            </span>
                            <span style={{ fontWeight: isCorrect ? 700 : 500, color: isCorrect ? '#15803d' : '#334155' }}>
                              {opt}
                            </span>
                          </div>

                          {isCorrect && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#dcfce7',
                                color: '#166534',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={12} />
                              Jawapan Tepat
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL 1: EDIT REKOD PERTANDINGAN ───────────────────────────── */}
      {isEditCompetitionOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsEditCompetitionOpen(false)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '640px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <Pencil size={18} style={{ color: '#db2777' }} />
                Edit Maklumat Pertandingan
              </h3>
              <button
                className="staff-modal-close"
                onClick={() => setIsEditCompetitionOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleEditCompetitionSubmit}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              <div
                className="staff-modal-body"
                style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}
              >
                <div className="staff-form-group">
                  <label>Tajuk Pertandingan Kuiz</label>
                  <input
                    type="text"
                    required
                    value={editCompFormData.title || ''}
                    onChange={(e) => setEditCompFormData({ ...editCompFormData, title: e.target.value })}
                    placeholder="cth: Cabaran Sains & Angkasa Lepas 2026"
                  />
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Subjek Sasaran</label>
                    <select
                      value={editCompFormData.subjectId || ''}
                      onChange={(e) => setEditCompFormData({ ...editCompFormData, subjectId: e.target.value })}
                    >
                      {allSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="staff-form-group">
                    <label>Ikon / Emoji Pertandingan</label>
                    <input
                      type="text"
                      value={editCompFormData.emoji || '🏆'}
                      onChange={(e) => setEditCompFormData({ ...editCompFormData, emoji: e.target.value })}
                      placeholder="🏆, 🚀, 🧮, 🔬"
                    />
                  </div>
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Tahap Kesukaran</label>
                    <select
                      value={editCompFormData.difficulty || 'SEDERHANA'}
                      onChange={(e) => setEditCompFormData({ ...editCompFormData, difficulty: e.target.value })}
                    >
                      <option value="MUDAH">MUDAH</option>
                      <option value="SEDERHANA">SEDERHANA</option>
                      <option value="SUKAR">SUKAR</option>
                      <option value="PAKAR">PAKAR</option>
                    </select>
                  </div>

                  <div className="staff-form-group">
                    <label>Tempoh Masa (Minit)</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={editCompFormData.durationMinutes || 10}
                      onChange={(e) => setEditCompFormData({ ...editCompFormData, durationMinutes: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Penerangan / Maklumat Pertandingan</label>
                  <textarea
                    rows={3}
                    value={editCompFormData.description || ''}
                    onChange={(e) => setEditCompFormData({ ...editCompFormData, description: e.target.value })}
                    placeholder="Penerangan ringkas tentang format, topik yang dinilai, dan sijil..."
                  />
                </div>

                <div className="staff-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editCompFormData.isActive)}
                      onChange={(e) => setEditCompFormData({ ...editCompFormData, isActive: e.target.checked })}
                    />
                    <span>Sesi Pertandingan Dibuka (Pelajar boleh mengambil ujian ini sekarang)</span>
                  </label>
                </div>
              </div>

              <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setIsEditCompetitionOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="staff-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: TAMBAH SOALAN BAHARU ──────────────────────────────── */}
      {isAddQuestionOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsAddQuestionOpen(false)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '620px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <CircleHelp size={18} style={{ color: '#0284c7' }} />
                Tambah Soalan Baharu: {competition?.title}
              </h3>
              <button
                className="staff-modal-close"
                onClick={() => setIsAddQuestionOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => handleAddQuestionSubmit(e, false)}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              <div
                className="staff-modal-body"
                style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}
              >
                <div className="staff-form-group">
                  <label>Teks Soalan</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Masukkan soalan kuiz... cth: Planet manakah yang paling hampir dengan Matahari?"
                    value={addQuestionFormData.questionText}
                    onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, questionText: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="staff-form-group">
                    <label>Pilihan A</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Utarid"
                      value={addQuestionFormData.optA}
                      onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, optA: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan B</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Zuhrah"
                      value={addQuestionFormData.optB}
                      onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, optB: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan C</label>
                    <input
                      type="text"
                      placeholder="cth: Bumi"
                      value={addQuestionFormData.optC}
                      onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, optC: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan D</label>
                    <input
                      type="text"
                      placeholder="cth: Marikh"
                      value={addQuestionFormData.optD}
                      onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, optD: e.target.value })}
                    />
                  </div>
                </div>

                <div className="staff-form-group" style={{ marginTop: '8px' }}>
                  <label>Pilihan Jawapan Tepat</label>
                  <select
                    value={addQuestionFormData.correctAnswer}
                    onChange={(e) => setAddQuestionFormData({ ...addQuestionFormData, correctAnswer: e.target.value })}
                  >
                    <option value="A">Pilihan A: {addQuestionFormData.optA || '(belum diisi)'}</option>
                    <option value="B">Pilihan B: {addQuestionFormData.optB || '(belum diisi)'}</option>
                    <option value="C">Pilihan C: {addQuestionFormData.optC || '(belum diisi)'}</option>
                    <option value="D">Pilihan D: {addQuestionFormData.optD || '(belum diisi)'}</option>
                  </select>
                </div>
              </div>

              <div
                className="staff-modal-footer"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}
              >
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setIsAddQuestionOpen(false)}
                >
                  Batal
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="staff-btn-secondary"
                    disabled={isSubmitting || !addQuestionFormData.questionText.trim()}
                    onClick={(e) => handleAddQuestionSubmit(e, true)}
                  >
                    Simpan & Tambah Lagi
                  </button>
                  <button type="submit" className="staff-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Soalan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT SOALAN ───────────────────────────────────────── */}
      {editingQuestion && (
        <div className="staff-modal-overlay" onClick={() => setEditingQuestion(null)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '620px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <Pencil size={18} style={{ color: '#db2777' }} />
                Edit Soalan
              </h3>
              <button
                className="staff-modal-close"
                onClick={() => setEditingQuestion(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleEditQuestionSubmit}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              <div
                className="staff-modal-body"
                style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}
              >
                <div className="staff-form-group">
                  <label>Teks Soalan</label>
                  <textarea
                    required
                    rows={3}
                    value={editQuestionFormData.questionText}
                    onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, questionText: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="staff-form-group">
                    <label>Pilihan A</label>
                    <input
                      type="text"
                      required
                      value={editQuestionFormData.optA}
                      onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, optA: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan B</label>
                    <input
                      type="text"
                      required
                      value={editQuestionFormData.optB}
                      onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, optB: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan C</label>
                    <input
                      type="text"
                      value={editQuestionFormData.optC}
                      onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, optC: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan D</label>
                    <input
                      type="text"
                      value={editQuestionFormData.optD}
                      onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, optD: e.target.value })}
                    />
                  </div>
                </div>

                <div className="staff-form-group" style={{ marginTop: '8px' }}>
                  <label>Pilihan Jawapan Tepat</label>
                  <select
                    value={editQuestionFormData.correctAnswer}
                    onChange={(e) => setEditQuestionFormData({ ...editQuestionFormData, correctAnswer: e.target.value })}
                  >
                    <option value="A">Pilihan A: {editQuestionFormData.optA || '(A)'}</option>
                    <option value="B">Pilihan B: {editQuestionFormData.optB || '(B)'}</option>
                    <option value="C">Pilihan C: {editQuestionFormData.optC || '(C)'}</option>
                    <option value="D">Pilihan D: {editQuestionFormData.optD || '(D)'}</option>
                  </select>
                </div>
              </div>

              <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setEditingQuestion(null)}
                >
                  Batal
                </button>
                <button type="submit" className="staff-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengemaskini...' : 'Simpan Kemaskini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: PADAM SOALAN PENGESAHAN ───────────────────────────── */}
      {deletingQuestion && (
        <div className="staff-modal-overlay" style={{ zIndex: 1100 }} onClick={() => !isSubmitting && setDeletingQuestion(null)}>
          <div className="staff-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ color: '#ef4444' }}>
                <Trash2 size={18} /> Padam Soalan Ini?
              </h3>
              <button
                className="staff-modal-close"
                onClick={() => setDeletingQuestion(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            <div className="staff-modal-body" style={{ padding: '12px 24px' }}>
              <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>
                Adakah anda pasti ingin memadam soalan ini daripada pertandingan?
              </p>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginTop: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                {deletingQuestion.questionText}
              </div>
            </div>
            <div
              className="staff-modal-footer"
              style={{ borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
            >
              <button
                className="staff-btn-secondary"
                onClick={() => setDeletingQuestion(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="staff-btn-danger"
                onClick={handleDeleteQuestionConfirm}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Memadam...' : 'Ya, Padam Soalan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
