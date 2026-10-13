'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* 1. NAVBAR                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
interface LandingNavProps {
  userRole?: string;
  userEmail?: string;
}

export function LandingNavbar({ userRole, userEmail }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashHref = userRole === 'parent' ? '/parent' : '/student';
  const dashLabel = userRole === 'parent' ? 'Portal Ibu Bapa' : 'Portal Pelajar';

  return (
    <nav className="nav">
      {/* Logo using /logoexploria.png */}
      <Link href="/" className="logo">
        <Image
          src="/logoexploria.png"
          alt="Exploria Skill Portal"
          width={130}
          height={40}
          style={{ height: 38, width: 'auto', objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Desktop Links */}
      <div className="navlinks">
        <a href="#home">Utama</a>
        <a href="#programs">Silibus</a>
        <a href="#about">Ciri-ciri</a>
        <a href="#pricing">Pilihan Portal</a>
      </div>

      {/* CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {userEmail ? (
          <Link className="nav-cta" href={dashHref}>
            {dashLabel} ↗
          </Link>
        ) : (
          <Link className="nav-cta" href="/register">
            Mula Sekarang ↗
          </Link>
        )}

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 0,
            cursor: 'pointer',
            padding: 4,
          }}
          className="mobile-hamburger-btn"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: 62,
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            zIndex: 50,
          }}
        >
          <a href="#home" onClick={() => setMobileOpen(false)} style={{ fontWeight: 700 }}>Utama</a>
          <a href="#programs" onClick={() => setMobileOpen(false)} style={{ fontWeight: 700 }}>Silibus</a>
          <a href="#about" onClick={() => setMobileOpen(false)} style={{ fontWeight: 700 }}>Ciri-ciri</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ fontWeight: 700 }}>Pilihan Portal</a>
          <Link
            href="/student"
            className="btn"
            onClick={() => setMobileOpen(false)}
            style={{ textAlign: 'center' }}
          >
            Portal Pelajar ↗
          </Link>
          <Link
            href="/parent"
            className="btn"
            onClick={() => setMobileOpen(false)}
            style={{ textAlign: 'center', background: '#222' }}
          >
            Portal Ibu Bapa ↗
          </Link>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 2. PROGRAMS SECTION (Silibus SK & SMK)                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
export function LandingProgramsSection() {
  const [active, setActive] = useState(2); // Default to Matematik

  const subjects = [
    { kicker: 'Tahun 1–6', emoji: '🔤', title: 'Bahasa Melayu', desc: 'Tatabahasa, pemahaman & penulisan karangan DSKP.' },
    { kicker: 'Tahun 1–6', emoji: '🎨', title: 'Bahasa Inggeris', desc: 'Grammar, vocabulary, reading & CEFR Aligned.' },
    { kicker: 'Tahun 1–6', emoji: '🌱', title: 'Matematik', desc: 'Sifir pantas, operasi nombor & penyelesaian masalah.' },
    { kicker: 'Tahun 1–6', emoji: '🦒', title: 'Sains', desc: 'Inkuiri sains, sains hayat & fenomena alam sekitar.' },
    { kicker: 'Tahun 4–6', emoji: '🧪', title: 'Sejarah', desc: 'Tokoh kemerdekaan, sejarah & warisan Malaysia.' },
  ];

  return (
    <>
      <div className="subject-row">
        {subjects.map((sub, idx) => (
          <article
            key={idx}
            className={`subject ${active === idx ? 'active' : ''}`}
            onClick={() => setActive(idx)}
          >
            <span
              className="kicker"
              style={{
                background: active === idx ? 'rgba(255,255,255,0.2)' : undefined,
                color: active === idx ? '#fff' : undefined,
              }}
            >
              {sub.kicker}
            </span>
            <span className="emoji">{sub.emoji}</span>
            <h3>{sub.title}</h3>
            <p>{sub.desc}</p>
          </article>
        ))}
      </div>
      <div className="dots">
        {subjects.map((_, idx) => (
          <span
            key={idx}
            className={active === idx ? 'on' : ''}
            onClick={() => setActive(idx)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 3. TESTIMONIALS SECTION                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
export function LandingTestimonialsSection() {
  const [activeDot, setActiveDot] = useState(1);

  return (
    <section className="testimonials">
      <span className="kicker">Testimoni</span>
      <h2>
        Apa Kata Ibu Bapa<br />
        Tentang Anak Mereka
      </h2>
      <div className="quotes">
        <article className="quote">
          <span className="stars">★★★★★</span>
          <p>
            &ldquo;Anak saya kini ternanti-nanti nak jawab kuiz setiap petang. Mod Pantas Sifir sangat membantu kepantasan mencongak!&rdquo;
          </p>
          <div className="person">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80"
              alt="Puan Sarah"
            />
            <span>
              Puan Sarah L.<br />
              <small>Ibu kepada Mia (Tahun 4)</small>
            </span>
          </div>
        </article>

        <article className="quote">
          <span className="stars">★★★★★</span>
          <p>
            &ldquo;Portal ibu bapa memudahkan saya tengok topik mana anak lemah. Sistem syiling ganjaran pula bakar semangat dia!&rdquo;
          </p>
          <div className="person">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
              alt="Encik Faris"
            />
            <span>
              Encik Faris A.<br />
              <small>Bapa kepada Adam (Tahun 6)</small>
            </span>
          </div>
        </article>

        <article className="quote">
          <span className="stars">★★★★★</span>
          <p>
            &ldquo;Anak-anak kembar saya lebih yakin dan teruja belajar. Silibus KSSR &amp; KSSM lengkap memudahkan ulangkaji sebelum peperiksaan.&rdquo;
          </p>
          <div className="person">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
              alt="Puan Jason"
            />
            <span>
              Puan Jason W.<br />
              <small>Ibu kepada anak kembar</small>
            </span>
          </div>
        </article>
      </div>

      <div className="dots" style={{ marginTop: 25 }}>
        <span className={activeDot === 0 ? 'on' : ''} onClick={() => setActiveDot(0)} style={{ cursor: 'pointer' }} />
        <span className={activeDot === 1 ? 'on' : ''} onClick={() => setActiveDot(1)} style={{ cursor: 'pointer' }} />
        <span className={activeDot === 2 ? 'on' : ''} onClick={() => setActiveDot(2)} style={{ cursor: 'pointer' }} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4. PRICING / PORTAL SECTION TOGGLE                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
export function LandingPricingSection() {
  const [activePortal, setActivePortal] = useState<'student' | 'parent'>('student');

  return (
    <section className="section pricing" id="pricing">
      <div className="pricing-top">
        <div>
          <span className="kicker">Pilihan Portal</span>
          <h2>
            Pilih Gerbang<br />
            Pengembaraan Anda
          </h2>
        </div>
        <div
          className="toggle"
          onClick={() => setActivePortal(activePortal === 'student' ? 'parent' : 'student')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ color: activePortal === 'student' ? 'var(--orange)' : undefined, fontWeight: 900 }}>
            Pelajar
          </span>
          <span
            className="switch"
            style={{
              justifyContent: activePortal === 'parent' ? 'flex-end' : 'flex-start',
            }}
          >
            <span />
          </span>
          <span style={{ color: activePortal === 'parent' ? 'var(--orange)' : undefined, fontWeight: 900 }}>
            Ibu Bapa
          </span>
        </div>
      </div>

      <div className="plans">
        {/* Portal Pelajar */}
        <article className="plan coral">
          <div>
            <h3>Portal Pelajar</h3>
            <p>Sesuai untuk murid SK &amp; SMK meneroka ilmu dengan seronok.</p>
            <div className="price">
              Percuma <small>/ untuk bermula</small>
            </div>
            <Link className="btn" href="/student">
              Masuk Portal Pelajar
            </Link>
            <p style={{ marginTop: 15 }}>
              <b>Apa yang disediakan:</b>
            </p>
            <ul>
              <li>Kuiz DSKP Tahun 1 hingga Tingkatan 5</li>
              <li>Cabaran Pantas Sifir &amp; Ejaan</li>
              <li>Streak harian &amp; mata ganjaran XP</li>
              <li>Penebusan hadiah fizikal sebenar</li>
              <li>Penjana sijil digital pencapaian</li>
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80"
            alt="Murid belajar"
          />
        </article>

        {/* Portal Ibu Bapa */}
        <article className="plan gold">
          <div>
            <h3>Portal Ibu Bapa</h3>
            <p>Pantau perkembangan akademik dan bimbing anak ke mercu jaya.</p>
            <div className="price">
              Percuma <small>/ akses penuh</small>
            </div>
            <Link className="btn" href="/parent">
              Masuk Portal Ibu Bapa
            </Link>
            <p style={{ marginTop: 15 }}>
              <b>Apa yang disediakan:</b>
            </p>
            <ul>
              <li>Pantau beberapa profil anak sekaligus</li>
              <li>Laporan kemajuan masa nyata &amp; analitik</li>
              <li>Pengesahan penebusan hadiah syiling</li>
              <li>Penjejak streak &amp; keaktifan harian</li>
              <li>Sokongan bimbingan silibus KPM</li>
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=80"
            alt="Ibu bapa dan murid"
          />
        </article>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 5. FOOTER                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export function LandingFooter() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <span className="eyebrow">Teruskan Pengembaraan Ilmu</span>
        <h2>
          Bawa Lebih Banyak Pengembaraan<br />
          Pembelajaran Ke Rumah
        </h2>
        <p>
          Dapatkan kuiz interaktif, tips silibus sekolah, dan aktiviti menarik terus ke emel anda.
        </p>
        <form
          className="email-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert('Terima kasih! Anda telah berjaya melanggan buletin Exploria.');
          }}
        >
          <input
            type="email"
            placeholder="Alamat emel anda"
            required
            aria-label="Alamat emel anda"
          />
          <button type="submit">Langgan →</button>
        </form>
      </div>

      <div className="footer-cols">
        <div>
          <Link href="/" className="logo" style={{ marginBottom: 12 }}>
            <Image
              src="/logoexploria.png"
              alt="Exploria Skill Portal"
              width={120}
              height={36}
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <p>
            Platform pembelajaran gamifikasi interaktif untuk minda cilik dan remaja Malaysia.
          </p>
          <div className="social">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Pinterest">p</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <div>
          <h4>Pautan Pantas</h4>
          <a href="#home">Utama</a>
          <a href="#about">Ciri-ciri</a>
          <a href="#programs">Silibus DSKP</a>
          <a href="#pricing">Pilihan Portal</a>
        </div>

        <div>
          <h4>Pilihan Portal</h4>
          <Link href="/student">Portal Pelajar</Link>
          <Link href="/parent">Portal Ibu Bapa</Link>
          <a href="#pricing">Langganan</a>
          <a href="#faq">Pusat Bantuan</a>
        </div>

        <div>
          <h4>Sokongan</h4>
          <a href="#">Hubungi Kami</a>
          <a href="#">Soalan Lazim (FAQ)</a>
          <a href="#">Dasar Privasi</a>
          <a href="#">Terma &amp; Syarat</a>
        </div>
      </div>

      <div className="copyright">
        © 2026 Exploria Skill Portal. Hak cipta terpelihara. Dicipta khas untuk pelajar Malaysia.
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* LEGACY STUBS (to ensure backwards compatibility)                           */
/* ─────────────────────────────────────────────────────────────────────────── */
export function LiveInteractiveQuizCard() { return null; }
export function SyllabusInteractiveSection() { return null; }
export function FaqAccordion() { return null; }
export function ReviewsCarousel() { return null; }
export function LandingFeatureGrid() { return null; }
export function LandingImpactSection() { return null; }
export function LandingWhySection() { return null; }
