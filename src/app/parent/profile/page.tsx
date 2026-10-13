'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { useParentChildren } from '@/lib/parent-dashboard';

export default function ParentProfilePage() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [initialData, setInitialData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        if (json.success && json.data) {
          const loaded = {
            fullName: json.data.fullName || '',
            email: json.data.email || '',
            phone: json.data.phone || '',
          };
          setInitialData(loaded);
          setFormData({
            ...loaded,
            newPassword: '',
            confirmPassword: '',
          });
        }
      } catch (err) {
        setErrorMessage('Gagal memuatkan data profil.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage('Sila masukkan nama penuh anda.');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setErrorMessage('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage('Kata laluan baharu dan pengesahan kata laluan tidak sepadan.');
        return;
      }
    }

    try {
      setSaving(true);

      // 1. Update Profile in DB
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          role: 'parent',
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal mengemaskini maklumat profil.');
      }

      // 2. Update Password if provided
      if (formData.newPassword) {
        const supabase = createSupabaseBrowser();
        const { error: pwdError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (pwdError) {
          throw new Error(`Maklumat disimpan tetapi kemas kini kata laluan gagal: ${pwdError.message}`);
        }
      }

      setInitialData({
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone.trim(),
      });
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName.trim(),
        phone: prev.phone.trim(),
        newPassword: '',
        confirmPassword: '',
      }));
      setSuccessMessage('Maklumat profil anda telah berjaya dikemas kini!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat berlaku semasa menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: initialData.fullName,
      email: initialData.email,
      phone: initialData.phone,
      newPassword: '',
      confirmPassword: '',
    });
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b49]">Profil & Tetapan Akaun</h1>
          <p className="text-sm text-[#6b7a88]">
            Kemas kini butiran peribadi, nombor telefon dan kata laluan akaun penjaga anda.
          </p>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Avatar Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[#cfe2f3] bg-white p-6 text-center shadow-[0_4px_16px_rgba(60,90,120,0.06)]">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl border-3 border-[#0072bc] bg-[#ffd9c2] text-5xl shadow-sm">
              👩
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#1a2b49]">
              {formData.fullName || 'Ibu Bapa'}
            </h2>
            <p className="mt-0.5 text-xs text-[#6b7a88]">{formData.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Akaun Penjaga Sah
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Anak Berdaftar:</span>
                <span className="font-bold text-[#0072bc]">
                  {childrenLoading ? '...' : `${children.length} Orang`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Peranan:</span>
                <span className="font-semibold text-slate-800">Ibu Bapa / Penjaga</span>
              </div>
            </div>
          </div>

          {/* Quick link to children */}
          <div className="rounded-2xl border border-[#e3ebf2] bg-white p-5 shadow-[0_4px_16px_rgba(60,90,120,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1a2b49] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0072bc]" /> Profil Anak
              </h3>
              <Link
                href="/parent/children"
                className="text-xs font-semibold text-[#0072bc] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            {children.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 mb-3">Belum ada anak didaftarkan.</p>
                <Link
                  href="/parent/add-child"
                  className="parent-blue-surface inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs hover:bg-[#005ea6] transition"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Tambah Anak
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {children.slice(0, 3).map((child) => (
                  <Link
                    key={child.id}
                    href={`/parent/children/${child.id}`}
                    className="flex items-center justify-between rounded-xl p-2 hover:bg-sky-50 transition border border-transparent hover:border-sky-100"
                  >
                    <span className="text-xs font-semibold text-[#1a2b49] truncate max-w-[150px]">
                      {child.name}
                    </span>
                    <span className="text-[11px] text-[#6b7a88]">{child.grade}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-[#cfe2f3] bg-white p-6 shadow-[0_4px_16px_rgba(60,90,120,0.06)] space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-[#1a2b49]">Maklumat Peribadi</h2>
              <p className="text-xs text-[#6b7a88]">
                Sila pastikan maklumat peribadi dan nombor telefon anda terkini untuk urusan komunikasi dan penghantaran pesanan.
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#6b7a88] flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#0072bc]" />
                <span>Memuatkan profil...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold text-[#1a2b49] mb-1.5"
                    >
                      Nama Penuh Penjaga <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Contoh: Aminah binti Kassim"
                        className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1a2b49] outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc] transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-[#1a2b49] mb-1.5"
                    >
                      Alamat Emel Akaun
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Emel akaun digunakan untuk log masuk portal dan notifikasi.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-[#1a2b49] mb-1.5"
                    >
                      Nombor Telefon Penjaga (WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Contoh: 012-3456789"
                        className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1a2b49] outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1a2b49] flex items-center gap-1.5">
                        <KeyRound className="h-4 w-4 text-[#0072bc]" /> Tukar Kata Laluan (Pilihan)
                      </h3>
                      <p className="text-xs text-[#6b7a88]">
                        Biarkan kosong jika anda tidak mahu menukar kata laluan akaun.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-xs font-bold text-[#1a2b49] mb-1.5"
                      >
                        Kata Laluan Baharu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Min. 6 aksara"
                          className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-10 py-2.5 text-sm text-[#1a2b49] outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-bold text-[#1a2b49] mb-1.5"
                      >
                        Sahkan Kata Laluan Baharu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Ulang kata laluan"
                          className="w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1a2b49] outline-none focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc] transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="parent-blue-surface inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-xs hover:bg-[#005ea6] transition disabled:opacity-60 active:scale-95 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
