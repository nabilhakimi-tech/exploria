'use client'

export type SubjectId =
  | 'math'
  | 'science'
  | 'bahasa'
  | 'english'
  | 'history'
  | 'coding'
  | 'art'
  | 'music'
  | 'geography'
  | 'general'

export interface SubjectProgressInfo {
  ratio: number // 0.0 to 1.0 (lebar garisan, bukan angka peratus)
  status: 'not_started' | 'in_progress' | 'completed'
  completedSteps: number
  totalSteps: number
  lastUpdated?: number
}

export const CORE_SUBJECT_IDS: SubjectId[] = [
  'science',
  'math',
  'bahasa',
  'english',
  'history',
  'coding',
  'art',
  'music',
  'geography',
]

// Pemetaan eksplisit ID kuiz pangkalan data kepada ID subjek piawai
export const KNOWN_QUIZ_SUBJECT_MAP: Record<string, SubjectId> = {
  'ca111111-cccc-cccc-cccc-cccccccccccc': 'science',   // Cabaran Sains & Angkasa Lepas Kebangsaan 2026
  'ca222222-cccc-cccc-cccc-cccccccccccc': 'math',      // Olimpiad Matematik & Pantas Sifir Exploria 2026
  'ca333333-cccc-cccc-cccc-cccccccccccc': 'english',   // National Spelling & Vocabulary Grand Prix
  'ca444444-cccc-cccc-cccc-cccccccccccc': 'science',   // Kuiz Sains: Sistem Suria & Planet
  'ca555555-cccc-cccc-cccc-cccccccccccc': 'math',      // Kuiz Matematik: Pecahan & Sifir
  'ca666666-cccc-cccc-cccc-cccccccccccc': 'bahasa',    // Kuiz Bahasa Melayu: Simpulan Bahasa & Imbuhan
  'ca777777-cccc-cccc-cccc-cccccccccccc': 'english',   // English Word Adventure
  'ca888888-cccc-cccc-cccc-cccccccccccc': 'history',   // Kuiz Sejarah: Zaman Kesultanan & Tokoh Negara
  'ca999999-cccc-cccc-cccc-cccccccccccc': 'art',       // Kuiz Seni: Roda Warna & Asas Visual
  'caaaaaaa-cccc-cccc-cccc-cccccccccccc': 'geography', // Kuiz Geografi: Alam Semulajadi & Malaysia
  'cabbbbbb-cccc-cccc-cccc-cccccccccccc': 'music',     // Kuiz Muzik: Irama, Tempo & Alat Tradisional
}

export function detectSubjectFromText(
  subjectTitle: string = '',
  quizTitle: string = '',
  modId?: string
): SubjectId {
  // 1. Semak pemetaan ID modul langsung jika wujud
  if (modId && KNOWN_QUIZ_SUBJECT_MAP[modId]) {
    return KNOWN_QUIZ_SUBJECT_MAP[modId]
  }

  const combined = `${subjectTitle} ${quizTitle} ${modId || ''}`.toLowerCase()

  if (
    combined.includes('sejarah') ||
    combined.includes('history') ||
    combined.includes('tokoh') ||
    combined.includes('kemerdekaan') ||
    combined.includes('kesultanan') ||
    combined.includes('melaka')
  ) {
    return 'history'
  }

  if (
    combined.includes('matematik') ||
    combined.includes('math') ||
    combined.includes('sifir') ||
    combined.includes('kalkulator') ||
    combined.includes('olimpiad') ||
    combined.includes('pecahan')
  ) {
    return 'math'
  }

  if (
    combined.includes('sains') ||
    combined.includes('science') ||
    combined.includes('planet') ||
    combined.includes('angkasa') ||
    combined.includes('suria')
  ) {
    return 'science'
  }

  const isEnglish =
    combined.includes('inggeris') ||
    combined.includes('english') ||
    combined.includes('vocabulary') ||
    combined.includes('spelling') ||
    combined.includes('word')
  if (isEnglish) {
    return 'english'
  }

  if (
    combined.includes('melayu') ||
    combined.includes('simpulan') ||
    combined.includes('imbuhan') ||
    combined.includes('tatabahasa') ||
    (combined.includes('bahasa') && !isEnglish)
  ) {
    return 'bahasa'
  }

  if (
    combined.includes('muzik') ||
    combined.includes('music') ||
    combined.includes('irama') ||
    combined.includes('tempo') ||
    combined.includes('lagu')
  ) {
    return 'music'
  }

  if (
    combined.includes('seni') ||
    combined.includes('art') ||
    combined.includes('visual') ||
    combined.includes('lukisan') ||
    combined.includes('warna')
  ) {
    return 'art'
  }

  if (
    combined.includes('geografi') ||
    combined.includes('geography') ||
    combined.includes('bumi') ||
    combined.includes('alam')
  ) {
    return 'geography'
  }

  if (
    combined.includes('coding') ||
    combined.includes('komputer') ||
    combined.includes('pengaturcaraan') ||
    combined.includes('algoritma') ||
    combined.includes('logik')
  ) {
    return 'coding'
  }

  return 'general'
}

