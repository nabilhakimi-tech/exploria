'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StudentSubjectLinks, type StudentSubjectId } from '@/components/student/StudentNavLinks'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Flame,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trophy,
  Video,
  X,
  XCircle,
  Zap,
  ArrowRight,
  Volume2,
  VolumeX,
  GraduationCap,
  Check,
  FolderOpen,
  Layers,
  Eye,
  ImageIcon,
  Maximize2,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUp,
} from 'lucide-react'
import { gameSound } from '@/lib/gameSound'
import LevelUpModal from '@/components/student/LevelUpModal'
import { recordStepCompletion, detectSubjectFromText } from '@/lib/subjectProgress'

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  correctAnswer?: string
}

export interface LessonMaterial {
  id: string
  title: string
  type: string
  contentUrl: string
}

export interface StudyTopicNote {
  summary: string
  keyPoints: string[]
  formulaOrVocabulary?: string[]
  examTip: string
}

export interface ModuleMedia {
  diagramType: 'solar' | 'fractions' | 'grammar' | 'english' | 'history' | 'coding' | 'general'
  diagramTitle: string
  diagramCaption: string
  keyLabels: { label: string; desc: string; icon: string; color: string }[]
  videoUrl: string
  videoTitle: string
  videoSummary: string
}

export type LearningModule = {
  id: string
  title: string
  subject: string
  difficulty: 'MUDAH' | 'SEDERHANA' | 'SUKAR'
  emoji: string
  accent: string
  author: string
  stars: number
  durationMinutes: number
  tags: string[]
  questions: QuizQuestion[]
  materials: LessonMaterial[]
  studyNotes: StudyTopicNote
  media: ModuleMedia
}

const difficultyStyle: Record<string, string> = {
  MUDAH: 'bg-blue-100 text-blue-900 border border-blue-200',
  SEDERHANA: 'bg-blue-600 text-white font-bold',
  SUKAR: 'bg-slate-900 text-white font-bold',
}

function detectSubjectTags(subjectTitle: string, quizTitle: string): StudentSubjectId[] {
  const combined = `${subjectTitle} ${quizTitle}`.toLowerCase()
  const tags: StudentSubjectId[] = []
  if (combined.includes('matematik') || combined.includes('math') || combined.includes('sifir') || combined.includes('kalkulator') || combined.includes('olimpiad')) {
    tags.push('math')
  }
  if (combined.includes('sains') || combined.includes('science') || combined.includes('planet') || combined.includes('angkasa') || combined.includes('suria')) {
    tags.push('science')
  }
  if (combined.includes('sejarah') || combined.includes('history') || combined.includes('tokoh') || combined.includes('kemerdekaan') || combined.includes('melaka')) {
    tags.push('history')
  }
  if (combined.includes('seni') || combined.includes('art') || combined.includes('warna') || combined.includes('lukisan') || combined.includes('kraf')) {
    tags.push('art')
  }
  if (combined.includes('inggeris') || combined.includes('english') || combined.includes('vocabulary') || combined.includes('spelling') || combined.includes('word')) {
    tags.push('english')
  }
  const isEnglishSubject = combined.includes('inggeris') || combined.includes('english') || combined.includes('vocabulary') || combined.includes('spelling')
  if (!isEnglishSubject && (combined.includes('melayu') || combined.includes('bahasa') || combined.includes('simpulan') || combined.includes('imbuhan') || combined.includes('tatabahasa'))) {
    tags.push('bahasa')
  } else if (combined.includes('melayu')) {
    tags.push('bahasa')
  }
  if (combined.includes('muzik') || combined.includes('music') || combined.includes('irama') || combined.includes('lagu') || combined.includes('kompang')) {
    tags.push('music')
  }
  if (combined.includes('geografi') || combined.includes('geography') || combined.includes('gunung') || combined.includes('sungai') || combined.includes('bumi')) {
    tags.push('geography')
  }
  if (combined.includes('coding') || combined.includes('komputer') || combined.includes('pengaturcaraan') || combined.includes('algoritma')) {
    tags.push('coding')
  }
  return tags.length > 0 ? tags : ['science']
}

