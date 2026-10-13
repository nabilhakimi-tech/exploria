'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  Eye,
  FolderOpen,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Trophy,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';

export type StaffSectionKey =
  | 'subjects'
  | 'questions'
  | 'competitions'
  | 'parents'
  | 'students'
  | 'awards'
  | 'announcements'
  | 'settings';

type SectionRecord = {
  id?: string;
  name: string;
  description: string;
  marker: string;
  status?: string;
  values: string[];
  subjectType?: string;
  schoolLevels?: {
    schoolType: 'SK' | 'SMK';
    levels: string[];
  }[];
  isActive?: boolean;
  isApproved?: boolean;
  quizId?: string;
  title?: string;
  content?: string;
  category?: string;
  targetAudience?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  icNumber?: string;
  parentId?: string;
  schoolType?: string;
  grade?: string;
  schoolName?: string;
  gender?: string;
  subjectId?: string;
  type?: string;
  contentUrl?: string;
  itemType?: 'subject' | 'material' | 'order' | 'award';
  questionText?: string;
  options?: any;
  correctAnswer?: string;
  difficulty?: string;
  durationMinutes?: number;
  emoji?: string;
  childId?: string;
  score?: number;
  competitionTitle?: string;
  orderNumber?: string;
  childName?: string;
  guardianName?: string;
  deliveryAddress?: string;
  trackingNumber?: string;
  productName?: string;
  totalAmount?: number;
  chapterTitle?: string;
  summary?: string;
  keyPoints?: string[];
  formulaOrVocabulary?: string[];
  examTip?: string;
  questionCount?: number;
  questions?: {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
};

type SectionConfig = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  columns: string[];
  filters: string[];
  addLabel: string;
  records: SectionRecord[];
};

type AdminMeta = {
  subjects: { id: string; title: string; category: string }[];
  quizzes: { id: string; title: string; subjectId: string; isTournament?: boolean }[];
  parents: { id: string; fullName: string; email: string }[];
  students: { id: string; fullName: string; schoolType: string; grade: string }[];
  adminProfile: { id: string; fullName: string; email: string; phone?: string } | null;
};

const sections: Record<StaffSectionKey, SectionConfig> = {
  subjects: {
    eyebrow: 'PUSAT KANDUNGAN',
    title: 'Subjek & bahan',
    description: 'Urus subjek dan bahan pembelajaran mengikut tahap pelajar.',
    icon: BookOpen,
    columns: ['Subjek', 'Tahap', 'Bahan', 'Soalan'],
    filters: ['Subjek', 'Bahan & Rujukan'],
    addLabel: 'Tambah rekod',
    records: [
      {
        name: 'Bahasa Melayu',
        description: 'Bacaan, tatabahasa dan penulisan',
        marker: '📖',
        status: 'Aktif',
        values: ['Darjah 1–6 · Tingkatan 1–5', '6 bahan', '12 soalan'],
        subjectType: 'Bahasa',
        schoolLevels: [
          { schoolType: 'SK', levels: Array.from({ length: 6 }, (_, index) => `Darjah ${index + 1}`) },
          { schoolType: 'SMK', levels: Array.from({ length: 5 }, (_, index) => `Tingkatan ${index + 1}`) },
        ],
      },
      {
        name: 'Matematik',
        description: 'Nombor, operasi dan penyelesaian masalah',
        marker: '➗',
        status: 'Aktif',
        values: ['Darjah 1–6 · Tingkatan 1–5', '8 bahan', '18 soalan'],
        subjectType: 'Teras',
        schoolLevels: [
          { schoolType: 'SK', levels: Array.from({ length: 6 }, (_, index) => `Darjah ${index + 1}`) },
          { schoolType: 'SMK', levels: Array.from({ length: 5 }, (_, index) => `Tingkatan ${index + 1}`) },
        ],
      },
      {
        name: 'Sains',
        description: 'Alam, eksperimen dan penemuan',
        marker: '🔬',
        status: 'Aktif',
        values: ['Darjah 1–6 · Tingkatan 1–5', '5 bahan', '10 soalan'],
        subjectType: 'STEM',
        schoolLevels: [
          { schoolType: 'SK', levels: Array.from({ length: 6 }, (_, index) => `Darjah ${index + 1}`) },
          { schoolType: 'SMK', levels: Array.from({ length: 5 }, (_, index) => `Tingkatan ${index + 1}`) },
        ],
      },
    ],
  },
  questions: {
    eyebrow: 'PUSAT KANDUNGAN',
    title: 'Bank soalan',
    description: 'Semak soalan kuiz mengikut subjek dan tahap kesukaran.',
    icon: CircleHelp,
    columns: ['Soalan', 'Subjek', 'Jenis', 'Tahap'],
    filters: ['Semua', 'Mudah', 'Sederhana', 'Sukar'],
    addLabel: 'Tambah soalan',
    records: [
      {
        name: 'Planet manakah paling hampir dengan Matahari?',
        description: 'Pilihan: Utarid, Zuhrah, Bumi, Marikh',
        marker: '☀️',
        status: 'Mudah',
        values: ['Sains', 'Pilihan berganda', 'Darjah 3 / Tingkatan 3'],
        subjectType: 'STEM',
        schoolLevels: [
          { schoolType: 'SK', levels: ['Darjah 3'] },
          { schoolType: 'SMK', levels: ['Tingkatan 3'] },
        ],
      },
    ],
  },
  competitions: {
    eyebrow: 'AKTIVITI & CABARAN',
    title: 'Pertandingan kuiz',
    description: 'Urus pertandingan kuiz bermusim, papan markah dan jadual.',
    icon: Trophy,
    columns: ['Pertandingan', 'Kategori', 'Tempoh', 'Bil. Soalan'],
    filters: ['Semua', 'Sedang Berlangsung', 'Dijadualkan'],
    addLabel: 'Cipta pertandingan',
    records: [
      {
        name: 'Cabaran Angkasa Lepas 2026',
        description: 'Kuiz astronomi untuk SK & SMK',
        marker: '🚀',
        status: 'Sedang Berlangsung',
        values: ['Sains & Teknologi', '1 Okt – 20 Okt 2026', '142 pelajar'],
      },
    ],
  },
  parents: {
    eyebrow: 'PENGURUSAN PENGGUNA',
    title: 'Senarai ibu bapa',
    description: 'Semak maklumat perhubungan penjaga dan bilangan anak.',
    icon: UsersRound,
    columns: ['Ibu bapa', 'Telefon', 'Bilangan anak', 'E-mel'],
    filters: ['Semua'],
    addLabel: 'Daftar ibu bapa',
    records: [
      { name: 'Sarah Abdullah', description: 'sarah@email.com', marker: 'SA', status: 'Aktif', values: ['012-345 6789', '3 anak berdaftar', 'sarah@email.com'] },
    ],
  },
  students: {
    eyebrow: 'PENGURUSAN PENGGUNA',
    title: 'Senarai pelajar',
    description: 'Lihat maklumat persekolahan, penjaga dan e-mel pelajar.',
    icon: UserRound,
    columns: ['Pelajar', 'Ibu bapa', 'Sekolah', 'E-mel pelajar'],
    filters: ['Semua', 'Aktif'],
    addLabel: 'Daftar pelajar',
    records: [
      { name: 'Ali bin Ahmad', description: 'SK · Darjah 4', marker: '🧑‍🚀', status: 'Aktif', values: ['Ahmad bin Razak', 'SK Taman Melati', 'ali.ahmad@exploria.my'] },
    ],
  },
  awards: {
    eyebrow: 'PENCAPAIAN PELAJAR',
    title: 'Pencapaian & lencana',
    description: 'Senarai ganjaran yang mengiktiraf usaha pelajar serta tempahan sijil/medal fizikal ibu bapa.',
    icon: Award,
    columns: ['Pencapaian / Pesanan', 'Penerima / Penjaga', 'Maklumat / Alamat', 'Markah / Bayaran'],
    filters: ['Semua', 'Tempahan Fizikal', 'Sijil & Medal Digital'],
    addLabel: 'Beri anugerah',
    records: [
      { name: 'Juara Kuiz Sains', description: 'Dianugerahkan kepada Adam', marker: '🏆', status: 'Rasmi', values: ['EXP-CERT-2026', 'Markah: 100%', '1 Okt 2026'] },
    ],
  },
  announcements: {
    eyebrow: 'KOMUNIKASI PORTAL',
    title: 'Senarai pengumuman',
    description: 'Urus hebahan dan makluman untuk pelajar serta ibu bapa.',
    icon: Megaphone,
    columns: ['Pengumuman', 'Kategori', 'Sasaran', 'Tarikh'],
    filters: ['Semua', 'Aktif', 'Arkib'],
    addLabel: 'Buat pengumuman',
    records: [
      { name: 'Pertandingan Kuiz Dibuka', description: 'Pendaftaran kini dibuka untuk semua.', marker: '📢', status: 'Aktif', values: ['Pertandingan', 'Semua', '1 Okt 2026'] },
    ],
  },
  settings: {
    eyebrow: 'PENTADBIRAN SISTEM',
    title: 'Tetapan admin',
    description: 'Semak dan kemaskini profil pentadbir dan konfigurasi sistem.',
    icon: Settings,
    columns: ['Pentadbir', 'E-mel', 'Peranan', 'Akses'],
    filters: ['Semua'],
    addLabel: 'Simpan tetapan',
    records: [],
  },
};

const goodStatuses = new Set(['Aktif', 'Diterbitkan', 'Berlangsung', 'Sedang Berlangsung', 'Disahkan', 'Rasmi', 'Telah Diposkan']);

export function isStaffSectionKey(section: string): section is StaffSectionKey {
  return Object.hasOwn(sections, section);
}