export function getAllSubjectsProgress(): Record<string, SubjectProgressInfo> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = localStorage.getItem('exploria_subject_progress_v2')
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {}

  return {}
}

export function recordStepCompletion(
  subjectId: SubjectId,
  modId: string,
  step: 'read' | 'visual' | 'video' | 'quiz',
  options?: {
    isModuleComplete?: boolean
    score?: number
    passed?: boolean
    modTitle?: string
    subjectTitle?: string
  }
): Record<string, SubjectProgressInfo> {
  if (typeof window === 'undefined') return {}

  try {
    // 1. Kemas kini rekod modul individu
    const rawMod = localStorage.getItem('exploria_modules_progress') || '{}'
    const modMap = JSON.parse(rawMod)
    const existingMod = modMap[modId] || { read: false, visual: false, video: false, quiz: false }

    const updatedMod = {
      ...existingMod,
      [step]: true,
      modId,
      subjectId,
      title: options?.modTitle || existingMod.title || '',
      subject: options?.subjectTitle || existingMod.subject || '',
      lastUpdated: Date.now(),
      ...(options || {}),
    }

    modMap[modId] = updatedMod
    localStorage.setItem('exploria_modules_progress', JSON.stringify(modMap))

    // 2. Kemas kini rekod subjek keseluruhan
    const currentSubjectMap = getAllSubjectsProgress()

    // Kira langkah yang sudah selesai untuk modul ini (4 langkah: read, visual, video, quiz)
    const stepsDone = [updatedMod.read, updatedMod.visual, updatedMod.video, updatedMod.quiz].filter(Boolean).length

    // Jika quiz selesai atau semua 4 langkah selesai, subjek ini selesai sepenuhnya (100%)
    const isCompleted =
      Boolean(options?.isModuleComplete) ||
      stepsDone >= 4 ||
      step === 'quiz' ||
      Boolean(updatedMod.quiz)

    let newRatio = isCompleted ? 1.0 : stepsDone / 4

    const newStatus: 'not_started' | 'in_progress' | 'completed' =
      newRatio >= 1.0 ? 'completed' : newRatio > 0 ? 'in_progress' : 'not_started'

    const updatedSubjectInfo: SubjectProgressInfo = {
      ratio: Math.min(newRatio, 1.0),
      status: newStatus,
      completedSteps: isCompleted ? 4 : stepsDone,
      totalSteps: 4,
      lastUpdated: Date.now(),
    }

    const newSubjectMap = {
      ...currentSubjectMap,
      [subjectId]: updatedSubjectInfo,
    }

    // Segerakkan juga alias lazim (sejarah, sains, dll)
    if (subjectId === 'history') newSubjectMap['sejarah'] = updatedSubjectInfo
    if (subjectId === 'science') newSubjectMap['sains'] = updatedSubjectInfo
    if (subjectId === 'math') newSubjectMap['matematik'] = updatedSubjectInfo
    if (subjectId === 'bahasa') newSubjectMap['melayu'] = updatedSubjectInfo

    localStorage.setItem('exploria_subject_progress_v2', JSON.stringify(newSubjectMap))

    // Beritahu tab atau komponen lain bahawa kemajuan telah dikemas kini
    window.dispatchEvent(
      new CustomEvent('exploria_progress_changed', {
        detail: { subjectId, progress: updatedSubjectInfo },
      })
    )

    return newSubjectMap
  } catch (err) {
    console.error('Ralat mengemas kini kemajuan subjek:', err)
    return {}
  }
}

