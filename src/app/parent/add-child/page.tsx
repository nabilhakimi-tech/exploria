'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Upload, X, Lock, Eye, EyeOff, KeyRound, ChevronLeft } from 'lucide-react';
import { saveParentChild } from '@/lib/parent-dashboard';
import SchoolCombobox from '@/components/parent/SchoolCombobox';

const avatars = ['👦', '👧', '🧒', '👶', '🧑', '🐱'];

export default function AddChildPage() {
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);
  const [schoolName, setSchoolName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [color] = useState('#ffffff');
  const [image, setImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordValue(pass);
    setShowPassword(true);
  };

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Pilih gambar dalam format JPG, PNG atau WebP.');
      event.currentTarget.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Saiz gambar maksimum ialah 1 MB.');
      event.currentTarget.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setError('');
      } else {
        setError('Gambar tidak dapat dibaca. Cuba fail lain.');
      }
    };
    reader.onerror = () => setError('Gambar tidak dapat dibaca. Cuba fail lain.');
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('fullName') ?? '').trim();
    const icNumber = String(formData.get('icNumber') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();
    const age = Number(formData.get('age'));

    if (!name) {
      setError('Sila masukkan nama penuh anak.');
      setSaving(false);
      return;
    }

    if (!icNumber) {
      setError('Sila masukkan No. ID atau IC anak.');
      setSaving(false);
      return;
    }

    if (!password) {
      setError('Sila masukkan kata laluan log masuk anak.');
      setSaving(false);
      return;
    }

    if (password.length < 6) {
      setError('Kata laluan anak mestilah sekurang-kurangnya 6 aksara.');
      setSaving(false);
      return;
    }

    const inferredGrade =
      age <= 6
        ? 'Prasekolah'
        : age === 7
        ? 'Darjah 1'
        : age === 8
        ? 'Darjah 2'
        : age === 9
        ? 'Darjah 3'
        : age === 10
        ? 'Darjah 4'
        : age === 11
        ? 'Darjah 5'
        : age === 12
        ? 'Darjah 6'
        : age === 13
        ? 'Tingkatan 1'
        : age === 14
        ? 'Tingkatan 2'
        : age === 15
        ? 'Tingkatan 3'
        : age === 16
        ? 'Tingkatan 4'
        : age >= 17
        ? 'Tingkatan 5'
        : 'Umum';

    const upperSchool = schoolName.toUpperCase();
    const inferredSchoolType: 'SK' | 'SMK' =
      upperSchool.includes('SMK') || upperSchool.includes('SMA') || age >= 13
        ? 'SMK'
        : 'SK';

    const child = {
      name,
      icNumber,
      schoolType: inferredSchoolType,
      schoolName: schoolName.trim(),
      school: schoolName.trim(),
      password,
      age,
      grade: inferredGrade,
      gender: String(formData.get('gender') ?? 'Tidak dinyatakan'),
      avatar,
      color,
      ...(image ? { image } : {}),
    };

    try {
      const saved = await saveParentChild(child);
      router.push(`/parent/children/${saved.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Profil anak tidak dapat disimpan.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/parent/children"
          className="parent-blue-surface inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold shadow-xs hover:bg-[#005ea6] transition"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Senarai Anak
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1a2b49]">Tambah Anak</h1>
        <p className="mt-1 text-[#6b7a88]">Cipta profil anak untuk melihat aktiviti dan pencapaiannya.</p>
      </div>

      <form
        className="space-y-7 rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.08)] sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-base font-semibold text-[#22303c]">
            Nama penuh <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            maxLength={100}
            placeholder="Contoh: Adam bin Ahmad"
            className="w-full rounded-lg border border-[#cfd9e2] px-4 py-3 text-base outline-none focus:border-[#0072bc]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="age" className="block text-base font-semibold text-[#22303c]">Umur</label>
            <input
              type="number"
              id="age"
              name="age"
              min="3"
              max="18"
              required
              placeholder="Contoh: 9"
              className="w-full rounded-lg border border-[#cfd9e2] px-4 py-3 text-base outline-none focus:border-[#0072bc]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-base font-semibold text-[#22303c]">Jantina</label>
            <select id="gender" name="gender" className="w-full rounded-lg border border-[#cfd9e2] bg-white px-4 py-3 text-base outline-none focus:border-[#0072bc]">
              <option>Lelaki</option>
              <option>Perempuan</option>
              <option>Tidak dinyatakan</option>
            </select>
          </div>
        </div>

        {/* Pilihan & Isian Nama Sekolah Pintar */}
        <SchoolCombobox
          value={schoolName}
          onChange={(name) => setSchoolName(name)}
        />

        {/* Bahagian Akaun Log Masuk Pelajar (No. IC & Kata Laluan) */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-sky-900 font-semibold text-sm">
            <KeyRound className="h-4 w-4 text-sky-600" />
            <span>Akaun Log Masuk Portal Pelajar</span>
          </div>

          <div className="space-y-2">
            <label htmlFor="icNumber" className="block text-sm font-semibold text-[#22303c]">
              No. ID / IC Anak <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="icNumber"
              name="icNumber"
              required
              maxLength={30}
              placeholder="Contoh: 150201-10-1234 atau ID12345"
              className="w-full rounded-lg border border-[#cfd9e2] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc]"
            />
            <p className="text-xs text-[#6b7a88]">
              Sila masukkan No. MyKid/MyKad atau No. ID Pelajar anak.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-[#22303c]">
                Kata laluan log masuk anak <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs font-bold text-[#0072bc] hover:underline"
              >
                Jana Kata Laluan Rawak
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                minLength={6}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Masukkan kata laluan (sekurang-kurangnya 6 aksara)"
                className="w-full rounded-lg border border-[#cfd9e2] bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#6b7a88]">
              Minimum 6 aksara.
            </p>
          </div>
        </div>

        {/* Bahagian Avatar atau Gambar Profil (Di Bawah Akaun Log Masuk) */}
        <fieldset className="space-y-3">
          <legend className="text-base font-semibold text-[#22303c]">Pilih avatar atau gambar profil</legend>
          <div className="flex flex-wrap items-center gap-3">
            {avatars.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { setAvatar(option); setImage(''); if (imageInput.current) imageInput.current.value = ''; }}
                aria-label={`Pilih avatar ${option}`}
                aria-pressed={!image && avatar === option}
                className={`grid h-12 w-12 place-items-center rounded-full border-[3px] bg-white text-2xl ${!image && avatar === option ? 'parent-blue-surface border-white' : 'border-[#cfd9e2]'}`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => imageInput.current?.click()}
              className="parent-blue-surface inline-flex min-h-12 items-center gap-2 rounded-lg px-4 text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
              Muat naik gambar
            </button>
            <input
              ref={imageInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImage}
              className="sr-only"
              aria-label="Muat naik gambar profil"
            />
          </div>
          <p className="text-xs text-[#6b7a88]">JPG, PNG atau WebP · Maksimum 1 MB</p>

          {image && (
            <div className="flex items-center gap-3 rounded-xl border border-[#cfd9e2] bg-white p-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[#cfd9e2] bg-white">
                <Image src={image} alt="Pratonton gambar anak" width={56} height={56} unoptimized className="h-full w-full object-cover" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">Gambar profil dimuat naik</p>
                <button
                  type="button"
                  onClick={() => { setImage(''); if (imageInput.current) imageInput.current.value = ''; }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
                >
                  <X className="h-3.5 w-3.5" /> Buang gambar
                </button>
              </div>
            </div>
          )}
        </fieldset>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="parent-blue-surface min-h-12 w-full rounded-xl px-6 py-3 text-base font-bold shadow-md hover:bg-[#005ea6] transition disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : 'Simpan Profil Anak'}
        </button>
      </form>
    </div>
  );
}
