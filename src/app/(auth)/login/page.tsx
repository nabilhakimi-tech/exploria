'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const cleanIdentifier = identifier.trim();
      let resolvedEmail = cleanIdentifier;

      // If user typed an IC number or non-email username, resolve to auth email
      try {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanIdentifier }),
        });
        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          if (resolveData?.email) {
            resolvedEmail = resolveData.email;
          }
        }
      } catch {
        // Fallback to identifier as typed
      }

      const supabase = createSupabaseBrowser();
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      // If email not confirmed, auto-confirm seamlessly and retry!
      if (
        authError &&
        (authError.message.toLowerCase().includes('email not confirmed') ||
          authError.message.toLowerCase().includes('not confirmed'))
      ) {
        try {
          const confirmRes = await fetch('/api/auth/confirm-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resolvedEmail }),
          });

          if (confirmRes.ok) {
            const retry = await supabase.auth.signInWithPassword({
              email: resolvedEmail,
              password,
            });
            authData = retry.data;
            authError = retry.error;
          }
        } catch {
          // Continue to error handling
        }
      }

      if (authError) {
        setErrorMessage(
          authError.message === 'Invalid login credentials'
            ? 'Emel / No. IC atau kata laluan tidak tepat.'
            : authError.message
        );
        setIsLoading(false);
        return;
      }

      // Check role from profile to route automatically
      let userRole = '';
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const json = await res.json();
          userRole = json?.data?.role || '';
        }
      } catch {
        // Fallback
      }

      // Automatic redirection based on user role
      if (userRole === 'admin' || userRole === 'staff') {
        router.push('/staff');
      } else if (userRole === 'student') {
        router.push('/student');
      } else {
        router.push('/parent');
      }

      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ralat semasa log masuk.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="login-content w-full"
    >
      <div className="login-brand">
        <Image
          src="/logoexploria.png"
          alt="Exploria"
          width={800}
          height={244}
          priority
        />
      </div>

      {/* Header */}
      <div className="login-heading mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Log Masuk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Selamat kembali ke portal pembelajaran Exploria
        </p>
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field (Email or IC) */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Emel atau No. IC / ID Pelajar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Emel atau No. IC (cth: 150201101234)"
              className={cn(
                'w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
              )}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Kata Laluan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border border-slate-300 pl-11 pr-11 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sedang Log Masuk...</span>
            </>
          ) : (
            'Log Masuk'
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Belum ada akaun?{' '}
          <Link
            href="/register"
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Daftar akaun baharu di sini
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
