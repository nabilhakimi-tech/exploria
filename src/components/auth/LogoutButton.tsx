'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, LogOut } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'

type LogoutButtonProps = {
  variant: 'student' | 'parent' | 'staff' | 'sidebar'
  buttonClassName?: string
}

const variantStyles: Record<LogoutButtonProps['variant'], string> = {
  student: 'inline-flex min-h-10 items-center justify-center gap-2 text-sm font-bold rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-xs hover:bg-blue-50 hover:border-blue-300 transition-all sm:px-4',
  parent: 'inline-flex min-h-10 items-center justify-center gap-2 text-sm font-bold rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all',
  staff: 'inline-flex min-h-10 items-center justify-center gap-2 text-sm font-bold rounded-full border border-white/35 bg-white/20 px-3 py-2 text-white backdrop-blur transition-colors hover:bg-white/35',
  sidebar: 'flex flex-col items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group w-14',
}

export default function LogoutButton({ variant, buttonClassName = '' }: LogoutButtonProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setErrorMessage('')

    try {
      const { error } = await createSupabaseBrowser().auth.signOut()

      if (error) {
        setErrorMessage(`Log keluar gagal: ${error.message}`)
        setIsLoggingOut(false)
        return
      }

      router.replace('/login')
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Log keluar gagal: ${error.message}`
          : 'Log keluar gagal. Sila cuba lagi.'
      )
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={isLoggingOut ? 'Sedang log keluar' : 'Log keluar'}
        title="Log Keluar"
        className={`transition-colors disabled:cursor-wait disabled:opacity-70 ${
          variant === 'sidebar'
            ? 'flex flex-col items-center justify-center gap-1.5 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl w-full group'
            : `inline-flex min-h-10 items-center justify-center gap-2 text-sm font-bold ${variantStyles[variant]}`
        } ${buttonClassName}`}
      >
        {isLoggingOut
          ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          : <LogOut className={`h-5 w-5 ${variant === 'sidebar' ? 'stroke-[2.2] group-hover:translate-x-0.5 transition-transform' : ''}`} aria-hidden="true" />}
        <span className={variant === 'sidebar' ? 'text-[10px] font-bold text-slate-500 group-hover:text-rose-600 leading-tight' : ''}>
          {variant === 'sidebar' ? 'Logout' : 'Log Keluar'}
        </span>
      </button>
      {errorMessage && (
        <p role="alert" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-red-200 bg-white p-3 text-sm font-medium text-red-700 shadow-lg">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