export function StaffSectionPage({ section }: { section: StaffSectionKey }) {
  const config = sections[section];
  const Icon = config.icon;
  const [activeFilter, setActiveFilter] = useState(section === 'subjects' ? 'Subjek' : 'Semua');
  const [query, setQuery] = useState('');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('Semua jenis');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('Semua sekolah');
  const [levelFilter, setLevelFilter] = useState('Semua darjah/tingkatan');
  const [liveRecords, setLiveRecords] = useState<SectionRecord[] | null>(null);
  const [meta, setMeta] = useState<AdminMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Popovers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SectionRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<SectionRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [activeMenuRecord, setActiveMenuRecord] = useState<SectionRecord | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for adding items
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [subjectAddTab, setSubjectAddTab] = useState<'subject' | 'material' | 'notes'>('notes');

  // Competition Question Form state
  const [competitionForNewQuestion, setCompetitionForNewQuestion] = useState<SectionRecord | null>(null);
  const [compQuestionForm, setCompQuestionForm] = useState({
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswer: 'A',
  });

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'record' | 'question';
    title: string;
    subtitle: string;
    record?: SectionRecord;
    questionId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/sections?section=${section}`);
      const json = await res.json();
      if (json.success) {
        setLiveRecords(json.records || []);
        if (json.meta) {
          setMeta(json.meta);
          if (json.meta.adminProfile) {
            setAdminName(json.meta.adminProfile.fullName || '');
            setAdminEmail(json.meta.adminProfile.email || '');
            setAdminPhone(json.meta.adminProfile.phone || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch section records', err);
      showToast('Gagal memuat turun data dari pelayan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
    setActiveFilter(section === 'subjects' ? 'Subjek' : 'Semua');
    // Reset modal states
    setIsAddModalOpen(false);
    setSelectedRecord(null);
    setEditingRecord(null);
    setActiveMenuRecord(null);
    setMenuPosition(null);
    setCompetitionForNewQuestion(null);
    setDeleteConfirmation(null);
    setIsDeleting(false);
    setCompQuestionForm({
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctAnswer: 'A',
    });
    setFormData({});
    setEditFormData({});
  }, [section]);

  // Close floating popover when scrolling or resizing
  useEffect(() => {
    if (!activeMenuRecord) return;
    const handleClose = () => {
      setActiveMenuRecord(null);
      setMenuPosition(null);
    };
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenuRecord]);

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, record: SectionRecord) => {
    e.stopPropagation();
    if (activeMenuRecord?.id === record.id && activeMenuRecord?.name === record.name) {
      setActiveMenuRecord(null);
      setMenuPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = 190;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < popoverHeight && rect.top > popoverHeight;

    setMenuPosition({
      top: openUpwards ? undefined : rect.bottom + 6,
      bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
      right: Math.max(16, window.innerWidth - rect.right),
    });
    setActiveMenuRecord(record);
  };

  const activeRecords = liveRecords !== null ? liveRecords : config.records;

  const isSubjects = section === 'subjects';
  const isParents = section === 'parents';
  const hasAcademicFilters = section === 'questions';
  const levelOptions =
    schoolTypeFilter === 'SK'
      ? Array.from({ length: 6 }, (_, index) => `Darjah ${index + 1}`)
      : schoolTypeFilter === 'SMK'
        ? Array.from({ length: 5 }, (_, index) => `Tingkatan ${index + 1}`)
        : [
            ...Array.from({ length: 6 }, (_, index) => `Darjah ${index + 1}`),
            ...Array.from({ length: 5 }, (_, index) => `Tingkatan ${index + 1}`),
          ];

  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((record) => {
        let matchesFilter = true;
        if (section === 'subjects') {
          if (activeFilter === 'Subjek') {
            matchesFilter = record.itemType !== 'material';
          } else if (activeFilter === 'Bahan & Rujukan' || activeFilter === 'Bahan Pelajaran') {
            matchesFilter = record.itemType === 'material';
          }
        } else if (activeFilter !== 'Semua') {
          if (section === 'awards') {
            if (activeFilter === 'Tempahan Fizikal') {
              matchesFilter = record.itemType === 'order';
            } else if (activeFilter === 'Sijil & Medal Digital') {
              matchesFilter = record.itemType !== 'order';
            } else {
              matchesFilter = record.status?.toLowerCase() === activeFilter.toLowerCase();
            }
          } else {
            matchesFilter = record.status?.toLowerCase() === activeFilter.toLowerCase();
          }
        }

        const matchesSubjectType =
          !hasAcademicFilters ||
          subjectTypeFilter === 'Semua jenis' ||
          record.subjectType === subjectTypeFilter;
        const matchesSchoolType =
          !hasAcademicFilters ||
          schoolTypeFilter === 'Semua sekolah' ||
          record.schoolLevels?.some(({ schoolType }) => schoolType === schoolTypeFilter);
        const matchesLevel =
          !hasAcademicFilters ||
          levelFilter === 'Semua darjah/tingkatan' ||
          record.schoolLevels?.some(
            ({ schoolType, levels }) =>
              (schoolTypeFilter === 'Semua sekolah' || schoolType === schoolTypeFilter) &&
              levels.includes(levelFilter),
          );
        const matchesQuery = `${record.name} ${record.description} ${record.values.join(' ')}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase());
        return (
          matchesFilter &&
          matchesSubjectType &&
          matchesSchoolType &&
          matchesLevel &&
          matchesQuery
        );
      }),
    [
      activeRecords,
      activeFilter,
      hasAcademicFilters,
      levelFilter,
      query,
      schoolTypeFilter,
      subjectTypeFilter,
      section,
    ],
  );

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let payload: Record<string, any> = { section, ...formData };
      if (section === 'subjects') {
        payload.isMaterial = activeFilter !== 'Subjek';
        if (payload.isMaterial) {
          payload.type = subjectAddTab === 'notes' ? 'notes' : (formData.type || 'pdf');
        }
      }
      if (section === 'questions') {
        payload.options = [
          formData.optA || '',
          formData.optB || '',
          formData.optC || '',
          formData.optD || '',
        ].filter(Boolean);
      }

      const res = await fetch('/api/staff/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Rekod berjaya disimpan ke pangkalan data Supabase!');
        setIsAddModalOpen(false);
        setFormData({});
        await fetchSectionData();

        // If a competition was just created, immediately offer to add questions to it!
        if (section === 'competitions' && json.data) {
          setCompetitionForNewQuestion({
            id: json.data.id,
            name: json.data.title,
            title: json.data.title,
            description: json.data.description,
            marker: json.data.emoji || '🏆',
            values: [],
          });
        }
      } else {
        showToast(json.error || 'Gagal menyimpan rekod', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Question to Competition
  const handleCreateCompetitionQuestion = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    if (!competitionForNewQuestion?.id) return;
    setIsSubmitting(true);
    try {
      const options = [
        compQuestionForm.optA.trim(),
        compQuestionForm.optB.trim(),
        compQuestionForm.optC.trim(),
        compQuestionForm.optD.trim(),
      ].filter(Boolean);

      if (options.length < 2) {
        showToast('Sila masukkan sekurang-kurangnya 2 pilihan jawapan', 'error');
        setIsSubmitting(false);
        return;
      }

      let correctAnsText = compQuestionForm.optA.trim();
      if (compQuestionForm.correctAnswer === 'B') correctAnsText = compQuestionForm.optB.trim();
      else if (compQuestionForm.correctAnswer === 'C') correctAnsText = compQuestionForm.optC.trim();
      else if (compQuestionForm.correctAnswer === 'D') correctAnsText = compQuestionForm.optD.trim();

      const res = await fetch('/api/staff/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'questions',
          quizId: competitionForNewQuestion.id,
          questionText: compQuestionForm.questionText.trim(),
          options,
          correctAnswer: correctAnsText,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Soalan berjaya ditambah ke pertandingan!');
        const freshRes = await fetch('/api/staff/sections?section=competitions');
        const freshJson = await freshRes.json();
        if (freshJson.success && freshJson.records) {
          setLiveRecords(freshJson.records);
          const updatedComp = freshJson.records.find((r: SectionRecord) => r.id === competitionForNewQuestion.id);
          if (updatedComp) {
            if (selectedRecord?.id === competitionForNewQuestion.id) {
              setSelectedRecord(updatedComp);
            }
            setCompetitionForNewQuestion(updatedComp);
          }
        }
        setCompQuestionForm({
          questionText: '',
          optA: '',
          optB: '',
          optC: '',
          optD: '',
          correctAnswer: 'A',
        });
        if (!keepOpen) {
          setCompetitionForNewQuestion(null);
        }
      } else {
        showToast(json.error || 'Gagal menambah soalan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal with prefilled values
  const handleOpenEdit = (record: SectionRecord) => {
    setEditingRecord(record);
    if (section === 'subjects') {
      if (record.itemType === 'material') {
        setEditFormData({
          title: record.title || record.name,
          type: record.type || (record.summary ? 'notes' : 'pdf'),
          contentUrl: record.contentUrl || '',
          subjectId: record.subjectId || '',
          quizId: record.quizId || '',
          chapterTitle: record.chapterTitle || '',
          summary: record.summary || '',
          keyPoints: Array.isArray(record.keyPoints)
            ? record.keyPoints.join('\n')
            : (record.keyPoints || ''),
          formulaOrVocabulary: Array.isArray(record.formulaOrVocabulary)
            ? record.formulaOrVocabulary.join('\n')
            : (record.formulaOrVocabulary || ''),
          examTip: record.examTip || '',
        });
      } else {
        setEditFormData({
          title: record.title || record.name,
          category: record.category || 'SK',
          description: record.description || '',
        });
      }
    } else if (section === 'questions') {
      const opts = Array.isArray(record.options) ? record.options : [];
      setEditFormData({
        questionText: record.questionText || record.name,
        quizId: record.quizId || '',
        optA: opts[0] || '',
        optB: opts[1] || '',
        optC: opts[2] || '',
        optD: opts[3] || '',
        correctAnswer: record.correctAnswer || opts[0] || '',
      });
    } else if (section === 'competitions') {
      setEditFormData({
        title: record.title || record.name,
        subjectId: record.subjectId || '',
        description: record.description || '',
        difficulty: record.difficulty || 'SEDERHANA',
        durationMinutes: record.durationMinutes || 15,
        emoji: record.marker || '🏆',
        isActive: record.isActive ?? true,
      });
    } else if (section === 'parents') {
      setEditFormData({
        fullName: record.fullName || record.name,
        email: record.email || '',
        phone: record.phone || '',
        icNumber: record.icNumber || '',
      });
    } else if (section === 'students') {
      setEditFormData({
        fullName: record.fullName || record.name,
        email: record.email || '',
        parentId: record.parentId || '',
        schoolType: record.schoolType || 'SK',
        grade: record.grade || '',
        schoolName: record.schoolName || '',
        gender: record.gender || 'Lelaki',
      });
    } else if (section === 'awards') {
      if (record.itemType === 'order') {
        setEditFormData({
          status: record.status || 'Baru',
          trackingNumber: record.trackingNumber || '',
        });
      } else {
        setEditFormData({
          title: record.title || record.name,
          childId: record.childId || '',
          type: record.type || 'badge',
          score: record.score ?? 100,
          competitionTitle: record.competitionTitle || record.description || '',
        });
      }
    } else if (section === 'announcements') {
      setEditFormData({
        title: record.title || record.name,
        content: record.content || record.description || '',
        category: record.category || 'Umum',
        targetAudience: record.targetAudience || 'Semua',
        isActive: record.isActive ?? true,
      });
    } else {
      setEditFormData({
        name: record.name,
        description: record.description,
      });
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord?.id) {
      showToast('Rekod contoh tidak boleh dikemaskini', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const targetSection =
        section === 'subjects' && editingRecord.itemType === 'material'
          ? 'materials'
          : editingRecord.itemType === 'order'
          ? 'orders'
          : section;

      let payloadData = { ...editFormData };
      if (section === 'questions') {
        payloadData.options = [
          editFormData.optA || '',
          editFormData.optB || '',
          editFormData.optC || '',
          editFormData.optD || '',
        ].filter(Boolean);
      }

      const res = await fetch('/api/staff/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: targetSection,
          id: editingRecord.id,
          data: payloadData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Rekod berjaya dikemaskini ke pangkalan data!');
        setEditingRecord(null);
        setEditFormData({});
        fetchSectionData();
      } else {
        showToast(json.error || 'Gagal mengemaskini rekod', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat komunikasi dengan pelayan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation Open
  const handleDelete = (record: SectionRecord) => {
    if (!record.id) {
      showToast('Rekod contoh tidak boleh dipadamkan dari pangkalan data', 'error');
      return;
    }
    setActiveMenuRecord(null);
    setMenuPosition(null);
    setDeleteConfirmation({
      type: 'record',
      title: 'Padam Rekod Ini?',
      subtitle: `Adakah anda pasti ingin memadamkan "${record.name}"? Semua data berkaitan akan disingkirkan daripada pangkalan data.`,
      record,
    });
  };

  // Perform Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    try {
      if (deleteConfirmation.type === 'question' && deleteConfirmation.questionId) {
        const qId = deleteConfirmation.questionId;
        // Optimistic UI update for instantaneous feedback
        if (selectedRecord) {
          const updatedQs = selectedRecord.questions?.filter((q) => q.id !== qId) || [];
          setSelectedRecord({
            ...selectedRecord,
            questions: updatedQs,
            questionCount: updatedQs.length,
            values: [
              selectedRecord.values[0],
              selectedRecord.values[1],
              `${updatedQs.length} soalan`,
            ],
          });
        }

        const res = await fetch(`/api/staff/sections?section=questions&id=${qId}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          showToast('Soalan berjaya dipadamkan!');
          const fresh = await fetch('/api/staff/sections?section=competitions');
          const fj = await fresh.json();
          if (fj.success && fj.records) {
            setLiveRecords(fj.records);
            if (selectedRecord) {
              const comp = fj.records.find((r: SectionRecord) => r.id === selectedRecord.id);
              if (comp) setSelectedRecord(comp);
            }
          }
        } else {
          showToast(json.error || 'Gagal memadam soalan', 'error');
          fetchSectionData();
        }
      } else if (deleteConfirmation.type === 'record' && deleteConfirmation.record) {
        const record = deleteConfirmation.record;
        const targetSection =
          section === 'subjects' && record.itemType === 'material'
            ? 'materials'
            : record.itemType === 'order'
            ? 'orders'
            : section;

        const res = await fetch(`/api/staff/sections?section=${targetSection}&id=${record.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          showToast('Rekod berjaya dipadam dari pangkalan data!');
          setSelectedRecord(null);
          await fetchSectionData();
        } else {
          showToast(json.error || 'Gagal memadam rekod', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat memadam rekod', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation(null);
    }
  };

  // Handle Toggle Status (e.g. approve parent, toggle active competition)
  const handleToggleStatus = async (record: SectionRecord) => {
    if (!record.id) {
      showToast('Rekod contoh tidak boleh dikemaskini', 'error');
      return;
    }
    try {
      let updatePayload: Record<string, any> = {};
      if (section === 'competitions' || section === 'announcements') {
        updatePayload.isActive = !record.isActive;
      }

      const res = await fetch('/api/staff/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          id: record.id,
          data: updatePayload,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Status rekod berjaya dikemaskini!');
        setActiveMenuRecord(null);
        setMenuPosition(null);
        fetchSectionData();
      } else {
        showToast(json.error || 'Gagal mengemaskini status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat mengemaskini status', 'error');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta?.adminProfile?.id) {
      showToast('Profil pentadbir tidak dijumpai dalam pangkalan data', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'settings',
          id: meta.adminProfile.id,
          data: {
            fullName: adminName,
            email: adminEmail,
            phone: adminPhone,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Tetapan pentadbir berjaya dikemaskini ke pangkalan data!');
        fetchSectionData();
      } else {
        showToast(json.error || 'Gagal menyimpan tetapan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ralat menyimpan tetapan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staff-section-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`staff-toast ${toastMessage.type}`} role="alert">
          {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <header className="staff-section-heading">
        <div>
          <span className="staff-section-eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchSectionData}
            title="Muat semula data pangkalan data"
            className="staff-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px' }}
            type="button"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <Link className="staff-section-back" href="/staff">
            Dashboard <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </header>

      <section className="staff-section-workspace">
        <div className="staff-section-toolbar">
          <div className="staff-section-toolbar-title">
            <span className="staff-section-icon"><Icon aria-hidden="true" size={19} /></span>
            <div>
              <h2>{section === 'parents' ? 'Semua ibu bapa' : section === 'awards' ? 'Koleksi pencapaian' : config.title}</h2>
              <p>{loading ? 'Memuatkan dari database...' : `${filteredRecords.length} rekod dipaparkan`}</p>
            </div>
          </div>
          {section !== 'settings' && (
            <button
              className="staff-section-add"
              onClick={() => {
                setFormData({});
                if (section === 'subjects') {
                  setSubjectAddTab(activeFilter === 'Subjek' ? 'subject' : 'notes');
                }
                setIsAddModalOpen(true);
              }}
              type="button"
            >
              <span>+</span>
              {section === 'subjects'
                ? activeFilter === 'Subjek'
                  ? 'Tambah Subjek'
                  : 'Tambah Bahan & Rujukan'
                : config.addLabel}
            </button>
          )}
        </div>

        {section !== 'settings' && (
          <div className="staff-section-controls">
            {config.filters.length > 1 && (
              <div aria-label={`Tapis ${config.title}`} className="staff-section-filters">
                {config.filters.map((filter) => (
                  <button
                    aria-pressed={activeFilter === filter}
                    className={activeFilter === filter ? 'is-active' : ''}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
            <label className="staff-section-search">
              <Search aria-hidden="true" size={16} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder={section === 'parents' ? 'Cari ibu bapa...' : `Cari ${config.title.toLowerCase()}...`}
                value={query}
              />
            </label>
          </div>
        )}

        {hasAcademicFilters && (
          <div aria-label="Penapis subjek, sekolah dan darjah" className="staff-subject-filter-row">
            <label className="staff-subject-filter">
              <span>Jenis subjek</span>
              <select
                aria-label="Tapis jenis subjek"
                onChange={(event) => setSubjectTypeFilter(event.target.value)}
                value={subjectTypeFilter}
              >
                <option>Semua jenis</option>
                <option>Bahasa</option>
                <option>Teras</option>
                <option>STEM</option>
                <option>Kreatif</option>
              </select>
            </label>
            <label className="staff-subject-filter">
              <span>Jenis sekolah</span>
              <select
                aria-label="Tapis jenis sekolah"
                onChange={(event) => {
                  setSchoolTypeFilter(event.target.value);
                  setLevelFilter('Semua darjah/tingkatan');
                }}
                value={schoolTypeFilter}
              >
                <option>Semua sekolah</option>
                <option>SK</option>
                <option>SMK</option>
              </select>
            </label>
            <label className="staff-subject-filter">
              <span>Darjah / tingkatan</span>
              <select
                aria-label="Tapis darjah atau tingkatan"
                onChange={(event) => setLevelFilter(event.target.value)}
                value={levelFilter}
              >
                <option>Semua darjah/tingkatan</option>
                {levelOptions.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
          </div>
        )}

        {section === 'settings' ? (
          <div className="staff-settings-card">
            <div>
              <div className="staff-settings-section-title">Konfigurasi Akaun Pentadbir</div>
              <div className="staff-settings-section-desc">
                Kemaskini maklumat profil pentadbir utama yang tersimpan di pangkalan data Supabase.
              </div>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="staff-form-group">
                <label>Nama Penuh Pentadbir</label>
                <input
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nama Pentadbir"
                />
              </div>

              <div className="staff-form-row">
                <div className="staff-form-group">
                  <label>Alamat E-mel</label>
                  <input
                    required
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@exploria.my"
                  />
                </div>
                <div className="staff-form-group">
                  <label>Nombor Telefon</label>
                  <input
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="012-3456789"
                  />
                </div>
              </div>

              <div className="staff-admin-security" style={{ marginTop: '8px' }}>
                <ShieldCheck aria-hidden="true" size={19} />
                <span>
                  <strong>Akses pentadbir dilindungi sepenuhnya</strong>
                  <small>Semua modul diselaraskan mengikut pangkalan data PostgreSQL Supabase.</small>
                </span>
                <span className="staff-section-status is-good">Aktif</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Pentadbir'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="staff-section-table-wrap">
            {(() => {
              const currentColumns =
                section === 'subjects' && (activeFilter === 'Bahan & Rujukan' || activeFilter === 'Bahan Pelajaran')
                  ? ['Bahan & Tajuk', 'Tahap Subjek', 'Bab / Topik', 'Jenis Format']
                  : section === 'awards' && activeFilter === 'Tempahan Fizikal'
                  ? ['No. Pesanan & Item', 'Ibu Bapa & Telefon', 'Alamat Penghantaran', 'Jumlah (RM)']
                  : section === 'awards' && activeFilter === 'Sijil & Medal Digital'
                  ? ['Pencapaian', 'Penerima Pelajar', 'No. Sijil', 'Markah']
                  : config.columns;

              return (
                <table className="staff-section-table">
                  <thead>
                    <tr>
                      <th>{currentColumns[0]}</th>
                      {currentColumns.slice(1).map((column) => <th key={column}>{column}</th>)}
                      {!isParents && <th>Status</th>}
                      <th aria-label="Tindakan">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const recordKey = record.id || `${record.name}-${index}`;
                      const isMenuOpen = activeMenuRecord?.id === record.id && activeMenuRecord?.name === record.name;

                      return (
                        <tr
                          key={recordKey}
                          style={
                            (section === 'subjects' && activeFilter === 'Subjek' && record.id) ||
                            (section === 'competitions' && record.id)
                              ? { cursor: 'pointer' }
                              : undefined
                          }
                          onClick={() => {
                            if (section === 'subjects' && activeFilter === 'Subjek' && record.id) {
                              window.location.href = `/staff/subjects/${record.id}`;
                            } else if (section === 'competitions' && record.id) {
                              window.location.href = `/staff/competitions/${record.id}`;
                            }
                          }}
                        >
                          <td>
                            <div className="staff-section-record">
                              <span className={`staff-section-record-avatar staff-section-record-avatar-${index % 4}`}>
                                {record.marker}
                              </span>
                              <div>
                                {section === 'subjects' && activeFilter === 'Subjek' && record.id ? (
                                  <Link
                                    href={`/staff/subjects/${record.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                  >
                                    <strong style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {record.name}
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          background: '#e0f2fe',
                                          color: '#0284c7',
                                          padding: '1px 8px',
                                          borderRadius: '999px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        Buka Bab & Bahan →
                                      </span>
                                    </strong>
                                    <small>{record.description}</small>
                                  </Link>
                                ) : section === 'competitions' && record.id ? (
                                  <Link
                                    href={`/staff/competitions/${record.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                  >
                                    <strong style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {record.name}
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          background: '#dcfce7',
                                          color: '#15803d',
                                          padding: '1px 8px',
                                          borderRadius: '999px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        Urus Pertandingan & Soalan →
                                      </span>
                                    </strong>
                                    <small>{record.description}</small>
                                  </Link>
                                ) : (
                                  <span><strong>{record.name}</strong><small>{record.description}</small></span>
                                )}
                              </div>
                            </div>
                          </td>
                          {currentColumns.slice(1).map((column, valueIndex) => (
                            <td className="staff-section-value" key={column}>{record.values[valueIndex]}</td>
                          ))}
                          {!isParents && (
                            <td>
                              <span className={`staff-section-status${goodStatuses.has(record.status ?? '') ? ' is-good' : ''}`}>
                                {record.status}
                              </span>
                            </td>
                          )}
                          <td style={{ position: 'relative' }}>
                            <div className="staff-row-menu-container">
                              <button
                                aria-label={`Pilihan untuk ${record.name}`}
                                className="staff-row-menu"
                                onClick={(e) => handleToggleMenu(e, record)}
                                type="button"
                              >
                                ···
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
            {filteredRecords.length === 0 && !loading && (
              <p className="staff-section-empty">Tiada rekod yang sepadan dengan carian ini.</p>
            )}
            {loading && (
              <p className="staff-section-empty">Sedang memuat turun data terkini...</p>
            )}
          </div>
        )}
      </section>

      {/* ─── FLOATING ACTION POPOVER (UNCLIPPED & AUTO-CLOSE) ─────────────── */}
      {activeMenuRecord && menuPosition && (
        <>
          <div
            className="staff-popover-backdrop"
            onClick={() => {
              setActiveMenuRecord(null);
              setMenuPosition(null);
            }}
          />
          <div
            className="staff-actions-popover is-fixed"
            style={{
              top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined,
              bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined,
              right: `${menuPosition.right}px`,
            }}
            onMouseLeave={() => {
              setActiveMenuRecord(null);
              setMenuPosition(null);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="staff-action-item"
              onClick={() => {
                setSelectedRecord(activeMenuRecord);
                setActiveMenuRecord(null);
                setMenuPosition(null);
              }}
              type="button"
            >
              <Eye size={14} /> Lihat Butiran
            </button>

            {section === 'subjects' && activeMenuRecord.itemType !== 'material' && activeMenuRecord.id && (
              <Link
                className="staff-action-item"
                style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                href={`/staff/subjects/${activeMenuRecord.id}`}
                onClick={() => {
                  setActiveMenuRecord(null);
                  setMenuPosition(null);
                }}
              >
                <FolderOpen size={14} /> Buka Bab & Bahan
              </Link>
            )}

            {section !== 'competitions' && (
              <button
                className="staff-action-item"
                onClick={() => {
                  handleOpenEdit(activeMenuRecord);
                  setActiveMenuRecord(null);
                  setMenuPosition(null);
                }}
                type="button"
              >
                <Pencil size={14} /> Edit Rekod
              </button>
            )}

            {(section === 'competitions' || section === 'announcements') && (
              <button
                className="staff-action-item"
                onClick={() => {
                  handleToggleStatus(activeMenuRecord);
                  setActiveMenuRecord(null);
                  setMenuPosition(null);
                }}
                type="button"
              >
                <RefreshCw size={14} />
                {activeMenuRecord.isActive ? 'Tutup / Nyahaktifkan' : 'Buka / Aktifkan Sesi'}
              </button>
            )}

            {section === 'competitions' && (
              <button
                className="staff-action-item"
                onClick={async () => {
                  const toReset = activeMenuRecord;
                  setActiveMenuRecord(null);
                  setMenuPosition(null);
                  try {
                    const res = await fetch('/api/staff/sections', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'competitions',
                        id: toReset.id,
                        data: { isActive: true, resetAttempts: true },
                      }),
                    });
                    const json = await res.json();
                    if (json.success) {
                      showToast('Sesi pertandingan telah dibuka semula! Pelajar kini boleh menduduki peperiksaan ini semula.');
                      fetchSectionData();
                    } else {
                      showToast(json.error || 'Gagal membuka semula sesi', 'error');
                    }
                  } catch {
                    showToast('Ralat sambungan rangkaian', 'error');
                  }
                }}
                type="button"
              >
                <RotateCcw size={14} className="text-emerald-600" />
                Buka Semula (Reset Percubaan Pelajar)
              </button>
            )}

            <button
              className="staff-action-item danger"
              onClick={() => {
                const toDelete = activeMenuRecord;
                setActiveMenuRecord(null);
                setMenuPosition(null);
                handleDelete(toDelete);
              }}
              type="button"
            >
              <Trash2 size={14} /> Padam Rekod
            </button>
          </div>
        </>
      )}

      <div className="staff-section-footer-note">
        <CalendarDays aria-hidden="true" size={14} />
        Data dipautkan secara langsung dengan Supabase PostgreSQL
      </div>

      {/* ─── MODAL: VIEW RECORD DETAILS ─────────────────────────────────── */}
      {selectedRecord && (
        <div className="staff-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="staff-modal-container" style={section === 'competitions' ? { maxWidth: '640px' } : undefined} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>
                <span style={{ fontSize: '20px' }}>{selectedRecord.marker}</span>
                Butiran Rekod
              </h3>
              <button className="staff-modal-close" onClick={() => setSelectedRecord(null)} type="button">
                <X size={16} />
              </button>
            </div>
            <div className="staff-modal-body">
              {selectedRecord.itemType === 'order' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '14px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>
                        {selectedRecord.orderNumber || selectedRecord.name}
                      </span>
                      <span className={`staff-section-status${goodStatuses.has(selectedRecord.status ?? '') ? ' is-good' : ''}`}>
                        {selectedRecord.status || 'Baru'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          Item / Pakej Ditempah
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>
                          {selectedRecord.productName || 'Pakej Lengkap'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          Penerima (Pelajar)
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>
                          {selectedRecord.childName || 'Pelajar Exploria'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          Ibu Bapa / Penjaga
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                          {selectedRecord.guardianName || '-'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          No. Telefon / WhatsApp
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                          {selectedRecord.phone ? (
                            <a
                              href={`https://wa.me/6${selectedRecord.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#059669', textDecoration: 'underline' }}
                            >
                              📱 {selectedRecord.phone} (WhatsApp)
                            </a>
                          ) : (
                            '-'
                          )}
                        </p>
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          Alamat Penuh Penghantaran
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          📍 {selectedRecord.deliveryAddress || '-'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          Jumlah Bayaran
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#047857', fontSize: '15px' }}>
                          RM {selectedRecord.totalAmount || 0}.00
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          No. Tracking Kurier
                        </span>
                        <p style={{ margin: '2px 0 0', fontWeight: 700, fontFamily: 'monospace', color: selectedRecord.trackingNumber ? '#0284c7' : '#94a3b8' }}>
                          {selectedRecord.trackingNumber || 'Belum dimasukkan'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inline Status & Tracking updater for Staff */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                      ⚡ Tindakan Pentadbir: Kemaskini Status & Tracking Kurier
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Status Pesanan
                        </label>
                        <select
                          id="order-status-quick-select"
                          defaultValue={selectedRecord.status || 'Baru'}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        >
                          <option value="Baru">Baru</option>
                          <option value="Sedang Diproses">Sedang Diproses</option>
                          <option value="Telah Diposkan">Telah Diposkan</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          No. Tracking Kurier
                        </label>
                        <input
                          id="order-tracking-quick-input"
                          defaultValue={selectedRecord.trackingNumber || ''}
                          placeholder="Cth: J&T / Pos Laju (MY...)"
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </div>
                      <button
                        type="button"
                        className="staff-btn-primary"
                        style={{ padding: '8px 14px', fontSize: '12px', height: '36px' }}
                        onClick={async () => {
                          const statusEl = document.getElementById('order-status-quick-select') as HTMLSelectElement;
                          const trackingEl = document.getElementById('order-tracking-quick-input') as HTMLInputElement;
                          const newStatus = statusEl?.value || selectedRecord.status;
                          const newTracking = trackingEl?.value || '';

                          try {
                            const res = await fetch('/api/staff/sections', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                section: 'orders',
                                id: selectedRecord.id,
                                data: { status: newStatus, trackingNumber: newTracking },
                              }),
                            });
                            const json = await res.json();
                            if (json.success) {
                              showToast('Pesanan dan nombor tracking berjaya dikemaskini!');
                              setSelectedRecord({
                                ...selectedRecord,
                                status: newStatus,
                                trackingNumber: newTracking,
                              });
                              fetchSectionData();
                            } else {
                              showToast(json.error || 'Gagal mengemaskini pesanan', 'error');
                            }
                          } catch {
                            showToast('Ralat komunikasi dengan pelayan', 'error');
                          }
                        }}
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedRecord.itemType === 'material' && (selectedRecord.type === 'notes' || selectedRecord.summary) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span className="staff-section-status is-good">Nota Bab Bertulis</span>
                      {selectedRecord.chapterTitle && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                          📖 {selectedRecord.chapterTitle}
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: '17px', color: '#0f172a' }}>{selectedRecord.name}</strong>
                    <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '13px' }}>{selectedRecord.description}</p>
                  </div>

                  {/* Section A: Ringkasan Topik */}
                  <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', border: '2px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ background: '#2563eb', color: '#fff', padding: '5px', borderRadius: '8px', display: 'flex' }}>
                        <BookOpen size={16} />
                      </span>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>Ringkasan & Intipati Utama Topik</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Konsep teras yang perlu pelajar fahami terlebih dahulu</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#334155', background: 'rgba(255,255,255,0.85)', padding: '12px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                      {selectedRecord.summary || 'Tiada ringkasan dimasukkan.'}
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1e40af', background: '#dbeafe', padding: '6px 10px', borderRadius: '8px' }}>
                      <span>💡</span>
                      <span><strong>Tahukah Anda?</strong> Memahami konsep asas ini membantu pelajar menyelesaikan kuiz dengan skor penuh!</span>
                    </div>
                  </div>

                  {/* Section B: Fakta & Konsep Penting */}
                  {selectedRecord.keyPoints && selectedRecord.keyPoints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💡</span> Fakta & Konsep Penting Wajib Tahu
                        </strong>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                          {selectedRecord.keyPoints.length} Poin Utama
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                        {selectedRecord.keyPoints.map((point, pIdx) => (
                          <div key={pIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
                            <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '999px', marginBottom: '4px' }}>
                              Fakta #{pIdx + 1}
                            </span>
                            <p style={{ margin: 0, color: '#334155', lineHeight: '1.5', fontWeight: 500 }}>
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section C: Glosari Istilah & Formula Teras */}
                  {selectedRecord.formulaOrVocabulary && selectedRecord.formulaOrVocabulary.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✨</span> Glosari Istilah & Formula Teras
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {selectedRecord.formulaOrVocabulary.map((item, gIdx) => {
                          const [term, ...rest] = item.split(':');
                          const desc = rest.join(':').trim();
                          return (
                            <div key={gIdx} style={{ background: '#fff', border: '2px solid #e0f2fe', borderRadius: '12px', padding: '10px 12px', fontSize: '12px' }}>
                              <span style={{ display: 'inline-block', fontWeight: 800, background: 'linear-gradient(135deg,#0284c7,#2563eb)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', marginBottom: '6px' }}>
                                ✨ {term?.trim()}
                              </span>
                              {desc && (
                                <p style={{ margin: 0, color: '#475569', lineHeight: '1.4' }}>
                                  {desc}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section D: Tip Rahsia Menjawab */}
                  {selectedRecord.examTip && (
                    <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: '2px solid #fde68a', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#78350f', display: 'block' }}>Tip Rahsia Menjawab & Skor Kuiz</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#92400e', lineHeight: '1.5', fontWeight: 500 }}>
                          {selectedRecord.examTip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedRecord.name}</strong>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>{selectedRecord.description}</p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {config.columns.slice(1).map((col, idx) => (
                        <div key={col}>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                            {col}
                          </span>
                          <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                            {selectedRecord.values[idx] || '-'}
                          </p>
                        </div>
                      ))}
                      {!isParents && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                            Status
                          </span>
                          <p style={{ margin: '2px 0 0' }}>
                            <span className={`staff-section-status${goodStatuses.has(selectedRecord.status ?? '') ? ' is-good' : ''}`}>
                              {selectedRecord.status || 'Aktif'}
                            </span>
                          </p>
                        </div>
                      )}
                      {selectedRecord.id && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                            ID Database
                          </span>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#475569' }}>
                            {selectedRecord.id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* COMPETITION QUESTIONS PREVIEW & MANAGEMENT */}
              {section === 'competitions' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                        Soalan Pertandingan ({selectedRecord.questions?.length || 0})
                      </strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Pelajar akan menjawab soalan-soalan ini semasa kejohanan berlangsung.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="staff-btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => {
                        setCompetitionForNewQuestion(selectedRecord);
                      }}
                    >
                      <Plus size={14} /> Tambah Soalan
                    </button>
                  </div>

                  {(!selectedRecord.questions || selectedRecord.questions.length === 0) ? (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px dashed #cbd5e1' }}>
                      <p style={{ margin: 0 }}>⚠️ Pertandingan ini belum mempunyai sebarang soalan.</p>
                      <button
                        type="button"
                        className="staff-btn-primary"
                        style={{ fontSize: '12px', padding: '6px 14px', marginTop: '10px' }}
                        onClick={() => setCompetitionForNewQuestion(selectedRecord)}
                      >
                        + Tambah Soalan Sekarang
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedRecord.questions.map((q, qIdx) => (
                        <div key={q.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <strong style={{ color: '#1e293b' }}>
                              {qIdx + 1}. {q.questionText}
                            </strong>
                            <button
                              type="button"
                              title="Padam soalan ini"
                              className="staff-btn-delete-item"
                              aria-label={`Padam soalan ${qIdx + 1}`}
                              onClick={() => {
                                setDeleteConfirmation({
                                  type: 'question',
                                  title: 'Padam Soalan Ini?',
                                  subtitle: `Adakah anda pasti ingin memadamkan soalan ${qIdx + 1}: "${q.questionText}" dari pertandingan?`,
                                  questionId: q.id,
                                });
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {q.options?.map((opt: string, optIdx: number) => {
                              const isCorrect = opt.trim() === q.correctAnswer?.trim();
                              return (
                                <span
                                  key={optIdx}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: isCorrect ? '#ecfdf5' : '#f1f5f9',
                                    color: isCorrect ? '#059669' : '#475569',
                                    fontWeight: isCorrect ? 700 : 500,
                                    border: isCorrect ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {['A', 'B', 'C', 'D'][optIdx]}: {opt}
                                  {isCorrect && ' ✓'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="staff-modal-footer">
              <button className="staff-btn-secondary" onClick={() => setSelectedRecord(null)} type="button">
                Tutup
              </button>
              {selectedRecord.id && (
                <>
                {section === 'competitions' ? (
                  <Link
                    href={`/staff/competitions/${selectedRecord.id}`}
                    className="staff-btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Settings size={14} /> Buka Halaman Pengurusan Penuh
                  </Link>
                ) : (
                  <button
                    className="staff-btn-primary"
                    onClick={() => {
                      const toEdit = selectedRecord;
                      setSelectedRecord(null);
                      handleOpenEdit(toEdit);
                    }}
                    type="button"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Pencil size={14} /> Edit Rekod
                  </button>
                )}
                  <button
                    className="staff-btn-danger"
                    onClick={() => {
                      handleDelete(selectedRecord);
                    }}
                    type="button"
                  >
                    Padam Rekod
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD QUESTION DIRECTLY TO COMPETITION ──────────────────── */}
      {competitionForNewQuestion && (
        <div className="staff-modal-overlay" onClick={() => setCompetitionForNewQuestion(null)}>
          <div
            className="staff-modal-container"
            style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header" style={{ flexShrink: 0 }}>
              <h3>
                <CircleHelp size={18} style={{ color: '#0284c7' }} />
                Tambah Soalan: {competitionForNewQuestion.name}
              </h3>
              <button
                className="staff-modal-close"
                onClick={() => setCompetitionForNewQuestion(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateCompetitionQuestion(e, false)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="staff-modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
                <div style={{ background: '#f0f9ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '13px', color: '#0369a1', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{competitionForNewQuestion.marker || '🏆'}</span>
                  <span>Soalan ini akan dimasukkan terus ke dalam kejohanan <strong>{competitionForNewQuestion.name}</strong>.</span>
                </div>

                <div className="staff-form-group">
                  <label>Teks Soalan</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Berapakah bilangan planet dalam Sistem Suria kita?"
                    value={compQuestionForm.questionText}
                    onChange={(e) => setCompQuestionForm({ ...compQuestionForm, questionText: e.target.value })}
                  />
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Pilihan A</label>
                    <input
                      required
                      placeholder="Contoh: 7"
                      value={compQuestionForm.optA}
                      onChange={(e) => setCompQuestionForm({ ...compQuestionForm, optA: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan B</label>
                    <input
                      required
                      placeholder="Contoh: 8"
                      value={compQuestionForm.optB}
                      onChange={(e) => setCompQuestionForm({ ...compQuestionForm, optB: e.target.value })}
                    />
                  </div>
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label>Pilihan C</label>
                    <input
                      placeholder="Contoh: 9"
                      value={compQuestionForm.optC}
                      onChange={(e) => setCompQuestionForm({ ...compQuestionForm, optC: e.target.value })}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Pilihan D</label>
                    <input
                      placeholder="Contoh: 10"
                      value={compQuestionForm.optD}
                      onChange={(e) => setCompQuestionForm({ ...compQuestionForm, optD: e.target.value })}
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Pilihan Jawapan Betul</label>
                  <select
                    value={compQuestionForm.correctAnswer}
                    onChange={(e) => setCompQuestionForm({ ...compQuestionForm, correctAnswer: e.target.value })}
                  >
                    <option value="A">Pilihan A {compQuestionForm.optA ? `(${compQuestionForm.optA})` : ''}</option>
                    <option value="B">Pilihan B {compQuestionForm.optB ? `(${compQuestionForm.optB})` : ''}</option>
                    <option value="C">Pilihan C {compQuestionForm.optC ? `(${compQuestionForm.optC})` : ''}</option>
                    <option value="D">Pilihan D {compQuestionForm.optD ? `(${compQuestionForm.optD})` : ''}</option>
                  </select>
                </div>
              </div>

              <div className="staff-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setCompetitionForNewQuestion(null)}
                >
                  Batal
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="staff-btn-secondary"
                    disabled={isSubmitting || !compQuestionForm.questionText.trim()}
                    onClick={(e) => handleCreateCompetitionQuestion(e, true)}
                    style={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                  >
                    {isSubmitting ? 'Menyimpan...' : '+ Simpan & Tambah Lagi'}
                  </button>
                  <button
                    type="submit"
                    className="staff-btn-primary"
                    disabled={isSubmitting || !compQuestionForm.questionText.trim()}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan & Selesai'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: IN-APP DELETE CONFIRMATION ──────────────────────────── */}
      {deleteConfirmation && (
        <div className="staff-modal-overlay" style={{ zIndex: 1100 }} onClick={() => !isDeleting && setDeleteConfirmation(null)}>
          <div className="staff-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Trash2 size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>{deleteConfirmation.title}</h3>
              </div>
              <button
                className="staff-modal-close"
                onClick={() => !isDeleting && setDeleteConfirmation(null)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="staff-modal-body" style={{ padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                {deleteConfirmation.subtitle}
              </p>
            </div>

            <div className="staff-modal-footer" style={{ borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="staff-btn-secondary"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="staff-btn-danger"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Sedang Memadam...' : 'Ya, Padam Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE RECORD ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="staff-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="staff-modal-container"
            style={
              section === 'subjects' && activeFilter !== 'Subjek'
                ? { maxWidth: '700px', maxHeight: '90vh' }
                : { maxHeight: '90vh' }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header">
              <h3>
                <span style={{ fontSize: '20px' }}>
                  {section === 'subjects'
                    ? activeFilter === 'Subjek'
                      ? '📚'
                      : '📑'
                    : '➕'}
                </span>
                {section === 'subjects'
                  ? activeFilter === 'Subjek'
                    ? 'Daftar Subjek Baharu'
                    : 'Tambah Bahan & Rujukan'
                  : config.addLabel}
              </h3>
              <button className="staff-modal-close" onClick={() => setIsAddModalOpen(false)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="staff-modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
                {/* 1. SUBJECTS SECTION FORM */}
                {section === 'subjects' && (
                  <>
                    {activeFilter === 'Subjek' ? (
                      /* BORANG UNTUK DAFTAR SUBJEK SAHAJA */
                      <>
                        <div className="staff-form-group">
                          <label>Tajuk Subjek</label>
                          <input
                            required
                            placeholder="Contoh: Pendidikan Islam, Sejarah, Robotik"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div className="staff-form-row">
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
                        </div>
                        <div className="staff-form-group">
                          <label>Penerangan Subjek</label>
                          <textarea
                            rows={3}
                            placeholder="Ringkasan sukatan pelajaran..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      /* BORANG UNTUK TAMBAH BAHAN DAN RUJUKAN */
                      <>
                        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          <button
                            type="button"
                            className={subjectAddTab === 'notes' ? 'staff-btn-primary' : 'staff-btn-secondary'}
                            onClick={() => {
                              setSubjectAddTab('notes');
                              setFormData({ ...formData, type: 'notes' });
                            }}
                            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            ✍️ Nota Bab (Tulis Sendiri)
                          </button>
                          <button
                            type="button"
                            className={subjectAddTab === 'material' ? 'staff-btn-primary' : 'staff-btn-secondary'}
                            onClick={() => {
                              setSubjectAddTab('material');
                              setFormData({ ...formData, type: 'pdf' });
                            }}
                            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            📄 Fail PDF / Video
                          </button>
                        </div>

                        {subjectAddTab === 'notes' ? (
                          <>
                            <div className="staff-form-group">
                              <label>Pilih Subjek Sasaran</label>
                              <select
                                required
                                value={formData.subjectId || ''}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                              >
                                <option value="">-- Pilih Subjek --</option>
                                {meta?.subjects?.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title} ({s.category})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="staff-form-row">
                              <div className="staff-form-group">
                                <label>Pautkan dengan Bab / Kuiz (Pilihan)</label>
                                <select
                                  value={formData.quizId || ''}
                                  onChange={(e) => {
                                    const selectedQz = meta?.quizzes?.find((q) => q.id === e.target.value);
                                    setFormData({
                                      ...formData,
                                      quizId: e.target.value,
                                      chapterTitle: selectedQz ? selectedQz.title : formData.chapterTitle,
                                      title: formData.title || (selectedQz ? `Nota: ${selectedQz.title}` : ''),
                                    });
                                  }}
                                >
                                  <option value="">-- Bebas / Pilih Bab Kuiz --</option>
                                  {meta?.quizzes
                                    ?.filter((q) => !formData.subjectId || q.subjectId === formData.subjectId)
                                    .map((q) => (
                                      <option key={q.id} value={q.id}>
                                        {q.title}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div className="staff-form-group">
                                <label>Nama Bab / Topik</label>
                                <input
                                  required
                                  placeholder="Contoh: Bab 1: Sistem Suria & Planet"
                                  value={formData.chapterTitle || ''}
                                  onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="staff-form-group">
                              <label>Tajuk Bahan / Modul Nota</label>
                              <input
                                required
                                placeholder="Contoh: Nota Ringkas: Sistem Suria & 8 Buah Planet"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              />
                            </div>

                            {/* 1. Ringkasan Topik */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>📖</span>
                                <strong>1. Ringkasan & Intipati Utama Topik</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Konsep teras yang perlu pelajar fahami terlebih dahulu sebelum menjawab kuiz.
                              </p>
                              <textarea
                                required
                                rows={3}
                                placeholder="Contoh: Sistem Suria kita terdiri daripada Matahari sebagai pusat tarikan graviti dan 8 buah planet..."
                                value={formData.summary || ''}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                              />
                            </div>

                            {/* 2. Fakta & Konsep Penting */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>💡</span>
                                <strong>2. Fakta & Konsep Penting Wajib Tahu</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Poin penting yang perlu diingati bagi topik ini (masukkan 1 fakta setiap baris baru).
                              </p>
                              <textarea
                                required
                                rows={4}
                                placeholder={"Matahari adalah bintang yang mengeluarkan haba dan cahaya sendiri.\nUrutan 8 Planet: Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun."}
                                value={formData.keyPoints || ''}
                                onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                              />
                            </div>

                            {/* 3. Glosari Istilah & Formula Teras */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>✨</span>
                                <strong>3. Glosari Istilah & Formula Teras</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Kamus ringkas istilah atau formula yang kerap keluar dalam soalan. Format: <code>Istilah : Definisi</code> (1 per baris).
                              </p>
                              <textarea
                                rows={3}
                                placeholder={"Orbit : Laluan peredaran planet mengelilingi matahari.\nGraviti : Daya tarikan semulajadi antara objek berjisim.\nAtmosfera : Lapisan gas yang menyelimuti sesebuah planet."}
                                value={formData.formulaOrVocabulary || ''}
                                onChange={(e) => setFormData({ ...formData, formulaOrVocabulary: e.target.value })}
                              />
                            </div>

                            {/* 4. Tip Rahsia Menjawab & Skor Kuiz */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>⭐</span>
                                <strong>4. Tip Rahsia Menjawab & Skor Kuiz</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Tip mengingat, formula akronim atau teknik menjawab soalan.
                              </p>
                              <textarea
                                rows={2}
                                placeholder={'Tip Mengingat: Gunakan akronim "U-Z-B-M-M-Z-U-N" (Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun)!'}
                                value={formData.examTip || ''}
                                onChange={(e) => setFormData({ ...formData, examTip: e.target.value })}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="staff-form-group">
                              <label>Pilih Subjek</label>
                              <select
                                required
                                value={formData.subjectId || ''}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                              >
                                <option value="">-- Pilih Subjek --</option>
                                {meta?.subjects?.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title} ({s.category})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="staff-form-group">
                              <label>Tajuk Bahan Pelajaran</label>
                              <input
                                required
                                placeholder="Contoh: Nota Pengenalan Bab 1"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              />
                            </div>
                            <div className="staff-form-row">
                              <div className="staff-form-group">
                                <label>Jenis Bahan</label>
                                <select
                                  value={formData.type || 'pdf'}
                                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                  <option value="pdf">Dokumen PDF / Nota</option>
                                  <option value="video">Pautan Video Pembelajaran</option>
                                </select>
                              </div>
                              <div className="staff-form-group">
                                <label>Pautan URL / Fail</label>
                                <input
                                  required
                                  placeholder="https://..."
                                  value={formData.contentUrl || ''}
                                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* 2. QUESTIONS SECTION FORM */}
                {section === 'questions' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Kuiz / Modul</label>
                      <select
                        required
                        value={formData.quizId || ''}
                        onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                      >
                        <option value="">-- Pilih Kuiz / Pertandingan Sasaran --</option>
                        {meta?.quizzes?.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.isTournament ? '🏆 [Pertandingan] ' : '📝 [Kuiz] '}
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
                        placeholder="Masukkan soalan di sini..."
                        value={formData.questionText || ''}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilihan A</label>
                        <input
                          required
                          placeholder="Jawapan A"
                          value={formData.optA || ''}
                          onChange={(e) => setFormData({ ...formData, optA: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan B</label>
                        <input
                          required
                          placeholder="Jawapan B"
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
                          placeholder="Jawapan C"
                          value={formData.optC || ''}
                          onChange={(e) => setFormData({ ...formData, optC: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan D</label>
                        <input
                          required
                          placeholder="Jawapan D"
                          value={formData.optD || ''}
                          onChange={(e) => setFormData({ ...formData, optD: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Jawapan Betul</label>
                      <input
                        required
                        placeholder="Tulis jawapan betul sama tepat seperti pilihan di atas"
                        value={formData.correctAnswer || ''}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 3. COMPETITIONS SECTION FORM */}
                {section === 'competitions' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Pertandingan</label>
                      <input
                        required
                        placeholder="Contoh: Kejohanan Sains Astronomi Kebangsaan 2026"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Subjek Berkaitan</label>
                        <select
                          required
                          value={formData.subjectId || ''}
                          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        >
                          <option value="">-- Pilih Subjek --</option>
                          {meta?.subjects?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} ({s.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Ikon Emoji</label>
                        <input
                          placeholder="🏆, 🥇, 🚀, ⚡, 🧠"
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
                        <label>Tempoh Menjawab (Minit)</label>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={formData.durationMinutes || 15}
                          onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Penerangan Pertandingan</label>
                      <textarea
                        rows={2}
                        placeholder="Syarat dan penerangan kejohanan..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 4. PARENTS SECTION FORM */}
                {section === 'parents' && (
                  <>
                    <div className="staff-form-group">
                      <label>Nama Penuh Ibu Bapa / Penjaga</label>
                      <input
                        required
                        placeholder="Contoh: Encik Roslan bin Kassim"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Alamat E-mel</label>
                        <input
                          required
                          type="email"
                          placeholder="roslan@gmail.com"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="staff-form-group">
                        <label>Nombor Telefon</label>
                        <input
                          placeholder="012-3456789"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 5. STUDENTS SECTION FORM */}
                {section === 'students' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Penjaga / Ibu Bapa</label>
                      <select
                        required
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      >
                        <option value="">-- Pilih Ibu Bapa Berdaftar --</option>
                        {meta?.parents?.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="staff-form-group">
                      <label>Nama Penuh Pelajar</label>
                      <input
                        required
                        placeholder="Contoh: Aiman Hakim bin Roslan"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Jenis Sekolah</label>
                        <select
                          value={formData.schoolType || 'SK'}
                          onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                        >
                          <option value="SK">Sekolah Rendah (SK)</option>
                          <option value="SMK">Sekolah Menengah (SMK)</option>
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Darjah / Tingkatan</label>
                        <input
                          required
                          placeholder="Contoh: Darjah 4 / Tingkatan 2"
                          value={formData.grade || ''}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Nama Sekolah</label>
                        <input
                          placeholder="SK Seri Bintang Utara"
                          value={formData.schoolName || ''}
                          onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        />
                      </div>

                      <div className="staff-form-group">
                        <label>Jantina</label>
                        <select
                          value={formData.gender || 'Lelaki'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Lelaki">Lelaki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Alamat E-mel Pelajar</label>
                      <input
                        type="email"
                        placeholder="Contoh: aiman@exploria.my"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 6. AWARDS SECTION FORM */}
                {section === 'awards' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Penerima (Pelajar)</label>
                      <select
                        required
                        value={formData.childId || ''}
                        onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                      >
                        <option value="">-- Pilih Pelajar --</option>
                        {meta?.students?.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName} ({s.schoolType} - {s.grade})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="staff-form-group">
                      <label>Tajuk Anugerah / Lencana</label>
                      <input
                        required
                        placeholder="Contoh: Juara Kuiz Sains Kebangsaan 2026"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Jenis Pengiktirafan</label>
                        <select
                          value={formData.type || 'medal_gold'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                          <option value="medal_gold">🏆 Pingat Emas (Gold)</option>
                          <option value="medal_silver">🥈 Pingat Perak (Silver)</option>
                          <option value="medal_bronze">🥉 Pingat Gangsa (Bronze)</option>
                          <option value="certificate">📜 Sijil Penyertaan</option>
                          <option value="badge">🎖️ Lencana Kemahiran</option>
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Markah / Skor (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={formData.score || 100}
                          onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Penerangan Tambahan</label>
                      <textarea
                        rows={2}
                        placeholder="Pencapaian cemerlang dalam pertandingan kuiz..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 7. ANNOUNCEMENTS SECTION FORM */}
                {section === 'announcements' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Pengumuman</label>
                      <input
                        required
                        placeholder="Contoh: Pembukaan Pendaftaran Kuiz Musim Baharu"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Kategori Pengumuman</label>
                        <select
                          value={formData.category || 'Umum'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="Umum">Umum</option>
                          <option value="Pertandingan">Pertandingan</option>
                          <option value="Akademik">Akademik</option>
                          <option value="Aktiviti">Aktiviti</option>
                          <option value="Sistem">Sistem</option>
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Sasaran Pembaca</label>
                        <select
                          value={formData.targetAudience || 'Semua'}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        >
                          <option value="Semua">Semua Pengguna</option>
                          <option value="Pelajar">Pelajar Sahaja</option>
                          <option value="Ibu Bapa">Ibu Bapa Sahaja</option>
                        </select>
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Kandungan Pengumuman</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tulis hebahan lengkap yang akan dipaparkan..."
                        value={formData.content || ''}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="staff-modal-footer">
                <button
                  className="staff-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button className="staff-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan ke Pangkalan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT RECORD ────────────────────────────────────────── */}
      {editingRecord && (
        <div className="staff-modal-overlay" onClick={() => setEditingRecord(null)}>
          <div
            className="staff-modal-container"
            style={{
              maxWidth: section === 'subjects' && editFormData.type === 'notes' ? '700px' : undefined,
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
                Edit {editingRecord.itemType === 'material' ? 'Bahan Pelajaran' : config.title}
              </h3>
              <button className="staff-modal-close" onClick={() => setEditingRecord(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="staff-modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, maxHeight: 'calc(90vh - 130px)' }}>
                {/* 1. SUBJECTS SECTION EDIT FORM */}
                {section === 'subjects' && (
                  <>
                    {editingRecord.itemType === 'material' ? (
                      <>
                        <div className="staff-form-group">
                          <label>Jenis Format Bahan</label>
                          <select
                            value={editFormData.type || 'notes'}
                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                          >
                            <option value="notes">✍️ Nota Bab (Tulis Sendiri)</option>
                            <option value="pdf">📄 Dokumen PDF / Nota Fail</option>
                            <option value="video">🎥 Pautan Video Pembelajaran</option>
                          </select>
                        </div>

                        {editFormData.type === 'notes' ? (
                          <>
                            <div className="staff-form-row">
                              <div className="staff-form-group">
                                <label>Pilih Subjek</label>
                                <select
                                  required
                                  value={editFormData.subjectId || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                                >
                                  <option value="">-- Pilih Subjek --</option>
                                  {meta?.subjects?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.title} ({s.category})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="staff-form-group">
                                <label>Pautkan ke Kuiz / Modul Bab (Pilihan)</label>
                                <select
                                  value={editFormData.quizId || ''}
                                  onChange={(e) => {
                                    const selectedQuiz = meta?.quizzes?.find((q) => q.id === e.target.value);
                                    setEditFormData({
                                      ...editFormData,
                                      quizId: e.target.value,
                                      chapterTitle: selectedQuiz ? selectedQuiz.title : editFormData.chapterTitle,
                                    });
                                  }}
                                >
                                  <option value="">-- Bebas (Bukan kuiz spesifik) --</option>
                                  {meta?.quizzes?.map((q) => (
                                    <option key={q.id} value={q.id}>
                                      {q.isTournament ? '🏆 ' : '📝 '}
                                      {q.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="staff-form-row">
                              <div className="staff-form-group">
                                <label>Nama Bab / Topik</label>
                                <input
                                  required
                                  placeholder="Contoh: Bab 1: Sistem Suria & Planet"
                                  value={editFormData.chapterTitle || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, chapterTitle: e.target.value })}
                                />
                              </div>

                              <div className="staff-form-group">
                                <label>Tajuk Modul Nota</label>
                                <input
                                  required
                                  placeholder="Contoh: Nota Ringkas: Sistem Suria"
                                  value={editFormData.title || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                              </div>
                            </div>

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
                                placeholder="Tulis ringkasan topik di sini..."
                                value={editFormData.summary || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                              />
                            </div>

                            {/* 2. Fakta & Konsep Penting */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>💡</span>
                                <strong>2. Fakta & Konsep Penting Wajib Tahu</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Masukkan 1 poin penting setiap baris baru.
                              </p>
                              <textarea
                                required
                                rows={4}
                                placeholder="Poin 1\nPoin 2\nPoin 3"
                                value={editFormData.keyPoints || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, keyPoints: e.target.value })}
                              />
                            </div>

                            {/* 3. Glosari Istilah & Formula Teras */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>✨</span>
                                <strong>3. Glosari Istilah & Formula Teras</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Format: <code>Istilah : Definisi</code> (1 per baris).
                              </p>
                              <textarea
                                rows={3}
                                placeholder="Istilah A : Definisi A\nIstilah B : Definisi B"
                                value={editFormData.formulaOrVocabulary || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, formulaOrVocabulary: e.target.value })}
                              />
                            </div>

                            {/* 4. Tip Rahsia Menjawab & Skor Kuiz */}
                            <div className="staff-form-group">
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>⭐</span>
                                <strong>4. Tip Rahsia Menjawab & Skor Kuiz</strong>
                              </label>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>
                                Tip mengingat, formula akronim atau teknik skor kuiz.
                              </p>
                              <textarea
                                rows={2}
                                placeholder="Tip Rahsia: Gunakan akronim..."
                                value={editFormData.examTip || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, examTip: e.target.value })}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="staff-form-group">
                              <label>Pilih Subjek</label>
                              <select
                                required
                                value={editFormData.subjectId || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                              >
                                <option value="">-- Pilih Subjek --</option>
                                {meta?.subjects?.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title} ({s.category})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="staff-form-group">
                              <label>Tajuk Bahan Pelajaran</label>
                              <input
                                required
                                placeholder="Contoh: Nota Pengenalan Bab 1"
                                value={editFormData.title || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              />
                            </div>
                            <div className="staff-form-row">
                              <div className="staff-form-group">
                                <label>Pautan URL / Fail</label>
                                <input
                                  required
                                  placeholder="https://..."
                                  value={editFormData.contentUrl || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, contentUrl: e.target.value })}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="staff-form-group">
                          <label>Tajuk Subjek</label>
                          <input
                            required
                            placeholder="Contoh: Pendidikan Islam, Sejarah, Robotik"
                            value={editFormData.title || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          />
                        </div>
                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label>Kategori Sekolah</label>
                            <select
                              value={editFormData.category || 'SK'}
                              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            >
                              <option value="SK">Sekolah Kebangsaan (SK)</option>
                              <option value="SMK">Sekolah Menengah (SMK)</option>
                            </select>
                          </div>
                        </div>
                        <div className="staff-form-group">
                          <label>Penerangan Subjek</label>
                          <textarea
                            rows={3}
                            placeholder="Ringkasan sukatan pelajaran..."
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* 2. QUESTIONS SECTION EDIT FORM */}
                {section === 'questions' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Kuiz / Modul</label>
                      <select
                        required
                        value={editFormData.quizId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, quizId: e.target.value })}
                      >
                        <option value="">-- Pilih Kuiz / Pertandingan Sasaran --</option>
                        {meta?.quizzes?.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.isTournament ? '🏆 [Pertandingan] ' : '📝 [Kuiz] '}
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
                        placeholder="Masukkan soalan di sini..."
                        value={editFormData.questionText || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, questionText: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilihan A</label>
                        <input
                          required
                          placeholder="Jawapan A"
                          value={editFormData.optA || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, optA: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan B</label>
                        <input
                          required
                          placeholder="Jawapan B"
                          value={editFormData.optB || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, optB: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Pilihan C</label>
                        <input
                          required
                          placeholder="Jawapan C"
                          value={editFormData.optC || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, optC: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Pilihan D</label>
                        <input
                          required
                          placeholder="Jawapan D"
                          value={editFormData.optD || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, optD: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Jawapan Betul</label>
                      <input
                        required
                        placeholder="Tulis jawapan betul sama tepat seperti pilihan di atas"
                        value={editFormData.correctAnswer || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, correctAnswer: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 3. COMPETITIONS SECTION EDIT FORM */}
                {section === 'competitions' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Pertandingan</label>
                      <input
                        required
                        placeholder="Contoh: Kejohanan Sains Astronomi Kebangsaan 2026"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Subjek Berkaitan</label>
                        <select
                          required
                          value={editFormData.subjectId || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                        >
                          <option value="">-- Pilih Subjek --</option>
                          {meta?.subjects?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} ({s.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Ikon Emoji</label>
                        <input
                          placeholder="🏆, 🥇, 🚀, ⚡, 🧠"
                          value={editFormData.emoji || '🏆'}
                          onChange={(e) => setEditFormData({ ...editFormData, emoji: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Tahap Kesukaran</label>
                        <select
                          value={editFormData.difficulty || 'SEDERHANA'}
                          onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                        >
                          <option value="MUDAH">MUDAH</option>
                          <option value="SEDERHANA">SEDERHANA</option>
                          <option value="SUKAR">SUKAR</option>
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Tempoh Menjawab (Minit)</label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={editFormData.durationMinutes || 15}
                          onChange={(e) => setEditFormData({ ...editFormData, durationMinutes: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Penerangan / Syarat Pertandingan</label>
                      <textarea
                        rows={3}
                        placeholder="Penerangan cabaran kuiz bertempoh..."
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(editFormData.isActive)}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        />
                        <span>Pertandingan Sedang Berlangsung (Aktif)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 4. PARENTS SECTION EDIT FORM */}
                {section === 'parents' && (
                  <>
                    <div className="staff-form-group">
                      <label>Nama Penuh Ibu Bapa / Penjaga</label>
                      <input
                        required
                        placeholder="Contoh: Mohd Firdaus bin Ismail"
                        value={editFormData.fullName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Alamat E-mel</label>
                        <input
                          required
                          type="email"
                          placeholder="firdaus@example.com"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Nombor Telefon</label>
                        <input
                          placeholder="012-3456789"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>No. Kad Pengenalan (Pilihan)</label>
                      <input
                        placeholder="850101-10-5555"
                        value={editFormData.icNumber || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, icNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* 5. STUDENTS SECTION EDIT FORM */}
                {section === 'students' && (
                  <>
                    <div className="staff-form-group">
                      <label>Pilih Ibu Bapa / Penjaga</label>
                      <select
                        required
                        value={editFormData.parentId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, parentId: e.target.value })}
                      >
                        <option value="">-- Pilih Penjaga Pelajar --</option>
                        {meta?.parents?.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="staff-form-group">
                      <label>Nama Penuh Pelajar</label>
                      <input
                        required
                        placeholder="Contoh: Danial bin Ahmad"
                        value={editFormData.fullName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label>Alamat E-mel Pelajar</label>
                      <input
                        type="email"
                        placeholder="danial@exploria.my"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Kategori Sekolah</label>
                        <select
                          value={editFormData.schoolType || 'SK'}
                          onChange={(e) => setEditFormData({ ...editFormData, schoolType: e.target.value })}
                        >
                          <option value="SK">Sekolah Rendah (SK)</option>
                          <option value="SMK">Sekolah Menengah (SMK)</option>
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label>Darjah / Tingkatan</label>
                        <input
                          required
                          placeholder="Contoh: Darjah 3 / Tingkatan 1"
                          value={editFormData.grade || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Nama Sekolah</label>
                        <input
                          placeholder="SK Bandar Baru"
                          value={editFormData.schoolName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label>Jantina</label>
                        <select
                          value={editFormData.gender || 'Lelaki'}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                        >
                          <option value="Lelaki">Lelaki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* 6. AWARDS & PHYSICAL ORDERS SECTION EDIT FORM */}
                {section === 'awards' && (
                  <>
                    {editingRecord.itemType === 'order' ? (
                      <>
                        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '13px' }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{editingRecord.name}</p>
                          <p style={{ margin: '3px 0 0', color: '#64748b' }}>{editingRecord.description}</p>
                          <p style={{ margin: '3px 0 0', color: '#475569' }}>📍 {editingRecord.deliveryAddress}</p>
                        </div>

                        <div className="staff-form-group">
                          <label>Status Pesanan</label>
                          <select
                            value={editFormData.status || 'Baru'}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          >
                            <option value="Baru">Baru</option>
                            <option value="Sedang Diproses">Sedang Diproses</option>
                            <option value="Telah Diposkan">Telah Diposkan</option>
                          </select>
                        </div>

                        <div className="staff-form-group">
                          <label>No. Tracking Kurier (PosLaju / J&T / NinjaVan)</label>
                          <input
                            placeholder="Contoh: MY1234567890"
                            value={editFormData.trackingNumber || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, trackingNumber: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="staff-form-group">
                          <label>Pilih Pelajar Penerima</label>
                          <select
                            required
                            value={editFormData.childId || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, childId: e.target.value })}
                          >
                            <option value="">-- Pilih Pelajar --</option>
                            {meta?.students?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.fullName} ({s.schoolType} {s.grade})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="staff-form-group">
                          <label>Nama Anugerah / Sijil</label>
                          <input
                            required
                            placeholder="Contoh: Johan Olimpiad Matematik Exploria 2026"
                            value={editFormData.title || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          />
                        </div>

                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label>Jenis Pengiktirafan</label>
                            <select
                              value={editFormData.type || 'badge'}
                              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                            >
                              <option value="badge">Lencana Kehormat</option>
                              <option value="medal_gold">Pingat Emas</option>
                              <option value="medal_silver">Pingat Perak</option>
                              <option value="medal_bronze">Pingat Gangsa</option>
                              <option value="certificate">Sijil Penghargaan</option>
                            </select>
                          </div>

                          <div className="staff-form-group">
                            <label>Skor / Markah (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editFormData.score ?? 100}
                              onChange={(e) => setEditFormData({ ...editFormData, score: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="staff-form-group">
                          <label>Nama Pertandingan / Catatan</label>
                          <input
                            placeholder="Contoh: Kuiz Matematik Pantas"
                            value={editFormData.competitionTitle || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, competitionTitle: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* 7. ANNOUNCEMENTS SECTION EDIT FORM */}
                {section === 'announcements' && (
                  <>
                    <div className="staff-form-group">
                      <label>Tajuk Pengumuman</label>
                      <input
                        required
                        placeholder="Contoh: Pendaftaran Kuiz Musim Baharu Telah Dibuka!"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label>Kategori</label>
                        <select
                          value={editFormData.category || 'Umum'}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        >
                          <option value="Umum">Umum</option>
                          <option value="Pertandingan">Pertandingan</option>
                          <option value="Akademik">Akademik</option>
                          <option value="Aktiviti">Aktiviti</option>
                          <option value="Sistem">Sistem</option>
                        </select>
                      </div>

                      <div className="staff-form-group">
                        <label>Sasaran Pembaca</label>
                        <select
                          value={editFormData.targetAudience || 'Semua'}
                          onChange={(e) => setEditFormData({ ...editFormData, targetAudience: e.target.value })}
                        >
                          <option value="Semua">Semua Pengguna</option>
                          <option value="Pelajar">Pelajar Sahaja</option>
                          <option value="Ibu Bapa">Ibu Bapa Sahaja</option>
                        </select>
                      </div>
                    </div>

                    <div className="staff-form-group">
                      <label>Kandungan Pengumuman</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tulis hebahan lengkap yang akan dipaparkan..."
                        value={editFormData.content || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                      />
                    </div>

                    <div className="staff-form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(editFormData.isActive)}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        />
                        <span>Pengumuman Aktif (Dipaparkan kepada pengguna)</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="staff-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  className="staff-btn-secondary"
                  onClick={() => setEditingRecord(null)}
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
    </div>
  );
}