function generateStudyNotes(title: string, subject: string): StudyTopicNote {
  const t = `${title} ${subject}`.toLowerCase()

  if (t.includes('sains') || t.includes('planet') || t.includes('suria') || t.includes('angkasa')) {
    return {
      summary: 'Sistem Suria kita terdiri daripada Matahari sebagai pusat tarikan graviti dan 8 buah planet yang beredar mengelilinginya mengikut orbit masing-masing.',
      keyPoints: [
        'Matahari adalah bintang yang mengeluarkan haba dan cahaya sendiri.',
        'Urutan 8 Planet: Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun.',
        'Utarid adalah planet paling dekat dengan Matahari, manakala Musytari adalah planet terbesar.',
        'Bumi adalah satu-satunya planet yang diketahui mempunyai kehidupan dan air cecair.',
      ],
      formulaOrVocabulary: [
        'Orbit: Laluan peredaran planet mengelilingi matahari.',
        'Graviti: Daya tarikan semulajadi antara objek berjisim.',
        'Atmosfera: Lapisan gas yang menyelimuti sesebuah planet.',
      ],
      examTip: 'Tip Mengingat: Gunakan akronim "U-Z-B-M-M-Z-U-N" (Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun)!',
    }
  }

  if (t.includes('matematik') || t.includes('pecahan') || t.includes('sifir') || t.includes('olimpiad')) {
    return {
      summary: 'Pecahan mewakili bahagian daripada suatu keseluruhan. Penguasaan sifir pantas membolehkan penyelesaian operasi tambah, tolak, darab dan bahagi dilakukan dengan pantas.',
      keyPoints: [
        'Pecahan terdiri daripada Pengangka (nombor atas) dan Penyebut (nombor bawah).',
        'Sebelum menambah atau menolak pecahan, pastikan penyebutnya disamakan terlebih dahulu.',
        'Sifir adalah pendaraban berulang bagi nombor yang sama.',
        'Pecahan wajar mempunyai pengangka lebih kecil daripada penyebut (cth: 3/4).',
      ],
      formulaOrVocabulary: [
        'Pengangka: Bilangan bahagian yang diambil/dinyatakan.',
        'Penyebut: Jumlah keseluruhan bahagian yang sama rata.',
        'Pecahan Setara: Pecahan berlainan nombor tetapi sama nilai (cth: 1/2 = 2/4 = 4/8).',
      ],
      examTip: 'Sentiasa permudahkan jawapan pecahan kepada bentuk termudah (bahagikan pengangka dan penyebut dengan faktor sepunya terbesar).',
    }
  }

  if (t.includes('simpulan') || t.includes('melayu') || t.includes('imbuhan') || t.includes('tatabahasa')) {
    return {
      summary: 'Simpulan bahasa ialah ungkapan ringkas yang terdiri daripada dua perkataan atau lebih yang membawa maksud tersirat dan kiasan indah dalam Bahasa Melayu.',
      keyPoints: [
        'Simpulan bahasa digunakan untuk menyampaikan nasihat, kiasan, atau pengajaran secara sopan.',
        'Ringan tulang bermaksud orang yang rajin bekerja atau gemar membantu.',
        'Otak cair bermaksud orang yang sangat pandai, cerdik dan cepat memahami pelajaran.',
        'Ulat buku bermaksud orang yang sangat gemar membaca buku di mana-mana jua.',
      ],
      formulaOrVocabulary: [
        'Kata Nama: Kata yang menamakan orang, haiwan, tempat atau benda.',
        'Imbuhan Awalan: Imbuhan di hadapan kata dasar seperti meN-, ber-, ter-.',
        'Kiasan: Perbandingan halus untuk menyampaikan makna kiasan.',
      ],
      examTip: 'Jangan terjemahkan simpulan bahasa secara literal (cth: ulat buku bukan ulat sebenar, tetapi orang yang rajin membaca).',
    }
  }

  if (t.includes('inggeris') || t.includes('english') || t.includes('spelling') || t.includes('vocabulary')) {
    return {
      summary: 'Mastering English vocabulary and sentence structures allows you to express ideas confidently, write imaginative essays, and score high marks in comprehension.',
      keyPoints: [
        'Nouns are words used to identify people, places, or things (e.g. astronaut, school).',
        'Verbs describe actions or states of being (e.g. explore, read, launch).',
        'Adjectives describe the qualities of nouns (e.g. brave, brilliant, astronomical).',
        'Past tense indicates actions that already happened (e.g. played, studied).',
      ],
      formulaOrVocabulary: [
        'Synonyms: Words that have the same or similar meaning (e.g. happy = joyful).',
        'Antonyms: Words that have opposite meanings (e.g. brave vs timid).',
        'Compound Words: Two words joined together (e.g. star + fish = starfish).',
      ],
      examTip: 'Always check subject-verb agreement: Singular subjects take singular verbs (He explores), plural subjects take plural verbs (They explore)!',
    }
  }

  if (t.includes('sejarah') || t.includes('melaka') || t.includes('merdeka') || t.includes('tokoh')) {
    return {
      summary: 'Ketahui zaman kegemilangan Kesultanan Melayu Melaka yang diasaskan oleh Parameswara serta detik bersejarah kemerdekaan Tanah Melayu pada tahun 1957.',
      keyPoints: [
        'Parameswara mengasaskan Melaka sekitar tahun 1400 di muara Sungai Bertam.',
        'Nama Melaka diambil bersempena Pokok Melaka tempat baginda berehat.',
        'Bendahara Tun Perak merupakan pentadbir dan pakar strategi tentera terulung Melaka.',
        'Tanah Melayu mencapai kemerdekaan pada 31 Ogos 1957 diisytiharkan oleh Tunku Abdul Rahman.',
      ],
      formulaOrVocabulary: [
        'Bapa Kemerdekaan: Gelaran kehormat kepada Tunku Abdul Rahman Putra Al-Haj.',
        'Pelabuhan Entrepôt: Pelabuhan persinggahan dagangan antarabangsa.',
        'Hukum Kanun Melaka: Undang-undang bertulis pertama di Melaka.',
      ],
      examTip: 'Ingat tarikh penting: 31 Ogos 1957 (Kemerdekaan) dan 16 September 1963 (Pembentukan Malaysia).',
    }
  }

  if (t.includes('coding') || t.includes('komputer') || t.includes('algoritma') || t.includes('logik')) {
    return {
      summary: 'Pemikiran Komputasional membolehkan kita menyelesaikan masalah secara logik menggunakan algoritma berurutan, pengecaman corak, dan carta alir.',
      keyPoints: [
        'Algoritma ialah satu siri langkah terperinci untuk menyelesaikan sesuatu masalah atau tugasan.',
        'Pseudokod menggunakan ayat ringkas untuk menerangkan arahan atur cara.',
        'Carta alir menggunakan simbol geometri standard untuk menggambarkan aliran proses.',
        'Pepijat (Bug) ialah ralat atau kesilapan dalam sesuatu algoritma.',
      ],
      formulaOrVocabulary: [
        'Input: Data yang dimasukkan ke dalam sistem komputer.',
        'Output: Maklumat yang dipaparkan setelah diproses.',
        'Carta Alir (Flowchart): Rajah visual simbolik aliran algoritma.',
      ],
      examTip: 'Pastikan setiap carta alir mempunyai titik mula (Start) dan titik tamat (End) yang jelas.',
    }
  }

  if (t.includes('seni') || t.includes('art') || t.includes('warna') || t.includes('lukisan')) {
    return {
      summary: 'Pendidikan Seni Visual mengasah daya kreativiti dan ekspresi diri melalui penguasaan roda warna, bentuk, jalinan dan teknik gubahan.',
      keyPoints: [
        'Warna Primer ialah warna asas yang tidak boleh dihasilkan melalui campuran warna lain: Merah, Biru, Kuning.',
        'Warna Sekunder terhasil daripada campuran dua warna primer (Merah + Kuning = Jingga, Biru + Kuning = Hijau).',
        'Garisan, jalinan dan rupa memberi identiti visual serta tekstur kepada karya seni.',
        'Imaginasi dan ketelitian menghasilkan karya seni yang unik dan bernilai tinggi.',
      ],
      formulaOrVocabulary: [
        'Warna Primer: Merah, Kuning, Biru.',
        'Warna Sekunder: Hijau, Jingga, Ungu.',
        'Jalinan Sentuh: Permukaan yang boleh dirasa teksturnya seperti kulit pokok atau kain.',
      ],
      examTip: 'Ingat campuran warna primer asas: Biru + Kuning = Hijau, Merah + Biru = Ungu!',
    }
  }

  if (t.includes('muzik') || t.includes('music') || t.includes('irama') || t.includes('tempo') || t.includes('lagu')) {
    return {
      summary: 'Pendidikan Muzik meneroka keindahan melodi, harmoni, detik rentak dan ekspresi vokal yang menceriakan jiwa dan minda.',
      keyPoints: [
        'Tempo ialah ukuran kelajuan sesuatu detik lagu (lambat, sederhana, pantas).',
        'Pic ialah ketinggian atau kerendahan bunyi sesuatu not muzik.',
        'Alat perkusi dikelaskan kepada alat bermelodi (Glockenspiel) dan tidak bermelodi (Kompang, Kerincing).',
        'Dinamik merujuk kepada kekuatan bunyi lagu sama ada lembut atau lantang.',
      ],
      formulaOrVocabulary: [
        'Tempo: Kelajuan detik rentak lagu (Allegro = Pantas, Adagio = Perlahan).',
        'Pic: Tinggi atau rendah ton muzik.',
        'Alat Perkusi: Kompang, tamburin, kastenet, dan gendang.',
      ],
      examTip: 'Kompang dan kerincing ialah alat muzik perkusi tidak berpic kerana tidak menghasilkan not tangga melodi.',
    }
  }

  if (t.includes('geografi') || t.includes('geography') || t.includes('bumi') || t.includes('benua') || t.includes('alam')) {
    return {
      summary: 'Geografi membolehkan kita meneroka ciri-ciri fizikal bumi, bentuk muka bumi tanah tinggi dan sungai, serta kepelbagaian 7 benua dunia.',
      keyPoints: [
        'Terdapat 7 benua utama di dunia: Asia, Afrika, Amerika Utara, Amerika Selatan, Antartika, Eropah, dan Oceania.',
        'Bentuk muka bumi Malaysia merangkumi tanah tinggi, tanah pamah, lembangan sungai, dan pinggir laut yang indah.',
        'Gunung Kinabalu di Sabah ialah puncak tertinggi di Malaysia (4,095 meter).',
        'Sungai Rajang di Sarawak ialah sungai terpanjang di Malaysia (563 km).',
      ],
      formulaOrVocabulary: [
        'Benua: Daratan tanah sangat luas yang dikelilingi oleh lautan.',
        'Puncak Tertinggi Malaysia: Gunung Kinabalu (4,095m).',
        'Sungai Terpanjang: Sungai Rajang (563 km).',
      ],
      examTip: 'Benua terbesar di dunia ialah Benua Asia, manakala lautan terluas ialah Lautan Pasifik.',
    }
  }

  return {
    summary: 'Modul pembelajaran ini merangkumi konsep teras, fakta penting, dan latihan untuk membantu anda menguasai subjek ini dengan cemerlang.',
    keyPoints: [
      'Baca nota konsep asas terlebih dahulu sebelum menjawab soalan latihan.',
      'Kenal pasti kata kunci utama dalam setiap subtopik.',
      'Latihan secara berkala akan mengukuhkan ingatan jangka panjang.',
    ],
    formulaOrVocabulary: [
      'Konsep Asas: Fakta permulaan yang perlu difahami.',
      'Aplikasi: Cara menggunakan konsep dalam soalan.',
    ],
    examTip: 'Sentiasa baca arahan soalan dengan teliti sebelum memilih jawapan.',
  }
}

