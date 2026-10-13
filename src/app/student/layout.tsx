import StudentSidebar from '@/components/student/StudentSidebar'
import StudentTopBar from '@/components/student/StudentTopBar'
import { Fredoka } from 'next/font/google'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-quiz-display',
  weight: ['400', '500', '600', '700'],
})

export default function StudentLayout({ children }: LayoutProps<'/student'>) {
  return (
    <div
      className={`${fredoka.variable} min-h-screen w-full bg-white font-[var(--font-quiz-display)] flex flex-row`}
    >
      {/* 1. Left Vertical Sidebar (Desktop - Persis Gambar 1) */}
      <StudentSidebar />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Bar (Carian & Widget Koin) */}
        <StudentTopBar />

        {/* Kandungan Halaman */}
        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  )
}
