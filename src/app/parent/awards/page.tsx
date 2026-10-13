'use client';

import { useState, useEffect } from 'react';
import {
  Check,
  Medal,
  ScrollText,
  ShoppingBag,
  Printer,
  Sparkles,
  Trophy,
  ShieldCheck,
  Package,
  Truck,
  CreditCard,
  Copy,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';
import { useParentChildren, useChildAwards } from '@/lib/parent-dashboard';
import { OfficialCertificateModal, type CertificateData } from '@/components/ui/OfficialCertificateModal';

type ProductPackage = 'bundle' | 'certificate' | 'medal';

type BasketItem = {
  awardId: string;
  product: ProductPackage;
  price: number;
};

const PRODUCT_PRICES: Record<ProductPackage, { label: string; price: number; desc: string }> = {
  bundle: {
    label: 'Pakej Lengkap (Medal Logam + Sijil Berbingkai)',
    price: 39.0,
    desc: 'Medal logam bersadur emas/perak/gangsa + Sijil bercetak laser hot-stamping dalam bingkai kayu eksklusif.',
  },
  medal: {
    label: 'Medal / Pingat Logam Sahaja',
    price: 25.0,
    desc: 'Pingat logam berukir logo Exploria berserta reben kolar rasmi.',
  },
  certificate: {
    label: 'Sijil Hardcopy Berbingkai',
    price: 18.0,
    desc: 'Sijil cetakan kualiti arkib berbingkai kayu sedia digantung di dinding.',
  },
};

const ORDER_DRAFT_KEY = 'exploria-physical-award-order-draft';

type PhysicalOrder = {
  id: string;
  orderNumber: string;
  productName: string;
  childName?: string;
  awardTitle?: string;
  guardianName: string;
  phone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
};

export default function ParentAwardsPage() {
  const { children, error: loadError, loading: childrenLoading } = useParentChildren();
  const { awards, loading: awardsLoading } = useChildAwards();
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeCertPreview, setActiveCertPreview] = useState<CertificateData | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<PhysicalOrder | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<PhysicalOrder[]>([]);

  const [profile, setProfile] = useState<{ fullName: string; phone?: string } | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/parent/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrderHistory(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch parent orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const availableAwards = awards.filter((award) =>
    children.some((child) => child.id === award.childId)
  );

  function toggleProduct(awardId: string, product: ProductPackage) {
    setSubmitted(false);
    setFormError('');
    setBasket((items) => {
      const exists = items.some((item) => item.awardId === awardId && item.product === product);
      if (exists) {
        return items.filter((item) => item.awardId !== awardId || item.product !== product);
      }
      return [...items, { awardId, product, price: PRODUCT_PRICES[product].price }];
    });
  }

  function handlePreviewCertificate(award: any) {
    const child = children.find((c) => c.id === award.childId);
    setActiveCertPreview({
      certId: award.certId || `EXP-CERT-2026-${award.id}`,
      studentName: child?.name || 'Pelajar Exploria',
      competitionTitle: award.rawTitle || award.title,
      awardLevel: (award.rank as any) || 'EMAS',
      score: award.score || 95,
      totalQuestions: 10,
      date: award.date || '1 Oktober 2026',
      school: child?.school || 'Sekolah Kebangsaan',
    });
  }

  const subtotal = basket.reduce((sum, item) => sum + item.price, 0);
  const shippingFee = basket.length > 0 ? 8.0 : 0;
  const grandTotal = subtotal + shippingFee;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (basket.length === 0) {
      setFormError('Sila pilih sekurang-kurangnya satu pakej sijil fizikal atau medal untuk pesanan anda.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const guardianName = String(formData.get('guardianName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const deliveryAddress = String(formData.get('deliveryAddress') ?? '').trim();
    const paymentMethod = String(formData.get('paymentMethod') ?? 'fpx');

    const requestPayload = {
      guardianName,
      phone,
      deliveryAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      grandTotal,
      items: basket.map((item) => {
        const award = awards.find((a) => a.id === item.awardId);
        const child = children.find((c) => c.id === award?.childId);
        return {
          ...item,
          childId: child?.id,
          productName: PRODUCT_PRICES[item.product].label,
          awardTitle: award?.title,
          childName: child?.name,
        };
      }),
    };

    setIsSubmittingOrder(true);
    setFormError('');

    try {
      const res = await fetch('/api/parent/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setBasket([]);
        fetchOrders();
      } else {
        setFormError(json.error || 'Gagal menghantar pesanan');
      }
    } catch {
      setFormError('Ralat sambungan pelayan. Sila cuba sebentar lagi.');
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Certificate Modal for Printing & PDF Export */}
      {activeCertPreview && (
        <OfficialCertificateModal
          certificate={activeCertPreview}
          onClose={() => setActiveCertPreview(null)}
        />
      )}

      {/* Header Banner */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2638]">Anugerah & Sijil Anak</h1>
          <p className="mt-1 text-sm text-[#5f7182]">
            Cetak Sijil Digital (PDF Percuma) atau buat tempahan Sijil Fizikal Berbingkai & Medal Logam Rasmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Pengiktirafan Rasmi Exploria
          </span>
        </div>
      </div>

      {/* Feature Information Pill */}
      <section className="rounded-2xl border border-[#bce2f7] bg-gradient-to-r from-[#e7f5fd] to-[#f0f9ff] p-4 text-sm text-[#143763] shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Dua Cara Menerima Pengiktirafan:</p>
            <p className="text-xs sm:text-sm text-slate-700">
              1. <strong>Cetak PDF Sijil (Percuma):</strong> Tekan butang <em>"Pratonton & Cetak Sijil"</em> untuk cetakan terus format A4 resolusi tinggi.<br />
              2. <strong>Tempah Fizikal (Penghantaran ke Rumah):</strong> Pilih pakej Medal Logam atau Sijil Berbingkai untuk dihantar terus ke pintu rumah anda.
            </p>
          </div>
        </div>
      </section>

      {loadError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {awardsLoading ? (
          <p className="col-span-full py-4 text-center text-sm text-[#6b7a88]">Memuatkan anugerah...</p>
        ) : availableAwards.map((achievement) => {
          const child = children.find((item) => item.id === achievement.childId);
          const bundleSelected = basket.some(
            (item) => item.awardId === achievement.id && item.product === 'bundle'
          );
          const certSelected = basket.some(
            (item) => item.awardId === achievement.id && item.product === 'certificate'
          );
          const medalSelected = basket.some(
            (item) => item.awardId === achievement.id && item.product === 'medal'
          );

          return (
            <article
              key={achievement.id}
              className="rounded-3xl border border-[#e1ebf2] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(50,80,120,0.06)] hover:shadow-[0_8px_25px_rgba(50,80,120,0.1)] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#e2f2fa] to-[#f0f9ff] text-3xl shadow-inner border border-[#d2e8f7]">
                    {achievement.icon}
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1e2c3a] leading-tight">
                      {achievement.title}
                    </h2>
                    <p className="mt-1 text-xs font-bold text-[#45627a]">
                      Nama Anak: <span className="text-[#0072bc]">{child?.name}</span>
                    </p>
                    <p className="text-[11px] text-[#718290]">Tarikh: {achievement.date}</p>
                  </div>
                </div>

                {/* Free Print PDF Button */}
                <button
                  type="button"
                  onClick={() => handlePreviewCertificate(achievement)}
                  className="parent-blue-surface shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition active:scale-95"
                  title="Pratonton dan Cetak PDF Percuma"
                >
                  <Printer className="h-3.5 w-3.5 text-white" /> Cetak PDF Sijil
                </button>
              </div>

              {/* Physical Ordering Selection Options */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pilih Pesanan Fizikal (Opsional):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Complete Bundle */}
                  <button
                    type="button"
                    onClick={() => toggleProduct(achievement.id, 'bundle')}
                    className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                      bundleSelected
                        ? 'border-[#0072bc] bg-sky-50 text-[#0072bc] font-bold ring-2 ring-[#0072bc]/25'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-[#0072bc]/40'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      {bundleSelected && <Check className="h-3 w-3 text-[#0072bc]" />}
                      🏆 Pakej Lengkap
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Medal + Bingkai</div>
                    <div className="mt-1 font-black text-[#0072bc]">RM39.00</div>
                  </button>

                  {/* Option 2: Metal Medal Only */}
                  <button
                    type="button"
                    onClick={() => toggleProduct(achievement.id, 'medal')}
                    className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                      medalSelected
                        ? 'border-[#0072bc] bg-sky-50 text-[#0072bc] font-bold ring-2 ring-[#0072bc]/25'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-[#0072bc]/40'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      {medalSelected && <Check className="h-3 w-3 text-[#0072bc]" />}
                      🎖️ Medal Sahaja
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Logam Bersadur</div>
                    <div className="mt-1 font-black text-[#0072bc]">RM25.00</div>
                  </button>

                  {/* Option 3: Hardcopy Framed Certificate */}
                  <button
                    type="button"
                    onClick={() => toggleProduct(achievement.id, 'certificate')}
                    className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-left text-xs transition ${
                      certSelected
                        ? 'border-[#0072bc] bg-sky-50 text-[#0072bc] font-bold ring-2 ring-[#0072bc]/25'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-[#0072bc]/40'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      {certSelected && <Check className="h-3 w-3 text-[#0072bc]" />}
                      📜 Sijil Bingkai
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Hot-Stamping</div>
                    <div className="mt-1 font-black text-[#0072bc]">RM18.00</div>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!awardsLoading && availableAwards.length === 0 && (
        <section className="rounded-3xl bg-white p-8 text-center text-sm text-[#6b7a88] shadow-sm">
          <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">Belum ada rekod anugerah pertandingan.</p>
          <p className="text-xs text-slate-500 mt-1">
            Galakkan anak anda menyertai pertandingan rasmi di ruangan <em>Competition</em> untuk memenangi Pingat & Sijil!
          </p>
        </section>
      )}

      {/* Checkout / Physical Order Form */}
      <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(60,90,120,0.08)] sm:p-7 border border-[#e2edf5]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-[#183256]">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold">Borang Tempahan Sijil & Medal Fizikal</h2>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
            {basket.length} Item Dipilih
          </span>
        </div>

        {basket.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <h3 className="text-xs font-bold uppercase text-indigo-800 mb-2">Ringkasan Pesanan:</h3>
            <ul className="divide-y divide-indigo-100">
              {basket.map((item) => {
                const award = awards.find((entry) => entry.id === item.awardId);
                const child = children.find((entry) => entry.id === award?.childId);
                return (
                  <li
                    key={`${item.awardId}-${item.product}`}
                    className="flex justify-between items-center py-2 text-xs sm:text-sm"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{PRODUCT_PRICES[item.product].label}</span>
                      <p className="text-[11px] text-slate-500">
                        {award?.title} — <strong className="text-indigo-900">{child?.name}</strong>
                      </p>
                    </div>
                    <span className="font-black text-slate-900">RM{item.price.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 border-t border-indigo-200/60 pt-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Jumlah Kecil:</span>
                <span>RM{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kos Penghantaran (Kurier Seluruh Malaysia):</span>
                <span>RM{shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-indigo-950 pt-1 border-t border-indigo-200">
                <span>Jumlah Keseluruhan:</span>
                <span>RM{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-500">
            Pilih mana-mana pakej Sijil atau Medal di atas untuk membuat pesanan fizikal.
          </div>
        )}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="guardianName" className="block text-xs font-bold uppercase text-slate-700">
              Nama Ibu / Bapa / Penjaga
            </label>
            <input
              key={profile?.fullName || 'empty-name'}
              id="guardianName"
              name="guardianName"
              defaultValue={profile?.fullName || ''}
              placeholder="Contoh: Ahmad bin Razak"
              required
              maxLength={100}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#0072bc] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-bold uppercase text-slate-700">
              Nombor Telefon (WhatsApp)
            </label>
            <input
              key={profile?.phone || 'empty-phone'}
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ''}
              placeholder="Contoh: 012-3456789"
              required
              maxLength={30}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#0072bc] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="deliveryAddress" className="block text-xs font-bold uppercase text-slate-700">
              Alamat Lengkap Penghantaran Pos
            </label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              placeholder="Sila masukkan alamat lengkap penghantaran (No. rumah, jalan, poskod, bandar, negeri)..."
              required
              maxLength={500}
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#0072bc] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {formError && (
            <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
              {formError}
            </p>
          )}

          {submitted && (
            <div
              role="status"
              className="sm:col-span-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-900"
            >
              <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" /> Permintaan Pesanan Telah Disimpan!
              </p>
              <p className="mt-1">
                Pihak pengurusan Exploria akan memproses pesanan dan menghantar resit pengesahan penghantaran ke nombor telefon anda.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={basket.length === 0 || isSubmittingOrder}
            className="sm:col-span-2 parent-blue-surface flex min-h-12 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-lg hover:bg-[#005ea6] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <CreditCard className="h-4 w-4" />
            {isSubmittingOrder ? 'Menghantar Pesanan ke Sistem...' : 'Hantar Permintaan Pesanan Sijil & Medal'}
          </button>
        </form>
      </section>

      {/* Physical Orders History & Tracking */}
      {orderHistory.length > 0 && (
        <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(60,90,120,0.08)] sm:p-7 border border-[#e2edf5]">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-[#183256]">
              <Package className="h-5 w-5 text-[#0072bc]" />
              <h2 className="text-xl font-bold">Status Tempahan Fizikal & Penghantaran</h2>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#0072bc] border border-sky-200">
              {orderHistory.length} Pesanan Direkodkan
            </span>
          </div>

          <div className="space-y-3">
            {orderHistory.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:border-[#0072bc]/30 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0072bc] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <strong className="text-sm text-slate-800">{order.productName}</strong>
                  </div>
                  <p className="text-xs text-slate-600">
                    Penerima: <strong className="text-slate-900">{order.childName || 'Pelajar'}</strong> · Penjaga: {order.guardianName} ({order.phone})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Alamat: {order.deliveryAddress}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === 'Telah Diposkan'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : order.status === 'Sedang Diproses'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sky-100 text-[#0072bc] border border-sky-300'
                      }`}
                    >
                      {order.status === 'Telah Diposkan' ? '🚚 Telah Diposkan' : order.status === 'Sedang Diproses' ? '⚙️ Sedang Diproses' : '⏳ Baru'}
                    </span>

                    {/* Receipt Button */}
                    <button
                      type="button"
                      onClick={() => setActiveReceiptOrder(order)}
                      className="parent-blue-surface inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs hover:bg-[#005ea6] transition"
                    >
                      <FileText className="h-3 w-3" /> Resit
                    </button>
                  </div>

                  {order.trackingNumber ? (
                    <div className="flex items-center gap-1.5">
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                          {order.trackingNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(order.trackingNumber || '');
                          setCopiedTrackingId(order.id);
                          setTimeout(() => setCopiedTrackingId(null), 2000);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-[#0072bc] bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition"
                        title="Salin Nombor Tracking"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedTrackingId === order.id ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Tracking akan dikemaskini</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Order Receipt Modal */}
      {activeReceiptOrder && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setActiveReceiptOrder(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#bce2f7] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#143763]">Resit Pesanan Rasmi Exploria</h3>
                <p className="font-mono text-xs font-bold text-[#0072bc]">{activeReceiptOrder.orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="rounded-xl bg-[#f0f7fc] p-3 space-y-1.5 border border-[#d2e7f7]">
                <p><strong>Produk:</strong> {activeReceiptOrder.productName}</p>
                <p><strong>Pertandingan:</strong> {activeReceiptOrder.awardTitle}</p>
                <p><strong>Penerima (Anak):</strong> {activeReceiptOrder.childName}</p>
                <p><strong>Penjaga:</strong> {activeReceiptOrder.guardianName} ({activeReceiptOrder.phone})</p>
                <p><strong>Alamat:</strong> {activeReceiptOrder.deliveryAddress}</p>
                <p><strong>Jumlah Bayaran:</strong> RM{activeReceiptOrder.totalAmount?.toFixed(2)}</p>
                <p><strong>Status:</strong> <span className="font-bold text-[#0072bc]">{activeReceiptOrder.status}</span></p>
                {activeReceiptOrder.trackingNumber && (
                  <p><strong>No. Tracking:</strong> <span className="font-mono font-bold text-slate-900">{activeReceiptOrder.trackingNumber}</span></p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="parent-blue-surface inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#005ea6] transition"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak Resit
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

