'use client';

import React, { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  FileText,
  Video,
  Lightbulb,
  Sparkles,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Layers,
} from 'lucide-react';

interface Material {
  id: string;
  subjectId: string;
  quizId?: string | null;
  chapterTitle?: string | null;
  title: string;
  type: string; // 'notes' | 'pdf' | 'video'
  contentUrl?: string | null;
  summary?: string | null;
  keyPoints?: string[] | null;
  formulaOrVocabulary?: string[] | null;
  examTip?: string | null;
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  difficulty?: string;
  isTournament?: boolean;
}

interface ChapterGroup {
  chapterTitle: string;
  materials: Material[];
  quizzes: Quiz[];
}

interface Subject {
  id: string;
  title: string;
  category: 'SK' | 'SMK';
  description?: string | null;
  createdAt: string;
}

export default function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<ChapterGroup[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormatType, setAddFormatType] = useState<'notes' | 'pdf' | 'video'>('notes');
  const [addFormData, setAddFormData] = useState<Record<string, any>>({});

  const [selectedNoteForView, setSelectedNoteForView] = useState<Material | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSubjectData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/subjects/${subjectId}`);
      const json = await res.json();
      if (json.success) {
        setSubject(json.subject);
        setChapters(json.chapters || []);
        setAllQuizzes(json.quizzes || []);
      } else {
        showToast(json.error || 'Gagal memuat data subjek', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId]);

  // Statistics
  const totalMaterials = useMemo(() => {
    return chapters.reduce((sum, ch) => sum + ch.materials.length, 0);
  }, [chapters]);

  const totalNotes = useMemo(() => {
    return chapters.reduce(
      (sum, ch) => sum + ch.materials.filter((m) => m.type === 'notes').length,
      0
    );
  }, [chapters]);

  const totalPdfsAndVideos = useMemo(() => {
    return chapters.reduce(
      (sum, ch) => sum + ch.materials.filter((m) => m.type === 'pdf' || m.type === 'video').length,
      0
    );
  }, [chapters]);

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    return chapters
      .map((ch) => {
        if (selectedChapterFilter !== 'Semua' && ch.chapterTitle !== selectedChapterFilter) {
          return null;
        }

        if (!searchQuery.trim()) return ch;

        const q = searchQuery.toLowerCase();
        const matchesChapter = ch.chapterTitle.toLowerCase().includes(q);
        const filteredMaterials = ch.materials.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.summary && m.summary.toLowerCase().includes(q)) ||
            (m.keyPoints && m.keyPoints.some((p) => p.toLowerCase().includes(q)))
        );
        const filteredQuizzes = ch.quizzes.filter((qz) => qz.title.toLowerCase().includes(q));

        if (matchesChapter || filteredMaterials.length > 0 || filteredQuizzes.length > 0) {
          return {
            ...ch,
            materials: matchesChapter ? ch.materials : filteredMaterials,
            quizzes: matchesChapter ? ch.quizzes : filteredQuizzes,
          };
        }
        return null;
      })
      .filter(Boolean) as ChapterGroup[];
  }, [chapters, selectedChapterFilter, searchQuery]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...addFormData,
        type: addFormatType,
      };

      const res = await fetch(`/api/staff/subjects/${subjectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Bahan berjaya ditambah ke subjek!');
        setIsAddModalOpen(false);
        setAddFormData({});
        await fetchSubjectData();
      } else {
        showToast(json.error || 'Gagal menyimpan bahan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setEditFormData({
      title: material.title,
      type: material.type,
      chapterTitle: material.chapterTitle || '',
      quizId: material.quizId || '',
      contentUrl: material.contentUrl || '',
      summary: material.summary || '',
      keyPoints: Array.isArray(material.keyPoints)
        ? material.keyPoints.join('\n')
        : (material.keyPoints || ''),
      formulaOrVocabulary: Array.isArray(material.formulaOrVocabulary)
        ? material.formulaOrVocabulary.join('\n')
        : (material.formulaOrVocabulary || ''),
      examTip: material.examTip || '',
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: editingMaterial.id,
          data: editFormData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Bahan berjaya dikemaskini!');
        setEditingMaterial(null);
        await fetchSubjectData();
      } else {
        showToast(json.error || 'Gagal mengemaskini bahan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingMaterial) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/staff/subjects/${subjectId}?materialId=${deletingMaterial.id}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (json.success) {
        showToast('Bahan berjaya dipadamkan.');
        setDeletingMaterial(null);
        await fetchSubjectData();
      } else {
        showToast(json.error || 'Gagal memadam bahan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Add for specific chapter
  const handleOpenAddForChapter = (chapterTitle: string) => {
    setAddFormData({ chapterTitle: chapterTitle.replace('📂 Rujukan Am (Tanpa Bab Khusus)', '') });
    setAddFormatType('notes');
    setIsAddModalOpen(true);
  };

  return (
    <div className="staff-admin-page" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.text}
        </div>
      )}

      {/* Top Breadcrumb & Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link
          href="/staff/sections/subjects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: '#e0f2fe',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Senarai Subjek
        </Link>

        <button
          onClick={fetchSubjectData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Segarkan Data
        </button>
      </div>

      {/* Subject Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)',
              }}
            >
              {subject?.title.includes('Sains') ? '🔬' : subject?.title.includes('Math') ? '➗' : '📖'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {subject ? subject.title : 'Memuatkan Subjek...'}
                </h1>
                {subject && (
                  <span
                    style={{
                      background: subject.category === 'SK' ? '#dbeafe' : '#fef3c7',
                      color: subject.category === 'SK' ? '#1d4ed8' : '#b45309',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {subject.category === 'SK' ? 'Sekolah Rendah (SK)' : 'Sekolah Menengah (SMK)'}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', maxWidth: '650px' }}>
                {subject?.description || 'Pengurusan kandungan bab, nota bertulis intipati dan bahan rujukan.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAddFormData({});
              setAddFormatType('notes');
              setIsAddModalOpen(true);
            }}
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
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={18} />
            Tambah Bahan / Nota Bab
          </button>
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
          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Bab Terasing
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {chapters.length} <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>bab</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              ✍️ Nota Bertulis
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
              {totalNotes} <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>modul nota</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              📄 Fail & Video
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
              {totalPdfsAndVideos} <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>rujukan</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              📝 Kuiz Subjek
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {allQuizzes.length} <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>kuiz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Filter Controls & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Chapter Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedChapterFilter('Semua')}
            style={{
              padding: '7px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              border: selectedChapterFilter === 'Semua' ? '1px solid #0284c7' : '1px solid #e2e8f0',
              background: selectedChapterFilter === 'Semua' ? '#0284c7' : '#fff',
              color: selectedChapterFilter === 'Semua' ? '#fff' : '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            Semua Bab ({chapters.length})
          </button>
          {chapters.map((ch) => (
            <button
              key={ch.chapterTitle}
              onClick={() => setSelectedChapterFilter(ch.chapterTitle)}
              style={{
                padding: '7px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                border: selectedChapterFilter === ch.chapterTitle ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: selectedChapterFilter === ch.chapterTitle ? '#0284c7' : '#fff',
                color: selectedChapterFilter === ch.chapterTitle ? '#fff' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {ch.chapterTitle} ({ch.materials.length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Cari bahan, nota atau istilah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Chapters & Materials Segregated List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 12px' }} />
          <div>Memuatkan bab dan bahan pembelajaran...</div>
        </div>
      ) : filteredChapters.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <FolderOpen size={48} style={{ color: '#94a3b8', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
            Belum ada bahan atau bab direkodkan
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
            Mulakan dengan menambah nota bertulis atau dokumen rujukan untuk subjek ini.
          </p>
          <button
            onClick={() => {
              setAddFormData({});
              setAddFormatType('notes');
              setIsAddModalOpen(true);
            }}
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
            Tambah Bab / Bahan Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredChapters.map((chapterGroup) => {
            const notesMaterials = chapterGroup.materials.filter((m) => m.type === 'notes');
            const fileMaterials = chapterGroup.materials.filter((m) => m.type === 'pdf');
            const videoMaterials = chapterGroup.materials.filter((m) => m.type === 'video');

            return (
              <div
                key={chapterGroup.chapterTitle}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
              >
                {/* Chapter Group Header */}
                <div
                  style={{
                    padding: '18px 24px',
                    background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      📑
                    </div>
                    <div>
                      <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {chapterGroup.chapterTitle}
                      </h2>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {chapterGroup.materials.length} bahan pembelajaran · {chapterGroup.quizzes.length} kuiz dipautkan
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAddForChapter(chapterGroup.chapterTitle)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Plus size={14} />
                    Tambah Bahan ke Bab Ini
                  </button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* 1. NOTA BAB (TULIS SENDIRI) */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#334155',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <span>✍️</span> Nota Bab (Tulis Sendiri)
                    </div>

                    {notesMaterials.length === 0 ? (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          Belum ada nota intipati/glosari bertulis untuk bab ini.
                        </div>
                        <button
                          onClick={() => handleOpenAddForChapter(chapterGroup.chapterTitle)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={13} /> Tulis Nota Bab Ini
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                        {notesMaterials.map((note) => (
                          <div
                            key={note.id}
                            style={{
                              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                              border: '1px solid #bbf7d0',
                              borderRadius: '12px',
                              padding: '18px',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px' }}>📝</span>
                                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#166534', margin: 0 }}>
                                    {note.title}
                                  </h3>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      borderRadius: '999px',
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      fontWeight: 700,
                                    }}
                                  >
                                    Nota Lengkap Pelajar
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => setSelectedNoteForView(note)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    background: '#0284c7',
                                    color: '#fff',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  👁️ Lihat Nota Penuh
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(note)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                  title="Edit Nota"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeletingMaterial(note)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                  title="Padam Nota"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Snippet preview of the 4 sections */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginTop: '12px' }}>
                              {/* 1. Ringkasan */}
                              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <span>📖</span> Ringkasan Konsep
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                                  {note.summary ? (note.summary.length > 90 ? `${note.summary.slice(0, 90)}...` : note.summary) : 'Tiada teks ringkasan.'}
                                </div>
                              </div>

                              {/* 2. Fakta & Konsep */}
                              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <span>💡</span> Fakta Wajib Tahu
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569' }}>
                                  {Array.isArray(note.keyPoints) && note.keyPoints.length > 0 ? (
                                    <span>{note.keyPoints.length} poin utama disediakan</span>
                                  ) : (
                                    'Tiada senarai fakta.'
                                  )}
                                </div>
                              </div>

                              {/* 3. Glosari */}
                              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <span>✨</span> Glosari & Formula
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569' }}>
                                  {Array.isArray(note.formulaOrVocabulary) && note.formulaOrVocabulary.length > 0 ? (
                                    <span>{note.formulaOrVocabulary.length} istilah / formula berdaftar</span>
                                  ) : (
                                    'Tiada glosari.'
                                  )}
                                </div>
                              </div>

                              {/* 4. Tip Peperiksaan */}
                              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <span>⭐</span> Tip Skor Kuiz
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                                  {note.examTip ? (note.examTip.length > 60 ? `${note.examTip.slice(0, 60)}...` : note.examTip) : 'Tiada tip skor.'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. DOKUMEN PDF & VIDEO */}
                  {(fileMaterials.length > 0 || videoMaterials.length > 0) && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#334155',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <span>📁</span> Dokumen & Video Rujukan
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                        {fileMaterials.map((file) => (
                          <div
                            key={file.id}
                            style={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>📄</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{file.title}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Dokumen Fail PDF</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {file.contentUrl && (
                                <a
                                  href={file.contentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#f1f5f9',
                                    color: '#0284c7',
                                    textDecoration: 'none',
                                    fontSize: '12px',
                                  }}
                                  title="Buka Pautan"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEdit(file)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeletingMaterial(file)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {videoMaterials.map((vid) => (
                          <div
                            key={vid.id}
                            style={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>🎥</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{vid.title}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Video Pembelajaran</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {vid.contentUrl && (
                                <a
                                  href={vid.contentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#f3e8ff',
                                    color: '#7e22ce',
                                    textDecoration: 'none',
                                    fontSize: '12px',
                                  }}
                                  title="Tonton Video"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEdit(vid)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeletingMaterial(vid)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. KUIZ BAB */}
                  {chapterGroup.quizzes.length > 0 && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#334155',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <span>📝</span> Kuiz Berkaitan Bab Ini
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {chapterGroup.quizzes.map((qz) => (
                          <div
                            key={qz.id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                            }}
                          >
                            <span>{qz.isTournament ? '🏆' : '🎯'}</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{qz.title}</span>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#e2e8f0',
                                color: '#475569',
                              }}
                            >
                              {qz.difficulty || 'SEDERHANA'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL 1: TAMBAH BAHAN / NOTA BAB ───────────────────────────── */}
      {isAddModalOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <Plus size={18} style={{ color: '#0284c7' }} />
                Tambah Bahan & Rujukan: {subject?.title}
              </h3>
              <button className="staff-modal-close" onClick={() => setIsAddModalOpen(false)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="staff-modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
                {/* Format Tabs */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Pilih Format Bahan
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setAddFormatType('notes')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: addFormatType === 'notes' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: addFormatType === 'notes' ? '#f0f9ff' : '#fff',
                        fontWeight: 600,
                        color: addFormatType === 'notes' ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ✍️ Nota Bab (Tulis Sendiri)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddFormatType('pdf')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: addFormatType === 'pdf' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: addFormatType === 'pdf' ? '#f0f9ff' : '#fff',
                        fontWeight: 600,
                        color: addFormatType === 'pdf' ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      📄 Fail PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddFormatType('video')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: addFormatType === 'video' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: addFormatType === 'video' ? '#f0f9ff' : '#fff',
                        fontWeight: 600,
                        color: addFormatType === 'video' ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🎥 Pautan Video
                    </button>
                  </div>
                </div>

                {/* Chapter & Title Inputs */}
                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Nama Bab / Topik</label>
                    <input
                      required
                      placeholder="Contoh: Bab 1: Sistem Suria & Planet"
                      value={addFormData.chapterTitle || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, chapterTitle: e.target.value })}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label>Pautkan ke Kuiz (Pilihan)</label>
                    <select
                      value={addFormData.quizId || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, quizId: e.target.value })}
                    >
                      <option value="">-- Bebas (Tiada Kuiz Khusus) --</option>
                      {allQuizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.isTournament ? '🏆 ' : '📝 '}
                          {q.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Tajuk Bahan / Modul Nota</label>
                  <input
                    required
                    placeholder="Contoh: Nota Ringkas: Pengenalan Sistem Suria"
                    value={addFormData.title || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  />
                </div>

                {/* Specific Fields per Format */}
                {addFormatType === 'notes' ? (
                  <>
                    {/* 1. Ringkasan Topik */}
                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📖</span>
                        <strong>1. Ringkasan & Intipati Utama Topik</strong>
                      </label>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                        Konsep teras yang perlu pelajar fahami terlebih dahulu.
                      </p>
                      <textarea
                        required
                        rows={3}
                        placeholder="Contoh: Sistem Suria kita terdiri daripada Matahari sebagai pusat tarikan graviti dan 8 buah planet yang beredar mengelilinginya..."
                        value={addFormData.summary || ''}
                        onChange={(e) => setAddFormData({ ...addFormData, summary: e.target.value })}
                      />
                    </div>

                    {/* 2. Fakta & Konsep Penting */}
                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💡</span>
                        <strong>2. Fakta & Konsep Penting Wajib Tahu</strong>
                      </label>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                        Masukkan 1 poin fakta setiap baris baru.
                      </p>
                      <textarea
                        required
                        rows={4}
                        placeholder={"Matahari adalah bintang yang mengeluarkan haba dan cahaya sendiri.\nUrutan 8 Planet: Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun.\nBumi adalah satu-satunya planet yang diketahui mempunyai hidupan."}
                        value={addFormData.keyPoints || ''}
                        onChange={(e) => setAddFormData({ ...addFormData, keyPoints: e.target.value })}
                      />
                    </div>

                    {/* 3. Glosari Istilah & Formula */}
                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✨</span>
                        <strong>3. Glosari Istilah & Formula Teras</strong>
                      </label>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                        Format: <code>Istilah : Definisi</code> (1 istilah setiap baris).
                      </p>
                      <textarea
                        rows={3}
                        placeholder={"Orbit : Laluan peredaran planet mengelilingi matahari.\nGraviti : Daya tarikan semulajadi antara objek berjisim.\nAtmosfera : Lapisan gas yang menyelimuti sesebuah planet."}
                        value={addFormData.formulaOrVocabulary || ''}
                        onChange={(e) => setAddFormData({ ...addFormData, formulaOrVocabulary: e.target.value })}
                      />
                    </div>

                    {/* 4. Tip Rahsia Menjawab */}
                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⭐</span>
                        <strong>4. Tip Rahsia Menjawab & Skor Kuiz</strong>
                      </label>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                        Tip mengingat, formula akronim atau teknik skor peperiksaan.
                      </p>
                      <textarea
                        rows={2}
                        placeholder={'Tip Mengingat: Gunakan akronim "U-Z-B-M-M-Z-U-N" (Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun)!'}
                        value={addFormData.examTip || ''}
                        onChange={(e) => setAddFormData({ ...addFormData, examTip: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="staff-form-group">
                    <label>Pautan URL Fail / Video</label>
                    <input
                      required
                      placeholder="https://..."
                      value={addFormData.contentUrl || ''}
                      onChange={(e) => setAddFormData({ ...addFormData, contentUrl: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  className="staff-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan ke Bab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: LIHAT NOTA PENUH (RICH PREVIEW) ───────────────────── */}
      {selectedNoteForView && (
        <div className="staff-modal-overlay" onClick={() => setSelectedNoteForView(null)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '780px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <span>📝</span>
                {selectedNoteForView.title}
              </h3>
              <button className="staff-modal-close" onClick={() => setSelectedNoteForView(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="staff-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Bab:</strong> {selectedNoteForView.chapterTitle || 'Umum'} · <strong>Subjek:</strong> {subject?.title}
              </div>

              {/* 1. Ringkasan */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#2563eb',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    📖
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Ringkasan & Intipati Utama Topik
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Konsep teras yang perlu anda fahami</span>
                  </div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#334155',
                  }}
                >
                  {selectedNoteForView.summary || 'Tiada ringkasan direkodkan.'}
                </div>
              </div>

              {/* 2. Fakta & Konsep */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#eab308',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    💡
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Fakta & Konsep Penting Wajib Tahu
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Poin penting yang perlu diingati</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {Array.isArray(selectedNoteForView.keyPoints) && selectedNoteForView.keyPoints.length > 0 ? (
                    selectedNoteForView.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px 16px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginBottom: '6px',
                          }}
                        >
                          FAKTA #{idx + 1}
                        </span>
                        <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>{point}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Tiada senarai fakta.</div>
                  )}
                </div>
              </div>

              {/* 3. Glosari & Formula */}
              {Array.isArray(selectedNoteForView.formulaOrVocabulary) &&
                selectedNoteForView.formulaOrVocabulary.length > 0 && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#0284c7',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                        }}
                      >
                        ✨
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          Glosari Istilah & Formula Teras
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Kamus ringkas istilah soalan</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {selectedNoteForView.formulaOrVocabulary.map((item, idx) => {
                        const parts = item.split(':');
                        const term = parts[0]?.trim();
                        const def = parts.slice(1).join(':').trim() || term;
                        return (
                          <div
                            key={idx}
                            style={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '12px 14px',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '999px',
                                marginBottom: '6px',
                              }}
                            >
                              ✨ {term}
                            </span>
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{def}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* 4. Tip Peperiksaan */}
              {selectedNoteForView.examTip && (
                <div
                  style={{
                    background: '#fefce8',
                    border: '1px solid #fef08a',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#eab308',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    ⭐
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#713f12' }}>
                      Tip Rahsia Menjawab & Skor Kuiz
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#854d0e', lineHeight: 1.5 }}>
                      {selectedNoteForView.examTip}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
              <button
                className="staff-btn-secondary"
                onClick={() => setSelectedNoteForView(null)}
                type="button"
              >
                Tutup
              </button>
              <button
                className="staff-btn-primary"
                onClick={() => {
                  const toEdit = selectedNoteForView;
                  setSelectedNoteForView(null);
                  handleOpenEdit(toEdit);
                }}
                type="button"
              >
                <Pencil size={14} /> Edit Nota Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT BAHAN / NOTA ─────────────────────────────────── */}
      {editingMaterial && (
        <div className="staff-modal-overlay" onClick={() => setEditingMaterial(null)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <Pencil size={18} style={{ color: '#db2777' }} />
                Edit Bahan: {editingMaterial.title}
              </h3>
              <button className="staff-modal-close" onClick={() => setEditingMaterial(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="staff-modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Nama Bab / Topik</label>
                    <input
                      required
                      placeholder="Bab 1: ..."
                      value={editFormData.chapterTitle || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, chapterTitle: e.target.value })}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label>Jenis Format Bahan</label>
                    <select
                      value={editFormData.type || 'notes'}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    >
                      <option value="notes">✍️ Nota Bab (Tulis Sendiri)</option>
                      <option value="pdf">📄 Dokumen PDF</option>
                      <option value="video">🎥 Pautan Video</option>
                    </select>
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Tajuk Bahan</label>
                  <input
                    required
                    value={editFormData.title || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  />
                </div>

                {editFormData.type === 'notes' ? (
                  <>
                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📖</span>
                        <strong>1. Ringkasan & Intipati Utama Topik</strong>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={editFormData.summary || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💡</span>
                        <strong>2. Fakta & Konsep Penting Wajib Tahu</strong>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="1 poin setiap baris"
                        value={editFormData.keyPoints || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, keyPoints: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✨</span>
                        <strong>3. Glosari Istilah & Formula Teras</strong>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Istilah : Definisi (1 per baris)"
                        value={editFormData.formulaOrVocabulary || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, formulaOrVocabulary: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⭐</span>
                        <strong>4. Tip Rahsia Menjawab & Skor Kuiz</strong>
                      </label>
                      <textarea
                        rows={2}
                        value={editFormData.examTip || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, examTip: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="staff-form-group">
                    <label>Pautan URL Fail / Video</label>
                    <input
                      required
                      value={editFormData.contentUrl || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, contentUrl: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  className="staff-btn-secondary"
                  onClick={() => setEditingMaterial(null)}
                  type="button"
                >
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengemaskini...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: PADAM BAHAN ───────────────────────────────────────── */}
      {deletingMaterial && (
        <div className="staff-modal-overlay" onClick={() => setDeletingMaterial(null)}>
          <div className="staff-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3 style={{ color: '#dc2626' }}>
                <Trash2 size={18} /> Sahkan Pemadaman Bahan
              </h3>
              <button className="staff-modal-close" onClick={() => setDeletingMaterial(null)} type="button">
                <X size={16} />
              </button>
            </div>
            <div className="staff-modal-body">
              <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: 1.5 }}>
                Adakah anda pasti ingin memadam bahan <strong>"{deletingMaterial.title}"</strong>?
              </p>
              <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '12px' }}>
                Tindakan ini tidak boleh dibatalkan dan bahan akan dikeluarkan dari paparan pelajar.
              </p>
            </div>
            <div className="staff-modal-footer">
              <button
                className="staff-btn-secondary"
                onClick={() => setDeletingMaterial(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="staff-btn-danger"
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Memadam...' : 'Ya, Padam Bahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