function generateModuleMedia(title: string, subject: string): ModuleMedia {
  const t = `${title} ${subject}`.toLowerCase()

  if (t.includes('sains') || t.includes('planet') || t.includes('suria') || t.includes('angkasa')) {
    return {
      diagramType: 'solar',
      diagramTitle: 'Infografik Sistem Suria & Urutan 8 Buah Planet',
      diagramCaption: 'Matahari sebagai pusat tarikan graviti bersama 8 planet yang beredar mengikut orbit elips masing-masing.',
      keyLabels: [
        { label: 'Matahari', desc: 'Bintang pusat bercahaya sendiri dengan tarikan graviti terkuat', icon: '☀️', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Planet Berbatu', desc: 'Utarid, Zuhrah, Bumi & Marikh (Planet pepejal berdekatan)', icon: '🌍', color: 'bg-sky-100 text-sky-900 border-sky-300' },
        { label: 'Gergasi Gas', desc: 'Musytari & Zuhal (Planet terbesar dengan gelang cincin megah)', icon: '🪐', color: 'bg-orange-100 text-orange-900 border-orange-300' },
        { label: 'Gergasi Ais', desc: 'Uranus & Neptun (Planet paling sejuk dan terjauh di hujung)', icon: '❄️', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/libKJY6cgbo',
      videoTitle: 'Eksplorasi Angkasa: Kenali Sistem Suria & Planet Kita',
      videoSummary: 'Tonton video animasi ini untuk melihat peredaran 8 planet mengelilingi matahari dan bagaimana daya tarikan graviti berfungsi.',
    }
  }

  if (t.includes('matematik') || t.includes('pecahan') || t.includes('sifir') || t.includes('olimpiad')) {
    return {
      diagramType: 'fractions',
      diagramTitle: 'Carta Visual Pecahan & Matriks Sifir Pantas',
      diagramCaption: 'Pecahan adalah sebahagian daripada suatu bulatan penuh (1/2 separuh, 1/4 suku, 3/4 tiga suku).',
      keyLabels: [
        { label: '1/2 (Separuh)', desc: 'Satu bahagian daripada dua bahagian yang sama rata', icon: '🌓', color: 'bg-blue-100 text-blue-900 border-blue-300' },
        { label: '1/4 (Suku)', desc: 'Satu bahagian daripada empat bahagian sama rata (25%)', icon: '🍰', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { label: '3/4 (Tiga Suku)', desc: 'Tiga bahagian daripada empat bahagian (75%)', icon: '🥧', color: 'bg-purple-100 text-purple-900 border-purple-300' },
        { label: 'Trik Sifir 9', desc: 'Gunakan jari tangan: Jari yang dilipat menentukan digit puluh dan sa', icon: '✋', color: 'bg-amber-100 text-amber-900 border-amber-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/n0F6hSNCblg',
      videoTitle: 'Teknik Mudah & Pantas Mengingati Sifir & Pecahan',
      videoSummary: 'Kuasai konsep pecahan asas dan cara menyelesaikan soalan operasi sifir dengan cepat dan tepat!',
    }
  }

  if (t.includes('simpulan') || t.includes('melayu') || t.includes('tatabahasa') || t.includes('imbuhan')) {
    return {
      diagramType: 'grammar',
      diagramTitle: 'Peta Minda Golongan Kata & Imbuhan Awalan',
      diagramCaption: 'Bahasa Melayu dibina daripada gabungan Kata Nama, Kata Kerja dan Kata Adjektif untuk membentuk ayat lengkap.',
      keyLabels: [
        { label: 'Kata Nama', desc: 'Nama manusia, haiwan, benda atau tempat (cth: murid, kucing, sekolah)', icon: '🧑', color: 'bg-violet-100 text-violet-900 border-violet-300' },
        { label: 'Kata Kerja', desc: 'Perbuatan atau tindakan aktif (cth: membaca, berlari, menulis)', icon: '🏃', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { label: 'Kata Adjektif', desc: 'Sifat atau keadaan sesuatu benda (cth: cerdik, pantas, indah)', icon: '✨', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Imbuhan meN-', desc: 'me- + lukis = melukis, mem- + beli = membeli', icon: '✏️', color: 'bg-pink-100 text-pink-900 border-pink-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/Zz_p4G0j_0o',
      videoTitle: 'Animasi Pembelajaran: Kuasai Tatabahasa & Simpulan Bahasa',
      videoSummary: 'Ketahui maksud simpulan bahasa popular seperti ringan tulang dan ulat buku melalui penceritaan kartun yang ceria.',
    }
  }

  if (t.includes('inggeris') || t.includes('english') || t.includes('spelling') || t.includes('vocabulary')) {
    return {
      diagramType: 'english',
      diagramTitle: 'Illustrated Word Bank & Sentence Builder',
      diagramCaption: 'Learn English parts of speech: Nouns, Verbs, and Adjectives with picture associations.',
      keyLabels: [
        { label: 'Action Verbs', desc: 'Words that express physical movement: Jump, Swim, Read, Sing', icon: '🏊', color: 'bg-sky-100 text-sky-900 border-sky-300' },
        { label: 'Descriptive Words', desc: 'Adjectives describing color, size or emotion: Happy, Huge, Bright', icon: '🎨', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
        { label: 'Common Nouns', desc: 'Naming words for people, animals, places: Astronaut, Rocket, Planet', icon: '🚀', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
        { label: 'Connectors', desc: 'Joining words like "and", "because", "but" to create complete sentences', icon: '🔗', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/wpT4Q_77oE8',
      videoTitle: 'Fun English Vocabulary & Spelling for Kids',
      videoSummary: 'Listen to native pronunciation, phonics rhythm and practice speaking with interactive animated characters.',
    }
  }

  if (t.includes('sejarah') || t.includes('melaka') || t.includes('merdeka') || t.includes('tokoh')) {
    return {
      diagramType: 'history',
      diagramTitle: 'Peta Laluan Maritim Melaka & Garis Masa Kemerdekaan',
      diagramCaption: 'Pelabuhan entrepot Melaka sebagai pusat perdagangan dunia dan detik bersejarah kemerdekaan 1957.',
      keyLabels: [
        { label: 'Tahun 1400', desc: 'Parameswara mengasaskan Melaka di muara Sungai Bertam', icon: '👑', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Pelabuhan Entrepot', desc: 'Persinggahan kapal dagang rempah dari India, Arab & China', icon: '⛵', color: 'bg-blue-100 text-blue-900 border-blue-300' },
        { label: '31 Ogos 1957', desc: 'Laungan "Merdeka!" oleh Tunku Abdul Rahman di Stadium Merdeka', icon: '🇲🇾', color: 'bg-rose-100 text-rose-900 border-rose-300' },
        { label: '16 September 1963', desc: 'Pembentukan Persekutuan Malaysia (Tanah Melayu, Sabah & Sarawak)', icon: '🏛️', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      ],
      videoUrl: 'https://www.youtube.com/embed/9Yc5uv3ru1w',
      videoTitle: 'Kisah Pengasasan Melaka: Parameswara & Kesultanan Melayu Melaka',
      videoSummary: 'Saksikan animasi sejarah perjuangan Parameswara mengasaskan Melaka dan zaman kegemilangannya.',
    }
  }

  if (t.includes('coding') || t.includes('komputer') || t.includes('algoritma') || t.includes('logik')) {
    return {
      diagramType: 'coding',
      diagramTitle: 'Gambar Rajah Carta Alir & Simbol Logik Standard',
      diagramCaption: 'Algoritma adalah susunan langkah logik demi langkah untuk menyelesaikan sesuatu tugasan.',
      keyLabels: [
        { label: 'Mula / Tamat (Oval)', desc: 'Menandakan titik permulaan atau penamat sesebuah algoritma', icon: '🟢', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { label: 'Input / Output (Jajarangjang)', desc: 'Menerima data daripada pengguna atau memaparkan hasil', icon: '📥', color: 'bg-sky-100 text-sky-900 border-sky-300' },
        { label: 'Proses (Segi Empat Tepat)', desc: 'Tindakan pengiraan atau pemprosesan dalam ingatan', icon: '⚙️', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
        { label: 'Syarat / Keputusan (Rombus)', desc: 'Pilihan logik Ya atau Tidak (Contoh: Adakah markah >= 50?)', icon: '❓', color: 'bg-amber-100 text-amber-900 border-amber-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/e_60p_s6q88',
      videoTitle: 'Bagaimana Komputer Berfikir: Asas Algoritma & Coding',
      videoSummary: 'Pelajari asas sains komputer dengan visual robot yang mengikut arahan algoritma langkah demi langkah.',
    }
  }

  if (t.includes('seni') || t.includes('art') || t.includes('warna') || t.includes('lukisan')) {
    return {
      diagramType: 'general',
      diagramTitle: 'Roda Warna Asas & Campuran Warna Sekunder',
      diagramCaption: 'Campuran warna primer menghasilkan warna sekunder yang menceriakan karya seni lukisan.',
      keyLabels: [
        { label: 'Warna Primer', desc: 'Merah, Kuning, Biru (Warna asas)', icon: '🔴', color: 'bg-rose-100 text-rose-900 border-rose-300' },
        { label: 'Campuran Oren', desc: 'Merah + Kuning = Jingga / Oren', icon: '🟠', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Campuran Hijau', desc: 'Biru + Kuning = Hijau Daun', icon: '🟢', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { label: 'Campuran Ungu', desc: 'Merah + Biru = Ungu Diraja', icon: '🟣', color: 'bg-purple-100 text-purple-900 border-purple-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/libKJY6cgbo',
      videoTitle: 'Panduan Asas Seni: Mengenali Warna & Melukis',
      videoSummary: 'Pelajari cara mencampur warna dan menghasilkan bayang-bayang lukisan yang hidup.',
    }
  }

  if (t.includes('muzik') || t.includes('music') || t.includes('irama') || t.includes('tempo')) {
    return {
      diagramType: 'general',
      diagramTitle: 'Carta Not Muzik, Irama & Tempo Rentak',
      diagramCaption: 'Detik rentak berulang dan variasi tempo membentuk keharmonian sesebuah lagu.',
      keyLabels: [
        { label: 'Tempo Pantas (Allegro)', desc: 'Rentak pantas dan bertenaga penuh semangat', icon: '⚡', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Tempo Perlahan (Adagio)', desc: 'Rentak tenang dan mendamaikan jiwa', icon: '🍃', color: 'bg-sky-100 text-sky-900 border-sky-300' },
        { label: 'Pic Tinggi & Rendah', desc: 'Ketinggian ton nada melodi yang dimainkan', icon: '🎼', color: 'bg-purple-100 text-purple-900 border-purple-300' },
        { label: 'Perkusi Tradisional', desc: 'Kompang, gong dan gendang rentak warisan', icon: '🥁', color: 'bg-orange-100 text-orange-900 border-orange-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/libKJY6cgbo',
      videoTitle: 'Dunia Muzik: Belajar Rentak, Tempo & Not Asas',
      videoSummary: 'Ketahui cara mengecam tempo laju dan perlahan serta memainkan instrumen perkusi.',
    }
  }

  if (t.includes('geografi') || t.includes('geography') || t.includes('bumi') || t.includes('benua')) {
    return {
      diagramType: 'general',
      diagramTitle: 'Peta 7 Benua Dunia & Ciri Bentuk Muka Bumi Malaysia',
      diagramCaption: 'Bumi dibahagikan kepada 7 benua utama yang dipisahkan oleh 5 lautan besar dunia.',
      keyLabels: [
        { label: 'Benua Asia', desc: 'Benua terbesar dengan penduduk teramai di dunia', icon: '🌏', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { label: 'Lautan Pasifik', desc: 'Lautan terluas dan terdalam di muka bumi', icon: '🌊', color: 'bg-blue-100 text-blue-900 border-blue-300' },
        { label: 'Tanah Tinggi', desc: 'Banjaran Titiwangsa & Gunung Kinabalu (4,095m)', icon: '🏔️', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { label: 'Lembangan Sungai', desc: 'Sungai Rajang & Sungai Kinabatangan sumber air tawar', icon: '🏞️', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
      ],
      videoUrl: 'https://www.youtube-nocookie.com/embed/libKJY6cgbo',
      videoTitle: 'Meneroka Benua Dunia & Alam Semula Jadi Bumi',
      videoSummary: 'Saksikan pemandangan satelit bumi dan lokasi 7 benua utama dunia.',
    }
  }

  return {
    diagramType: 'general',
    diagramTitle: 'Peta Minda Konsep & Fakta Utama Modul',
    diagramCaption: 'Fahami perkaitan antara konsep teras dan bagaimana fakta diaplikasikan dalam latihan kuiz.',
    keyLabels: [
      { label: 'Konsep Asas', desc: 'Pemahaman fakta utama yang menjadi asas topik ini', icon: '💡', color: 'bg-blue-100 text-blue-900 border-blue-300' },
      { label: 'Aplikasi Harian', desc: 'Bagaimana ilmu ini digunakan dalam kehidupan seharian', icon: '🌱', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      { label: 'Latihan Praktikal', desc: 'Uji kemahiran melalui contoh soalan berformat peperiksaan', icon: '🎯', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/libKJY6cgbo',
    videoTitle: 'Video Penerangan Konsep & Tip Mengingat Pantas',
    videoSummary: 'Tonton video ini untuk mengukuhkan pemahaman sebelum menjawab kuiz interaktif.',
  }
}

export type LearningStepType = 'read' | 'visual' | 'video' | 'quiz'

export interface ModuleProgress {
  read: boolean
  visual: boolean
  video: boolean
  quiz: boolean
  score?: number
  passed?: boolean
}

export interface SubjectCardItem {
  id: StudentSubjectId
  name: string
  shortLabel: string
  icon: string
  difficulty: string
  difficultyBadgeColor: string
  description: string
  defaultCompleted: number
  totalCount: number
  cardBg: string
  borderColor: string
  progressFillColor: string
  btnBg: string
  btnShadow: string
  charImg: string
}

export const SUBJECTS_DATA: SubjectCardItem[] = [
  {
    id: 'math',
    name: 'Matematik',
    shortLabel: 'Matematik',
    icon: '➕➖➗',
    difficulty: 'Tahap Mudah',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Jom belajar nombor, bentuk, tambah, tolak dan banyak lagi!',
    defaultCompleted: 3,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/matematik-char.png',
  },
  {
    id: 'science',
    name: 'Sains',
    shortLabel: 'Sains',
    icon: '🧪',
    difficulty: 'Tahap Sederhana',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Terokai dunia yang menakjubkan melalui eksperimen dan penerokaan!',
    defaultCompleted: 6,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/sains-char.png',
  },
  {
    id: 'bahasa',
    name: 'Bahasa Melayu',
    shortLabel: 'B. Melayu',
    icon: '📖',
    difficulty: 'Tahap Mudah',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Kenal huruf, perkataan dan ayat bahasa kebangsaan kita.',
    defaultCompleted: 4,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/bahasa-melayu-char.png',
  },
  {
    id: 'english',
    name: 'English',
    shortLabel: 'English',
    icon: '🔤',
    difficulty: 'Tahap Sederhana',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Learn new words, read stories and speak with confidence!',
    defaultCompleted: 5,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/english-char.png',
  },
  {
    id: 'history',
    name: 'Sejarah',
    shortLabel: 'Sejarah',
    icon: '🏰',
    difficulty: 'Tahap Mudah',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Kenali tokoh, peristiwa dan warisan negara kita.',
    defaultCompleted: 3,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/sejarah-char.png',
  },
  {
    id: 'art',
    name: 'Seni',
    shortLabel: 'Seni',
    icon: '🎨',
    difficulty: 'Tahap Mudah',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Gunakan imaginasi dan cipta karya yang menakjubkan!',
    defaultCompleted: 4,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/seni-char.png',
  },
  {
    id: 'music',
    name: 'Muzik',
    shortLabel: 'Muzik',
    icon: '🎵',
    difficulty: 'Tahap Sederhana',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Dengar, main dan cipta muzik yang menyeronokkan!',
    defaultCompleted: 2,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/muzik-char.png',
  },
  {
    id: 'geography',
    name: 'Geografi',
    shortLabel: 'Geografi',
    icon: '🌍',
    difficulty: 'Tahap Mudah',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Terokai benua, negara dan keindahan dunia!',
    defaultCompleted: 3,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/geografi-char.png',
  },
  {
    id: 'coding',
    name: 'Coding',
    shortLabel: 'Coding',
    icon: '💻',
    difficulty: 'Tahap Sederhana',
    difficultyBadgeColor: 'bg-blue-600',
    description: 'Fikir, bina dan cipta aplikasi dengan logik!',
    defaultCompleted: 4,
    totalCount: 10,
    cardBg: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]/50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    progressFillColor: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnShadow: 'shadow-[0_4px_0_#1d4ed8]',
    charImg: '/subjects/coding-char.png',
  },
]

export default function StudentLearningPage() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | StudentSubjectId>('all')
  const [search, setSearch] = useState('')

  // Check URL query parameter to filter directly by subject when navigated from Home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const subParam = params.get('subject') as StudentSubjectId | null
      if (subParam) {
        setActiveFilter(subParam)
      }
    }
  }, [])

  // Module Progress Map (persisted locally so students see their progress)
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('exploria_modules_progress')
        if (stored) {
          setProgressMap(JSON.parse(stored))
        }
      } catch {}
    }
  }, [])

  const saveModuleStepProgress = (
    modId: string,
    step: LearningStepType,
    extraData?: { score?: number; passed?: boolean }
  ) => {
    const mod = modules.find((m) => m.id === modId) || activeModule
    const detectedSub = mod
      ? detectSubjectFromText(mod.subject, mod.title, modId)
      : detectSubjectFromText('', '', modId)

    setProgressMap((prev) => {
      const existing = prev[modId] || { read: false, visual: false, video: false, quiz: false }
      const updated: ModuleProgress = {
        ...existing,
        [step]: true,
        ...(extraData || {}),
      }
      const newMap = { ...prev, [modId]: updated }
      try {
        // Simpan rekod lengkap dengan subjectId dan tajuk modul
        const rawSaved = localStorage.getItem('exploria_modules_progress')
        const fullModMap = rawSaved ? JSON.parse(rawSaved) : {}
        fullModMap[modId] = {
          ...fullModMap[modId],
          ...updated,
          modId,
          subjectId: detectedSub,
          subject: mod?.subject || '',
          title: mod?.title || '',
          lastUpdated: Date.now(),
        }
        localStorage.setItem('exploria_modules_progress', JSON.stringify(fullModMap))
      } catch {}
      return newMap
    })

    // Segerakkan dengan progress subjek global (untuk Halaman Utama sentiasa dikemas kini secara real-time)
    try {
      const isModuleFinished = step === 'quiz'
      recordStepCompletion(detectedSub, modId, step, {
        isModuleComplete: isModuleFinished,
        score: extraData?.score,
        passed: extraData?.passed,
        modTitle: mod?.title,
        subjectTitle: mod?.subject,
      })
    } catch (e) {
      console.warn('Gagal menyegerakkan status subjek ke Utama:', e)
    }
  }

  // Active Interactive Learning Studio State (Unified Cisco-Style Player)
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null)
  const [activeStep, setActiveStep] = useState<LearningStepType>('read')
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // Quiz State within the studio
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [scoreCount, setScoreCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [isSubmittingToDb, setIsSubmittingToDb] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false)
  const [levelUpModalData, setLevelUpModalData] = useState<{
    newLevel: number
    previousLevel?: number
    coinReward?: number
  } | null>(null)

  useEffect(() => {
    async function fetchLearningData() {
      try {
        const res = await fetch('/api/student/quizzes')
        const json = await res.json()
        if (json.success) {
          const mapped: LearningModule[] = json.data.map((q: {
            id: string
            title: string
            subjectTitle: string
            difficulty: string
            emoji: string
            durationMinutes: number
            materials?: LessonMaterial[]
            questions?: { id: number; question: string; options: string[]; correctIndex: number }[]
          }) => {
            const subjectTags = detectSubjectTags(q.subjectTitle || '', q.title || '')
            const studyNotes = generateStudyNotes(q.title || '', q.subjectTitle || '')
            const media = generateModuleMedia(q.title || '', q.subjectTitle || '')
            return {
              id: q.id,
              title: q.title,
              subject: q.subjectTitle || 'Umum',
              difficulty: (q.difficulty as 'MUDAH' | 'SEDERHANA' | 'SUKAR') || 'MUDAH',
              emoji: q.emoji || '📖',
              accent: 'linear-gradient(180deg,#0284c7,#1d4ed8)',
              author: 'Exploria',
              stars: 5,
              durationMinutes: q.durationMinutes || 10,
              tags: ['all', ...subjectTags],
              materials: q.materials || [],
              studyNotes,
              media,
              questions: q.questions && q.questions.length > 0 ? q.questions : [
                {
                  id: 1,
                  question: `Apakah konsep utama dalam ${q.title}?`,
                  options: ['Pemahaman asas & fakta penting', 'Latihan rawak tanpa panduan', 'Tiada jawapan tepat', 'Hafalan tanpa tujuan'],
                  correctIndex: 0,
                },
                {
                  id: 2,
                  question: 'Bagaimanakah kita dapat menguasai topik ini dengan baik?',
                  options: ['Latihan konsisten & teliti bahan', 'Membaca sekali sahaja', 'Mengabaikan soalan sukar', 'Tidur lewat malam'],
                  correctIndex: 0,
                },
              ],
            }
          })

          const hasCoding = mapped.some((m: LearningModule) => m.tags.includes('coding'))
          if (!hasCoding) {
            mapped.push({
              id: 'mod-coding-algoritma-1',
              title: 'Pengenalan Algoritma & Carta Alir Komputer',
              subject: 'Coding & Logik SK',
              difficulty: 'MUDAH',
              emoji: '💻',
              accent: 'linear-gradient(180deg,#0284c7,#1d4ed8)',
              author: 'Exploria Tech',
              stars: 5,
              durationMinutes: 5,
              tags: ['all', 'coding'],
              materials: [],
              studyNotes: generateStudyNotes('Coding & Algoritma', 'Coding SK'),
              media: generateModuleMedia('Coding & Algoritma', 'Coding SK'),
              questions: [
                {
                  id: 1,
                  question: 'Apakah definisi bagi Algoritma dalam bidang sains komputer?',
                  options: [
                    'Satu siri langkah teratur untuk menyelesaikan sesuatu masalah',
                    'Alat peranti keras seperti tetikus dan papan kekunci',
                    'Bahasa pertuturan manusia seharian',
                    'Permainan video semata-mata',
                  ],
                  correctIndex: 0,
                },
                {
                  id: 2,
                  question: 'Simbol bentuk apakah yang digunakan untuk menunjukkan permulaan dan penamat dalam carta alir?',
                  options: ['Bujur (Oval/Terminal)', 'Segi empat tepat', 'Rombus (Berlian)', 'Segi tiga'],
                  correctIndex: 0,
                },
              ],
            })
          }

          const hasArt = mapped.some((m: LearningModule) => m.tags.includes('art'))
          if (!hasArt) {
            mapped.push({
              id: 'mod-seni-kreatif-1',
              title: 'Asas Warna, Bentuk & Seni Visual Kreatif',
              subject: 'Pendidikan Seni Visual SK',
              difficulty: 'MUDAH',
              emoji: '🎨',
              accent: 'linear-gradient(180deg,#9333ea,#7e22ce)',
              author: 'Exploria Art Studio',
              stars: 5,
              durationMinutes: 8,
              tags: ['all', 'art'],
              materials: [],
              studyNotes: generateStudyNotes('Pendidikan Seni', 'Seni Visual SK'),
              media: generateModuleMedia('Pendidikan Seni', 'Seni Visual SK'),
              questions: [
                {
                  id: 1,
                  question: 'Manakah antara berikut merupakan warna primer (warna asas)?',
                  options: ['Merah, Biru dan Kuning', 'Hijau, Jingga dan Ungu', 'Hitam, Putih dan Kelabu', 'Coklat, Emas dan Perak'],
                  correctIndex: 0,
                },
                {
                  id: 2,
                  question: 'Apakah warna sekunder yang terhasil apabila warna Biru dicampur dengan Kuning?',
                  options: ['Hijau', 'Jingga', 'Ungu', 'Coklat'],
                  correctIndex: 0,
                },
              ],
            })
          }

          const hasMusic = mapped.some((m: LearningModule) => m.tags.includes('music'))
          if (!hasMusic) {
            mapped.push({
              id: 'mod-muzik-irama-1',
              title: 'Eksplorasi Irama, Tempo & Not Muzik Riang',
              subject: 'Pendidikan Muzik SK',
              difficulty: 'SEDERHANA',
              emoji: '🎵',
              accent: 'linear-gradient(180deg,#06b6d4,#0891b2)',
              author: 'Exploria Music Hall',
              stars: 5,
              durationMinutes: 7,
              tags: ['all', 'music'],
              materials: [],
              studyNotes: generateStudyNotes('Pendidikan Muzik', 'Muzik SK'),
              media: generateModuleMedia('Pendidikan Muzik', 'Muzik SK'),
              questions: [
                {
                  id: 1,
                  question: 'Apakah yang dimaksudkan dengan Tempo dalam sesebuah lagu?',
                  options: ['Kelajuan detik atau rentak sesuatu lagu', 'Kekuatan suara penyanyi', 'Lirik yang ditulis pengarang', 'Warna pakaian pemuzik'],
                  correctIndex: 0,
                },
                {
                  id: 2,
                  question: 'Antara berikut, manakah merupakan alat perkusi tradisional yang dipalu?',
                  options: ['Kompang', 'Seruling', 'Gitar akustik', 'Biola'],
                  correctIndex: 0,
                },
              ],
            })
          }

          const hasGeography = mapped.some((m: LearningModule) => m.tags.includes('geography'))
          if (!hasGeography) {
            mapped.push({
              id: 'mod-geografi-bumi-1',
              title: 'Kenali Bentuk Muka Bumi & 7 Benua Dunia',
              subject: 'Geografi & Alam Sekitar SK',
              difficulty: 'MUDAH',
              emoji: '🌍',
              accent: 'linear-gradient(180deg,#14b8a6,#0d9488)',
              author: 'Exploria Geo Explorer',
              stars: 5,
              durationMinutes: 10,
              tags: ['all', 'geography'],
              materials: [],
              studyNotes: generateStudyNotes('Geografi Dunia', 'Geografi SK'),
              media: generateModuleMedia('Geografi Dunia', 'Geografi SK'),
              questions: [
                {
                  id: 1,
                  question: 'Berapakah jumlah benua utama yang terdapat di dunia?',
                  options: ['7 Benua', '4 Benua', '10 Benua', '5 Benua'],
                  correctIndex: 0,
                },
                {
                  id: 2,
                  question: 'Apakah puncak gunung tertinggi yang terdapat di Malaysia?',
                  options: ['Gunung Kinabalu (Sabah)', 'Gunung Tahan (Pahang)', 'Gunung Ledang (Johor)', 'Gunung Jerai (Kedah)'],
                  correctIndex: 0,
                },
              ],
            })
          }

          setModules(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch learning modules:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLearningData()
  }, [])

  const activeSubject: StudentSubjectId | null = activeFilter === 'all' ? null : activeFilter

  const selectSubject = (subjectId: StudentSubjectId) => {
    setActiveFilter((current) => (current === subjectId ? 'all' : subjectId))
  }

  const visibleModules = modules.filter((mod) => {
    const matchesFilter = activeFilter === 'all' || mod.tags.includes(activeFilter)
    const term = search.trim().toLocaleLowerCase('ms')
    const matchesSearch =
      !term || `${mod.title} ${mod.subject} ${mod.studyNotes.summary}`.toLocaleLowerCase('ms').includes(term)
    return matchesFilter && matchesSearch
  })

  const displayedSubjects = SUBJECTS_DATA.filter((sub) => {
    const matchesFilter = activeFilter === 'all' || activeFilter === sub.id
    const term = search.trim().toLowerCase()
    if (!term) return matchesFilter

    const subMatches = sub.name.toLowerCase().includes(term) || sub.description.toLowerCase().includes(term)
    const modMatches = modules.some(
      (m) =>
        m.tags.includes(sub.id) &&
        (m.title.toLowerCase().includes(term) || m.studyNotes.summary.toLowerCase().includes(term))
    )
    return matchesFilter && (subMatches || modMatches)
  })

  // Open Unified Studio
  const handleOpenStudio = (mod: LearningModule, startStep: LearningStepType = 'read') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsAudioPlaying(false)
    setActiveModule(mod)
    setActiveStep(startStep)
    setCurrentQIndex(0)
    setQuizAnswers({})
    setScoreCount(0)
    setQuizFinished(false)
    setShowConfirmSubmitModal(false)
    gameSound.playTileClick()

    // Segerakkan kemajuan modul yang sedia ada jika pelajar menyambung langkah sebelumnya
    try {
      const existingP = progressMap[mod.id]
      if (existingP && (existingP.read || existingP.visual || existingP.video || existingP.quiz)) {
        const detectedSub = detectSubjectFromText(mod.subject, mod.title, mod.id)
        const lastStep: LearningStepType = existingP.quiz
          ? 'quiz'
          : existingP.video
          ? 'video'
          : existingP.visual
          ? 'visual'
          : 'read'
        recordStepCompletion(detectedSub, mod.id, lastStep, {
          isModuleComplete: existingP.quiz && existingP.passed !== false,
          score: existingP.score,
          passed: existingP.passed,
          modTitle: mod.title,
          subjectTitle: mod.subject,
        })
      }
    } catch {}

    // Trigger mission m1 (study material) in backend
    fetch('/api/student/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'study_material', xpAmount: 20, topicTitle: mod.title }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.leveledUp) {
          setLevelUpModalData({
            newLevel: json.data.newLevel,
            previousLevel: json.data.previousLevel,
            coinReward: 100,
          })
        }
      })
      .catch(() => {})
  }

  const handleCloseStudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsAudioPlaying(false)
    setActiveModule(null)
  }

  // Auto-buka studio pembelajaran bagi subjek yang dipilih daripada Halaman Utama
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  useEffect(() => {
    if (modules.length === 0 || hasAutoOpened || typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const subParam = params.get('subject') as StudentSubjectId | null
    const autoOpenParam = params.get('autoOpen')

    // Buka secara automatik jika ada parameter subject (kecuali jika autoOpen=false secara eksplisit)
    if (subParam && (subParam as string) !== 'all' && autoOpenParam !== 'false' && autoOpenParam !== '0') {
      setHasAutoOpened(true)

      const matching = modules.filter((m) => {
        if (subParam === 'bahasa') {
          return m.tags.includes('bahasa') && !m.tags.includes('english')
        }
        if (subParam === 'english') {
          return m.tags.includes('english')
        }
        return (
          m.tags.includes(subParam) ||
          m.id.toLowerCase().includes(subParam) ||
          m.subject.toLowerCase().includes(subParam)
        )
      })

      if (matching.length > 0) {
        // Cari modul yang sedang tergendala dahulu jika ada
        const inProgressMod = matching.find((m) => {
          const p = progressMap[m.id]
          return p && (p.read || p.visual || p.video || p.quiz) && !p.passed
        })
        const targetMod = inProgressMod || matching[0]

        // Tentukan langkah yang perlu disambung
        let resumeStep: LearningStepType = 'read'
        const p = progressMap[targetMod.id]
        if (p) {
          if (!p.read) resumeStep = 'read'
          else if (!p.visual) resumeStep = 'visual'
          else if (!p.video) resumeStep = 'video'
          else if (!p.quiz) resumeStep = 'quiz'
        }

        handleOpenStudio(targetMod, resumeStep)
      }
    }
  }, [modules, hasAutoOpened, progressMap])

  // Text-To-Speech Reader
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isAudioPlaying) {
      window.speechSynthesis.cancel()
      setIsAudioPlaying(false)
      return
    }

    if (!activeModule) return

    window.speechSynthesis.cancel()
    const textToRead = `${activeModule.title}. ${activeModule.studyNotes.summary}. Antara fakta penting: ${activeModule.studyNotes.keyPoints.join('. ')}. Tip peperiksaan: ${activeModule.studyNotes.examTip}`
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'ms-MY'
    utterance.rate = 0.95
    utterance.onend = () => setIsAudioPlaying(false)
    utterance.onerror = () => setIsAudioPlaying(false)

    window.speechSynthesis.speak(utterance)
    setIsAudioPlaying(true)
  }

  // Pengendalian Kuiz: Jawab dahulu tanpa tahu betul/salah, sahkan di akhir dan dapat keputusan penuh
  const handleSelectQuizOption = (idx: number) => {
    if (quizFinished) return
    setQuizAnswers((prev) => ({
      ...prev,
      [currentQIndex]: idx,
    }))
    gameSound.playTileClick()
  }

  const handlePrevQuizQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1)
      gameSound.playTileClick()
    }
  }

  const handleNextQuizQuestion = () => {
    if (!activeModule) return
    if (currentQIndex < activeModule.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1)
      gameSound.playTileClick()
    }
  }

  const handleJumpToQuestion = (idx: number) => {
    if (!activeModule) return
    if (idx >= 0 && idx < activeModule.questions.length) {
      setCurrentQIndex(idx)
      gameSound.playTileClick()
    }
  }

  // Pengesahan dan penghantaran akhir kuiz
  const handleConfirmAndFinishQuiz = () => {
    if (!activeModule) return

    const totalQ = activeModule.questions.length
    let correctCount = 0
    activeModule.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })

    setScoreCount(correctCount)
    const calculatedXp = Math.max(correctCount * 25, 30)
    const finalScore = Math.round((correctCount / totalQ) * 100)
    const passed = finalScore >= 50
    setXpEarned(calculatedXp)
    setQuizFinished(true)
    setShowConfirmSubmitModal(false)

    if (passed) {
      gameSound.playVictory()
    } else {
      gameSound.playWrong()
    }

    // Rekod langkah kuiz selesai dalam rekod kemajuan
    saveModuleStepProgress(activeModule.id, 'quiz', { score: finalScore, passed })

    setIsSubmittingToDb(true)
    fetch('/api/student/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: activeModule.id,
        score: finalScore,
        passed,
        xpEarned: calculatedXp,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setIsSubmittingToDb(false)
        if (json.success && json.data?.leveledUp) {
          setLevelUpModalData({
            newLevel: json.data.newLevel,
            previousLevel: json.data.previousLevel,
            coinReward: 100 + (json.data.newLevel - 2) * 50,
          })
        }
      })
      .catch(() => {
        setIsSubmittingToDb(false)
      })
  }

  const handleRetakeQuiz = () => {
    setCurrentQIndex(0)
    setQuizAnswers({})
    setScoreCount(0)
    setQuizFinished(false)
    setShowConfirmSubmitModal(false)
    gameSound.playTileClick()
  }

  // Active module's current progress
  const activeModProgress = activeModule ? progressMap[activeModule.id] || { read: false, visual: false, video: false, quiz: false } : { read: false, visual: false, video: false, quiz: false }
  const completedStepsCount = [activeModProgress.read, activeModProgress.visual, activeModProgress.video, activeModProgress.quiz].filter(Boolean).length
  const progressPercent = Math.round((completedStepsCount / 4) * 100)

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-slate-900 pb-16">
      {/* Banner Tajuk Pusat Pembelajaran - Saiz Selesa & Seimbang (75% Skala Asal) */}
      <header className="relative border-b border-blue-200 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#1d4ed8] text-white px-5 py-6 sm:px-8 sm:py-7 shadow-md overflow-hidden">
        {/* Subtle Ambient Radial Lights */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-88 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-88 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl pr-28 sm:pr-36">
          {/* Baris 1: Butang Kembali */}
          <div className="mb-3">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Home</span>
            </Link>
          </div>

          {/* Baris 2: Ikon Buku & Tajuk Utama Pusat Pembelajaran */}
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.2]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Pembelajaran
            </h1>
          </div>
        </div>
      </header>

      {/* Top Header & Search Bar - Format Pill & Ikon Seakan Gambar 1 */}
      <section aria-label="Carian dan Navigasi Subjek" className="border-b border-blue-100 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-3.5 shadow-xs sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-col lg:flex-row items-center gap-3">
          {/* Carian Input Pill */}
          <label className="relative flex h-11 w-full shrink-0 items-center lg:w-[260px]">
            <Search className="absolute left-3.5 h-4 w-4 text-blue-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari subjek atau topik..."
              className="h-full w-full rounded-full bg-slate-50 pl-10 pr-4 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/25 border border-slate-200 transition-all shadow-inner"
            />
          </label>

          {/* Filter Pills - "Semua" + 9 Subjek seperti Gambar 1 */}
          <nav className="flex w-full items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5" aria-label="Navigasi Subjek Pelajar">
            {/* Butang "Semua" */}
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex h-12 min-w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl px-2.5 transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/25 ring-2 ring-blue-300 scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-semibold shadow-xs'
              }`}
            >
              <span className="text-base leading-none">⭐</span>
              <span className="text-[11px] font-bold mt-1">Semua</span>
            </button>

            {/* 9 Subjek Pills */}
            {SUBJECTS_DATA.map((sub) => {
              const isActive = activeFilter === sub.id
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSubject(sub.id)}
                  className={`flex h-12 min-w-[74px] shrink-0 flex-col items-center justify-center rounded-2xl px-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/25 ring-2 ring-blue-300 scale-105'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-semibold shadow-xs'
                  }`}
                >
                  <span className="text-base leading-none">{sub.icon}</span>
                  <span className="text-[11px] font-bold mt-1">{sub.shortLabel}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 space-y-6">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white px-5 py-16 text-center shadow-xs">
            <h3 className="font-bold text-slate-800 text-base">Memuatkan Bahan Pembelajaran...</h3>
            <p className="text-xs text-slate-400 mt-1">Sila tunggu sebentar.</p>
          </div>
        ) : displayedSubjects.length > 0 ? (
          <>
            {/* Grid 9 Subjek Utama Seakan Gambar 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedSubjects.map((sub) => {
                const subModules = modules.filter((m) => m.tags.includes(sub.id))
                const inProgressMod = subModules.find((m) => {
                  const p = progressMap[m.id]
                  return p && (p.read || p.visual || p.video || p.quiz) && !p.passed
                })
                const targetMod = inProgressMod || subModules[0]

                // Hitung kemajuan sebenar subjek ini
                const completedCount = subModules.filter((m) => progressMap[m.id]?.passed).length
                const displayCompleted = Math.max(completedCount, sub.defaultCompleted)
                const progressRatio = `${displayCompleted}/${sub.totalCount}`
                const progressPercent = Math.min(Math.round((displayCompleted / sub.totalCount) * 100), 100)

                return (
                  <article
                    key={sub.id}
                    className={`group relative flex overflow-hidden rounded-3xl border-2 ${sub.borderColor} bg-gradient-to-br ${sub.cardBg} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-200/50`}
                  >
                    {/* Kandungan Kiri: Lencana, Tajuk, Penerangan, Progress Bar, Butang Mula Belajar */}
                    <div className="flex flex-1 flex-col justify-between p-4.5 sm:p-5 pr-2 z-10">
                      <div>
                        {/* Lencana Tahap (Semua Biru) */}
                        <div className="mb-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs ${sub.difficultyBadgeColor}`}
                          >
                            <span>⭐</span>
                            <span>{sub.difficulty}</span>
                          </span>
                        </div>

                        {/* Tajuk Subjek */}
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                          {sub.name}
                        </h2>

                        {/* Penerangan Ringkas */}
                        <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      {/* Bahagian Bawah: Progress Bar & Butang Tactile (Semua Biru) */}
                      <div className="mt-4 space-y-3">
                        {/* Bar Kemajuan Mini ⭐ [======] X/10 */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">⭐</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-900/10">
                            <div
                              className={`h-full rounded-full ${sub.progressFillColor} transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-slate-700 shrink-0">
                            {progressRatio}
                          </span>
                        </div>

                        {/* Butang Mula Belajar → (Semua Biru) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (targetMod) {
                              const p = progressMap[targetMod.id]
                              const step = !p?.read ? 'read' : !p?.visual ? 'visual' : !p?.video ? 'video' : 'quiz'
                              handleOpenStudio(targetMod, step)
                            }
                          }}
                          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 px-4 text-xs font-black text-white ${sub.btnBg} ${sub.btnShadow} active:translate-y-1 active:shadow-none transition-all cursor-pointer`}
                        >
                          <span>Mula Belajar</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ilustrasi Watak Kartun di Sebelah Kanan (Kemaskan dengan rounded frame berlatar putih & border biru) */}
                    <div className="relative w-32 sm:w-36 md:w-32 lg:w-36 shrink-0 self-center m-2 sm:m-3 rounded-2xl overflow-hidden border border-blue-200/80 bg-white shadow-xs flex items-center justify-center select-none pointer-events-none aspect-square sm:aspect-auto sm:self-stretch">
                      <img
                        src={sub.charImg}
                        alt={sub.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Jika terdapat topik khusus bagi subjek yang dipilih, paparkan senarai topik di bawah */}
            {activeFilter !== 'all' && (
              <section className="mt-8 pt-6 border-t border-blue-200/60">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>Modul Pembelajaran &amp; Kuiz Topik ({visibleModules.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Lihat Semua Subjek
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleModules.map((mod) => {
                    const prog = progressMap[mod.id] || { read: false, visual: false, video: false, quiz: false }
                    const stepCount = [prog.read, prog.visual, prog.video, prog.quiz].filter(Boolean).length
                    const cardPercent = Math.round((stepCount / 4) * 100)
                    const isFinished = cardPercent === 100

                    return (
                      <div
                        key={mod.id}
                        onClick={() =>
                          handleOpenStudio(
                            mod,
                            isFinished ? 'read' : !prog.read ? 'read' : !prog.visual ? 'visual' : !prog.video ? 'video' : 'quiz'
                          )
                        }
                        className="p-4 rounded-2xl bg-white border border-blue-100 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                              {mod.subject}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">{mod.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">{mod.studyNotes.summary}</p>
                          </div>
                          <span className="text-2xl shrink-0">{mod.emoji}</span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            {isFinished ? '✅ Selesai' : `${cardPercent}% Siap`}
                          </span>
                          <span className="text-xs font-black text-blue-600 flex items-center gap-1">
                            Buka <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Banner Motivasi & Butang Kembali ke Atas seperti Gambar 1 */}
            <div className="mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-100/60 pb-8">
              <div className="w-full sm:w-auto flex-1 rounded-full bg-gradient-to-r from-blue-50 via-sky-100/60 to-blue-50 border border-blue-200/70 px-5 py-2.5 text-center text-xs sm:text-sm font-black text-blue-900 shadow-xs">
                ⭐ Setiap Minda Kecil, Mampu Melakukan Perkara Besar! ⭐
              </div>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                <span>Kembali ke Atas</span>
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center shadow-xs">
            <Search className="mx-auto h-10 w-10 text-blue-300" />
            <h3 className="mt-3 font-bold text-slate-800 text-base">Tiada subjek atau topik dijumpai</h3>
            <p className="mt-1 text-xs text-slate-500">Sila cuba kata carian lain atau klik butang di bawah untuk melihat semua subjek.</p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all')
                setSearch('')
              }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              Tunjukkan Semua Subjek
            </button>
          </div>
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UNIFIED CISCO-STYLE INTERACTIVE LEARNING STUDIO MODAL         */}
      {/* (BACAAN + GAMBAR RAJAH + VIDEO + KUIZ DALAM SATU ALIRAN)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeModule && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto"
          onClick={handleCloseStudio}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-modal-title"
            className="relative my-auto w-full max-w-4xl rounded-3xl border-2 border-blue-400/40 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-900 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. STUDIO HEADER: Topic Info + Step Checklist Tracker */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-5 sm:p-6 text-white shrink-0">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-sky-300/20 blur-2xl" />

              {/* Top Row: Meta Tags & Close */}
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-black uppercase text-white border border-white/25 shadow-xs">
                    {activeModule.subject}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${difficultyStyle[activeModule.difficulty]}`}>
                    Tahap {activeModule.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* TTS Speech Trigger (Step 1 Reading) */}
                  {activeStep === 'read' && (
                    <button
                      type="button"
                      onClick={toggleSpeech}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                        isAudioPlaying
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300 animate-pulse'
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/25'
                      }`}
                      title="Dengar bacaan nota secara bersuara"
                    >
                      {isAudioPlaying ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5" /> Berhenti Suara
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" /> Dengar Suara 🔊
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseStudio}
                    aria-label="Tutup Studio"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/25 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title & Progress Bar Row */}
              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-3xl shadow-md">
                    {activeModule.emoji}
                  </div>
                  <div>
                    <h2 id="studio-modal-title" className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">
                      {activeModule.title}
                    </h2>
                  </div>
                </div>

                {/* Progress Pill with Real-time Percentage */}
                <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shrink-0 self-start sm:self-auto min-w-[170px]">
                  <div className="flex items-center justify-between text-xs font-black text-white mb-1">
                    <span>Kemajuan Modul</span>
                    <span className="text-white font-black">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-blue-900/40 border border-white/20">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CISCO-STYLE INTERACTIVE 4-STEP TRACKER BAR */}
            <div className="bg-slate-100 px-3 sm:px-6 py-2.5 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {/* Step 1: Membaca */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('read')
                    gameSound.playTileClick()
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeStep === 'read'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : activeModProgress.read
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="hidden sm:inline">1. Membaca</span>
                  <span className="sm:hidden">1. Baca</span>
                  {activeModProgress.read && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                </button>

                {/* Step 2: Gambar Rajah */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('visual')
                    gameSound.playTileClick()
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeStep === 'visual'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : activeModProgress.visual
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="hidden sm:inline">2. Gambar</span>
                  <span className="sm:hidden">2. Gambar</span>
                  {activeModProgress.visual && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                </button>

                {/* Step 3: Video */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('video')
                    gameSound.playTileClick()
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeStep === 'video'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : activeModProgress.video
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="hidden sm:inline">3. Video</span>
                  <span className="sm:hidden">3. Video</span>
                  {activeModProgress.video && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                </button>

                {/* Step 4: Kuiz */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('quiz')
                    gameSound.playTileClick()
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeStep === 'quiz'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : activeModProgress.quiz
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="hidden sm:inline">4. Kuiz</span>
                  <span className="sm:hidden">4. Kuiz</span>
                  {activeModProgress.quiz && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                </button>
              </div>
            </div>

            {/* 3. SCROLLABLE LEARNING STAGE CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 scroll-smooth bg-[#f0f6fc]">
              
              {/* ───────────────────────────────────────────────────────────── */}
              {/* LANGKAH 1: MEMBACA (NOTA PADAT & KONSEP TERAS)                */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeStep === 'read' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Summary Box */}
                  <section className="rounded-3xl border-2 border-blue-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                    <h3 className="text-base font-black text-slate-900">
                      Konsep Utama
                    </h3>

                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      {activeModule.studyNotes.summary}
                    </p>
                  </section>

                  {/* Key Fact Points */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">
                        Fakta
                      </h3>
                      <span className="text-xs font-bold text-slate-500">
                        {activeModule.studyNotes.keyPoints.length} Poin Utama
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeModule.studyNotes.keyPoints.map((point, i) => (
                        <div
                          key={i}
                          className="flex flex-col justify-center rounded-2xl p-4 sm:p-4.5 border border-slate-200 bg-white shadow-xs"
                        >
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>



                  {/* Step Completion Action Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        saveModuleStepProgress(activeModule.id, 'read')
                        setActiveStep('visual')
                        gameSound.playTileClick()
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Tandakan Selesai Baca &amp; Terus ke Gambar Rajah ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* LANGKAH 2: MELIHAT GAMBAR (INFOGRAFIK & VISUAL BERWARNA)      */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeStep === 'visual' && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <section className="rounded-3xl border-2 border-blue-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="border-b border-blue-100 pb-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        {activeModule.media.diagramTitle}
                      </h3>
                    </div>

                    {/* Dynamic Visual Diagram Canvas (Dikecilkan supaya muat sepenuhnya dalam skrin) */}
                    <div className="relative rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-slate-900 to-blue-950 p-3 sm:p-4 text-white text-center overflow-hidden min-h-[110px] sm:min-h-[120px] max-w-2xl mx-auto flex flex-col items-center justify-center">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0,transparent_70%)]" />

                      {/* Specialized Interactive Visual per Diagram Type */}
                      {activeModule.media.diagramType === 'solar' && (
                        <div className="relative flex flex-col items-center justify-center space-y-2 w-full">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-2xl sm:text-3xl animate-pulse" title="Matahari">☀️</span>
                            <span className="h-0.5 w-4 bg-amber-400/50 rounded-full" />
                            <span className="text-xl" title="Utarid">🪐</span>
                            <span className="text-xl" title="Zuhrah">🟡</span>
                            <span className="text-2xl animate-bounce" title="Bumi">🌍</span>
                            <span className="text-xl" title="Marikh">🔴</span>
                            <span className="text-2xl" title="Musytari">🟠</span>
                            <span className="text-2xl" title="Zuhal">🪐</span>
                            <span className="text-xl" title="Uranus">🔵</span>
                            <span className="text-xl" title="Neptun">🟦</span>
                          </div>
                          <p className="text-[11px] font-bold text-sky-200">
                            Matahari ➔ Utarid ➔ Zuhrah ➔ Bumi ➔ Marikh ➔ Musytari ➔ Zuhal ➔ Uranus ➔ Neptun
                          </p>
                        </div>
                      )}

                      {activeModule.media.diagramType === 'fractions' && (
                        <div className="relative flex flex-col items-center justify-center space-y-2 w-full">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
                            <div className="rounded-xl bg-white/10 p-1.5 border border-white/20 text-center">
                              <span className="text-xl block">🌕</span>
                              <span className="text-[10px] font-black text-amber-300">1/1 Penuh</span>
                            </div>
                            <div className="rounded-xl bg-white/10 p-1.5 border border-white/20 text-center">
                              <span className="text-xl block">🌓</span>
                              <span className="text-[10px] font-black text-amber-300">1/2 Separuh</span>
                            </div>
                            <div className="rounded-xl bg-white/10 p-1.5 border border-white/20 text-center">
                              <span className="text-xl block">🍰</span>
                              <span className="text-[10px] font-black text-amber-300">1/4 Suku</span>
                            </div>
                            <div className="rounded-xl bg-white/10 p-1.5 border border-white/20 text-center">
                              <span className="text-xl block">🥧</span>
                              <span className="text-[10px] font-black text-amber-300">3/4 Tiga Suku</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeModule.media.diagramType === 'grammar' && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="rounded-lg bg-violet-600/80 border border-violet-400 px-3 py-1 text-[11px] font-black">
                            📖 Kata Nama
                          </span>
                          <span className="text-sm">➔</span>
                          <span className="rounded-lg bg-emerald-600/80 border border-emerald-400 px-3 py-1 text-[11px] font-black">
                            🏃 Kata Kerja
                          </span>
                          <span className="text-sm">➔</span>
                          <span className="rounded-lg bg-amber-600/80 border border-amber-400 px-3 py-1 text-[11px] font-black">
                            ✨ Kata Adjektif
                          </span>
                        </div>
                      )}

                      {activeModule.media.diagramType === 'coding' && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-[11px] font-black">
                          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-slate-950">Mula (Oval)</span>
                          <span>➔</span>
                          <span className="rounded-md bg-sky-500 px-2.5 py-0.5">Input / Data</span>
                          <span>➔</span>
                          <span className="rounded-md bg-indigo-500 px-2.5 py-0.5">Proses Pengiraan</span>
                          <span>➔</span>
                          <span className="rounded-full bg-rose-500 px-2.5 py-0.5">Tamat</span>
                        </div>
                      )}

                      {activeModule.media.diagramType !== 'solar' &&
                        activeModule.media.diagramType !== 'fractions' &&
                        activeModule.media.diagramType !== 'grammar' &&
                        activeModule.media.diagramType !== 'coding' && (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <span className="text-3xl">{activeModule.emoji}</span>
                            <span className="text-[11px] font-bold text-sky-200">
                              Infografik Visual Pembelajaran: {activeModule.title}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Interactive Label Cards below diagram (Lebih kompak & kemas) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {activeModule.media.keyLabels.map((lbl, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 sm:p-3 transition-all shadow-2xs hover:border-blue-300"
                        >
                          <h4 className="text-xs sm:text-sm font-black text-blue-900 mb-0.5">{lbl.label}</h4>
                          <p className="text-[11px] sm:text-xs leading-relaxed text-blue-800/90 font-medium">
                            {lbl.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Step Completion Action Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        saveModuleStepProgress(activeModule.id, 'visual')
                        setActiveStep('video')
                        gameSound.playTileClick()
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Fahami Gambar Rajah &amp; Terus ke Video ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* LANGKAH 3: MELIHAT VIDEO (PEMAIN VIDEO PEMBELAJARAN)          */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeStep === 'video' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <section className="rounded-3xl border-2 border-blue-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="border-b border-blue-100 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {activeModule.media.videoTitle}
                      </h3>
                    </div>

                    {/* Responsive Video Embed Player (Dikecilkan kemas supaya muat & boleh nampak) */}
                    <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border-2 border-blue-100 bg-black shadow-md">
                      <iframe
                        src={activeModule.media.videoUrl}
                        title={activeModule.media.videoTitle}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </section>

                  {/* Step Completion Action Button (Warna Biru) */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        saveModuleStepProgress(activeModule.id, 'video')
                        setActiveStep('quiz')
                        gameSound.playTileClick()
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Selesai Tonton Video &amp; Mula Jawab Kuiz ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* LANGKAH 4: MENJAWAB KUIZ (JAWAB DAHULU, SAHKAN DI AKHIR)       */}
              {/* ───────────────────────────────────────────────────────────── */}
              {activeStep === 'quiz' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {!quizFinished ? (
                    <div className="rounded-3xl border-2 border-blue-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
                      {/* Quiz Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            {activeModule.subject} · Kuiz Kefahaman
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            Soalan {currentQIndex + 1} daripada {activeModule.questions.length}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Question Number Pills Navigation */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {activeModule.questions.map((_, qIdx) => {
                              const isCurrent = qIdx === currentQIndex
                              const isAnswered = quizAnswers[qIdx] !== undefined
                              return (
                                <button
                                  key={qIdx}
                                  type="button"
                                  onClick={() => handleJumpToQuestion(qIdx)}
                                  title={`Soalan ${qIdx + 1}${isAnswered ? ' (Sudah Dijawab)' : ' (Belum Dijawab)'}`}
                                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 font-black shadow-xs scale-105'
                                      : isAnswered
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {qIdx + 1}
                                </button>
                              )
                            })}
                          </div>

                          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                            <span>{Object.keys(quizAnswers).length}/{activeModule.questions.length} Dijawab</span>
                          </div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                        <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                          {activeModule.questions[currentQIndex].question}
                        </p>
                      </div>

                      {/* Multiple Choice Options (Tiada jawapan betul/salah ditunjuk sekarang) */}
                      <div className="space-y-2.5">
                        {activeModule.questions[currentQIndex].options.map((opt, idx) => {
                          const isSelected = quizAnswers[currentQIndex] === idx

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectQuizOption(idx)}
                              className={`flex w-full items-center justify-between rounded-2xl border-2 p-3.5 text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-300 font-bold shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-black transition-colors ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </div>

                              {isSelected && (
                                <span className="shrink-0 text-xs font-bold text-blue-600 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                                  Dipilih ✓
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Action Navigation: Previous / Next / Confirm and Finish */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          disabled={currentQIndex === 0}
                          onClick={handlePrevQuizQuestion}
                          className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                            currentQIndex > 0
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer'
                              : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Sebelumnya</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {currentQIndex < activeModule.questions.length - 1 ? (
                            <button
                              type="button"
                              onClick={handleNextQuizQuestion}
                              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer"
                            >
                              <span>Seterusnya</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowConfirmSubmitModal(true)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Sahkan &amp; Hantar Kuiz ✨</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Quiz Results Card & Semakan Jawapan Betul dan Salah */
                    <div className="space-y-6 animate-in zoom-in-95 duration-200">
                      {/* Summary Score Card */}
                      <div className="rounded-3xl border-2 border-emerald-300 bg-white p-6 sm:p-8 text-center shadow-md space-y-4">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white text-3xl shadow-lg">
                          🏆
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                          Tahniah! Modul Berjaya Diselesaikan!
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                          Anda telah membaca nota, meneliti gambar rajah, menonton video dan menjawab semua soalan kuiz bagi modul <strong>{activeModule.title}</strong>.
                        </p>

                        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto py-2">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Skor</span>
                            <span className="text-base sm:text-lg font-black text-blue-600">
                              {Math.round((scoreCount / activeModule.questions.length) * 100)}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              ({scoreCount}/{activeModule.questions.length} Betul)
                            </span>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">XP Diperoleh</span>
                            <span className="text-base sm:text-lg font-black text-blue-600">
                              +{xpEarned} XP
                            </span>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                            <span className="text-base sm:text-lg font-black text-emerald-600">
                              100% Selesai
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleRetakeQuiz}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 transition cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Ulang Kuiz Semula 🔁</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCloseStudio}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg active:scale-95 transition cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Selesai &amp; Kembali ke Pusat Modul</span>
                          </button>
                        </div>
                      </div>

                      {/* ───────────────────────────────────────────────────────────── */}
                      {/* SEMAKAN JAWAPAN TERPERINCI (BETUL & SALAH)                      */}
                      {/* ───────────────────────────────────────────────────────────── */}
                      <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                              <span>📋</span>
                              <span>Semakan Jawapan Betul &amp; Salah</span>
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Teliti jawapan anda bagi setiap soalan untuk memahami konsep topik ini dengan lebih baik.
                            </p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {scoreCount} / {activeModule.questions.length} Betul
                          </span>
                        </div>

                        <div className="space-y-4 pt-1">
                          {activeModule.questions.map((q, qIdx) => {
                            const userChoiceIdx = quizAnswers[qIdx]
                            const isCorrect = userChoiceIdx === q.correctIndex
                            const isAnswered = userChoiceIdx !== undefined

                            return (
                              <div
                                key={q.id || qIdx}
                                className={`rounded-2xl border-2 p-4 sm:p-5 space-y-3.5 transition-all ${
                                  isCorrect
                                    ? 'border-emerald-200 bg-emerald-50/30'
                                    : 'border-rose-200 bg-rose-50/30'
                                }`}
                              >
                                {/* Header Soalan & Status Badge */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-black text-white ${
                                        isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                                      }`}
                                    >
                                      {qIdx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">
                                      Soalan {qIdx + 1}
                                    </span>
                                  </div>

                                  {isCorrect ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                      ✓ Jawapan Tepat
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-black text-rose-800 border border-rose-300">
                                      <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                      {isAnswered ? '✗ Jawapan Kurang Tepat' : '✗ Tiada Jawapan'}
                                    </span>
                                  )}
                                </div>

                                {/* Teks Soalan */}
                                <p className="text-xs sm:text-sm font-bold text-slate-900">
                                  {q.question}
                                </p>

                                {/* Pilihan Jawapan dengan Highlight Betul vs Pilihan Murid */}
                                <div className="space-y-2 pt-1">
                                  {q.options.map((opt, optIdx) => {
                                    const isThisCorrectAnswer = optIdx === q.correctIndex
                                    const isThisUserChoice = userChoiceIdx === optIdx

                                    let optionStyle = 'border-slate-200 bg-white/70 text-slate-600 opacity-60'
                                    let badge = null

                                    if (isThisCorrectAnswer) {
                                      optionStyle = 'border-emerald-500 bg-emerald-100/90 text-emerald-950 font-bold ring-2 ring-emerald-300/60 opacity-100'
                                      badge = (
                                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                          <Check className="h-3 w-3" /> Jawapan Betul
                                        </span>
                                      )
                                    } else if (isThisUserChoice && !isCorrect) {
                                      optionStyle = 'border-rose-400 bg-rose-100/90 text-rose-950 font-bold opacity-100'
                                      badge = (
                                        <span className="text-[10px] font-black text-rose-800 bg-rose-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                          <X className="h-3 w-3" /> Pilihan Anda
                                        </span>
                                      )
                                    }

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center justify-between rounded-xl border p-2.5 sm:p-3 text-xs sm:text-sm transition-all ${optionStyle}`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span className="font-black text-slate-500 text-xs">
                                            {String.fromCharCode(65 + optIdx)}.
                                          </span>
                                          <span>{opt}</span>
                                        </div>
                                        {badge}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 4. BOTTOM ACTION FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-3.5 sm:p-4 shrink-0">
              <button
                type="button"
                onClick={handleCloseStudio}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
              >
                Simpan &amp; Tutup Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengesahan Hantar Kuiz */}
      {showConfirmSubmitModal && activeModule && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-600 text-2xl">
              📝
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Sahkan Penghantaran Kuiz?
            </h3>

            {(() => {
              const answeredCount = Object.keys(quizAnswers).length
              const totalCount = activeModule.questions.length
              const unansweredCount = totalCount - answeredCount

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Dijawab</span>
                      <span className="text-base font-black text-blue-600">{answeredCount}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Belum Dijawab</span>
                      <span className={`text-base font-black ${unansweredCount > 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                        {unansweredCount}
                      </span>
                    </div>
                  </div>

                  {unansweredCount > 0 ? (
                    <p className="text-xs sm:text-sm text-blue-900 bg-blue-50 p-3 rounded-2xl border border-blue-200 font-medium text-left">
                      ℹ️ Terdapat <strong>{unansweredCount} soalan</strong> yang belum dijawab. Jawapan yang tidak dijawab akan dikira sebagai kurang tepat. Adakah anda pasti mahu hantar?
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-600">
                      Tahniah! Semua soalan telah dijawab. Tekan butang di bawah untuk mengesahkan dan melihat keputusan serta semakan jawapan yang betul dan salah.
                    </p>
                  )}
                </div>
              )
            })()}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(false)}
                className="w-full sm:w-auto rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer"
              >
                Semak Semula Soalan
              </button>

              <button
                type="button"
                disabled={isSubmittingToDb}
                onClick={handleConfirmAndFinishQuiz}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmittingToDb ? 'Memproses...' : 'Ya, Sahkan & Nilai!'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Level Up Modal */}
      {levelUpModalData && (
        <LevelUpModal
          isOpen={!!levelUpModalData}
          onClose={() => setLevelUpModalData(null)}
          newLevel={levelUpModalData.newLevel}
          previousLevel={levelUpModalData.previousLevel}
          coinReward={levelUpModalData.coinReward}
        />
      )}
    </div>
  )
}