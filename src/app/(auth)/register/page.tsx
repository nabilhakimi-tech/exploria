'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrorMessage('');
    setIsSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSuccess(false);

    if (!formData.username.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Sila isi nama pengguna, emel dan nombor telefon anda.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrorMessage('Format email tidak sah.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Kata laluan mesti sekurang-kurangnya 6 aksara.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Register user server-side with instant confirmation
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMessage(json.error || 'Pendaftaran gagal.');
        setIsLoading(false);
        return;
      }

      // 2. Immediately sign in to establish browser session
      const supabase = createSupabaseBrowser();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (loginError) {
        console.warn('Auto sign-in note:', loginError.message);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push('/parent');
      }, 800);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ralat semasa mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="register-content w-full"
    >
      <div className="register-brand">
        <Image
          src="/logoexploria.png"
          alt="Exploria"
          width={800}
          height={244}
          priority
        />
      </div>

      <div className="register-heading">
        <h1>Daftar Akaun</h1>
        <p>Cipta akaun Exploria anda</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="register-form">
        <div className="register-fields">
          <label className="register-field" htmlFor="username">
            <span className="sr-only">Username</span>
            <User aria-hidden="true" />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
            />
          </label>

          <label className="register-field" htmlFor="email">
            <span className="sr-only">Email</span>
            <Mail aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@contoh.com"
            />
          </label>

          <label className="register-field" htmlFor="phone">
            <span className="sr-only">Nombor telefon</span>
            <Phone aria-hidden="true" />
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="No. telefon (cth: 012-3456789)"
            />
          </label>

          <label className="register-field" htmlFor="password">
            <span className="sr-only">Kata laluan</span>
            <Lock aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-label="Kata laluan"
              minLength={8}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Kata laluan (min. 8 aksara)"
            />
            <button
              type="button"
              className="register-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'
              }
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </label>

        </div>

        {(errorMessage || isSuccess) && (
          <p
            className={cn(
              'register-message',
              errorMessage && 'register-message-error',
              isSuccess && 'register-message-success',
            )}
            role="status"
            aria-live="polite"
          >
            {errorMessage ? (
              <AlertCircle aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            <span>
              {errorMessage || 'Pendaftaran berjaya! Mengalihkan ke portal...'}
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="register-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              <span>Sedang Mendaftar...</span>
            </>
          ) : (
            'Daftar'
          )}
        </button>
      </form>

      <p className="register-login-link">
        Sudah ada akaun? <Link href="/login">Log Masuk</Link>
      </p>
    </motion.div>
  );
}
