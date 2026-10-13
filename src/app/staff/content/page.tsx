'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Book, FileQuestion, Trophy, X, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Subject = { id: string; title: string; category: string; materials: number; quizzes: number };
type Question = { id: string | number; quizName: string; preview: string; answers: number };
type Tournament = { id: string; title: string; subject: string; start: string; end: string; status: string };

export default function StaffContentPage() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'questions' | 'tournaments'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [quizzesList, setQuizzesList] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  async function fetchContent() {
    setLoading(true);
    try {
      const [resContent, resMeta] = await Promise.all([
        fetch('/api/staff/content'),
        fetch('/api/staff/sections?section=questions'),
      ]);
      const jsonContent = await resContent.json();
      const jsonMeta = await resMeta.json();

      if (jsonContent.success) {
        setSubjects(jsonContent.data.subjects || []);
        setQuestions(jsonContent.data.questions || []);
        setTournaments(jsonContent.data.tournaments || []);
      }
      if (jsonMeta.success && jsonMeta.meta?.quizzes) {
        setQuizzesList(jsonMeta.meta.quizzes);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat turun data kandungan', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let type: 'subject' | 'question' | 'competition' = 'subject';
      let payload: Record<string, any> = { ...formData };

      if (activeTab === 'subjects') {
        type = 'subject';
      } else if (activeTab === 'questions') {
        type = 'question';
        payload.options = [
          formData.optA || '',
          formData.optB || '',
          formData.optC || '',
          formData.optD || '',
        ].filter(Boolean);
      } else {
        type = 'competition';
      }

      const res = await fetch('/api/staff/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...payload }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Kandungan berjaya ditambah ke pangkalan data Supabase!');
        setIsModalOpen(false);
        setFormData({});
        fetchContent();
      } else {
        showToast(json.error || 'Gagal menyimpan kandungan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`staff-toast ${toastMessage.type}`} role="alert">
          {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengurusan Kandungan</h1>
          <p className="text-sm text-slate-500">Urus subjek, soalan kuiz dan pertandingan secara langsung di database.</p>
        </div>
        <button
          onClick={fetchContent}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          type="button"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Segarkan Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('subjects')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'subjects' 
                ? "border-pink-600 text-pink-600 font-semibold" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <Book className="w-4 h-4" />
            Subjek ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'questions' 
                ? "border-pink-600 text-pink-600 font-semibold" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <FileQuestion className="w-4 h-4" />
            Bank Soalan ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'tournaments' 
                ? "border-pink-600 text-pink-600 font-semibold" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <Trophy className="w-4 h-4" />
            Pertandingan ({tournaments.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFormData({});
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Subjek
                </button>
              </div>
              {loading && <div className="text-sm text-slate-500">Memuatkan subjek dari database...</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="border border-slate-200 rounded-xl p-4 hover:border-pink-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-900">{subject.title}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {subject.category}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900">{subject.materials}</span> Bahan
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{subject.quizzes}</span> Kuiz
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFormData({});
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Soalan
                </button>
              </div>
              {loading && <div className="text-sm text-slate-500">Memuatkan soalan dari database...</div>}
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4">
                    <div>
                      <div className="text-xs font-semibold text-pink-600 mb-1">{q.quizName}</div>
                      <div className="text-slate-900 text-sm">{q.preview}</div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                      {q.answers} Pilihan
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFormData({});
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Cipta Pertandingan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Pertandingan</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Subjek</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-sm text-center text-slate-500">
                          Memuatkan pertandingan...
                        </td>
                      </tr>
                    )}
                    {tournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{t.title}</td>
                        <td className="px-4 py-3 text-slate-700">{t.subject}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {t.start} - {t.end}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            t.status === 'Sedang Berlangsung' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: CREATE CONTENT ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="staff-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <Plus size={18} style={{ color: '#db2777' }} />
                {activeTab === 'subjects'
                  ? 'Tambah Subjek Baharu'
                  : activeTab === 'questions'
                  ? 'Tambah Soalan Kuiz'
                  : 'Cipta Pertandingan Baharu'}
              </h3>
              <button className="staff-modal-close" onClick={() => setIsModalOpen(false)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="staff-modal-body">
                {activeTab === 'subjects' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Subjek</label>
                      <input
                        required
                        placeholder="Contoh: Pendidikan Seni Visual, Reka Bentuk & Teknologi"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="staff-form-group">
                      <label>Kategori Sekolah</label>
                      <select
                        value={formData.category || 'SK'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="SK">Sekolah Kebangsaan (SK)</option>
                        <option value="SMK">Sekolah Menengah (SMK)</option>
                      </select>
                    </div>
                    <div className="staff-form-group">
                      <label>Penerangan Subjek</label>
                      <textarea
                        rows={3}
                        placeholder="Sukatan pelajaran..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'questions' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Kuiz</label>
                      <select
                        required
                        value={formData.quizId || ''}
                        onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                      >
                        <option value="">-- Pilih Kuiz --</option>
                        {quizzesList.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="staff-form-group">
                      <label>Teks Soalan</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Masukkan soalan..."
                        value={formData.questionText || ''}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      />
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilihan A</label>
                        <input
                          required
                          value={formData.optA || ''}
                          onChange={(e) => setFormData({ ...formData, optA: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan B</label>
                        <input
                          required
                          value={formData.optB || ''}
                          onChange={(e) => setFormData({ ...formData, optB: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilihan C</label>
                        <input
                          required
                          value={formData.optC || ''}
                          onChange={(e) => setFormData({ ...formData, optC: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan D</label>
                        <input
                          required
                          value={formData.optD || ''}
                          onChange={(e) => setFormData({ ...formData, optD: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="staff-form-group">
                      <label>Jawapan Betul</label>
                      <input
                        required
                        placeholder="Tulis jawapan betul sama tepat"
                        value={formData.correctAnswer || ''}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'tournaments' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Pertandingan</label>
                      <input
                        required
                        placeholder="Contoh: Kejohanan Matematik Pintar 2026"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilih Subjek</label>
                        <select
                          required
                          value={formData.subjectId || ''}
                          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        >
                          <option value="">-- Pilih Subjek --</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} ({s.category})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label>Emoji Ikon</label>
                        <input
                          value={formData.emoji || '🏆'}
                          onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Tahap Kesukaran</label>
                        <select
                          value={formData.difficulty || 'SEDERHANA'}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                          <option value="MUDAH">MUDAH</option>
                          <option value="SEDERHANA">SEDERHANA</option>
                          <option value="SUKAR">SUKAR</option>
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label>Tempoh (Minit)</label>
                        <input
                          type="number"
                          value={formData.durationMinutes || 15}
                          onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="staff-modal-footer">
                <button className="staff-btn-secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
