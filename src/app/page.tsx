import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServer } from '@/lib/supabase/server';
import {
  LandingNavbar,
  LandingProgramsSection,
  LandingTestimonialsSection,
  LandingPricingSection,
  LandingFooter,
} from '@/components/landing/LandingClientComponents';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let userEmail: string | undefined;
  let userRole: 'student' | 'parent' | 'staff' | 'admin' = 'parent';

  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email;
      userRole = (user.user_metadata?.role as any) || 'parent';
    }
  } catch {}

  return (
    <div className="landing-wrapper">
      <div className="site">
        <main className="page">

          {/* ══ 1. HERO WRAP & NAVBAR ═════════════════════════════════════════ */}
          <header className="hero-wrap" id="home">
            <LandingNavbar userRole={userRole} userEmail={userEmail} />

            <div className="hero-copy hero">
              <span className="eyebrow">Platform Gamifikasi Murid SK &amp; SMK Malaysia</span>
              <h1>
                Pengembaraan Belajar <span>Bermula Dengan Rasa Ingin Tahu!</span>
              </h1>
              <p>
                Dunia kuiz interaktif DSKP, cabaran Pantas Sifir, lencana pencapaian &amp; hadiah sebenar — menjadikan pembelajaran seronok untuk murid SK &amp; SMK.
              </p>
              <Link className="btn" href="/register">
                Mula Sekarang &nbsp; →
              </Link>
            </div>

            <div className="hero-art">
              <span className="float f1">✿</span>
              <span className="float f2">🪁</span>
              <span className="float f3">🦋</span>
              <span className="float f4">✿</span>
              <img
                className="hero-photo"
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85"
                alt="Pelajar belajar bersama"
              />
            </div>
          </header>

          {/* ══ 2. WAVE DIVIDER ═══════════════════════════════════════════════ */}
          <div className="wave" />

          {/* ══ 3. ABOUT / FEATURE GRID ═══════════════════════════════════════ */}
          <section className="section" id="about">
            <div className="section-head">
              <div>
                <span className="kicker">Pembelajaran Menyeronokkan</span>
                <h2>
                  Dicipta Untuk Minda Cilik<br />
                  &amp; Imaginasi Hebat
                </h2>
              </div>
              <Link className="btn" href="/login">
                Terokai Selanjutnya ↗
              </Link>
            </div>

            <div className="feature-grid">
              <article className="feature mint">
                <div>
                  <h3>Belajar Sambil Bermain</h3>
                  <p>Kuiz interaktif DSKP mengubah pembelajaran menjadi pengembaraan penuh XP dan syiling.</p>
                </div>
                <Link className="circle-link" href="/login">↗</Link>
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=500&q=80"
                  alt="Belajar sambil bermain"
                />
              </article>

              <article className="feature pink">
                <div>
                  <h3>Teroka Pelbagai Subjek</h3>
                  <p>Matematik, Sains, Bahasa Melayu, BI &amp; Sejarah mengikut silibus DSKP rasmi KPM.</p>
                </div>
                <Link className="circle-link" href="/login">↗</Link>
                <img
                  src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=500&q=80"
                  alt="Teroka pelbagai subjek"
                />
              </article>

              <article className="feature blue">
                <div>
                  <h3>Raikan Setiap Kejayaan</h3>
                  <p>Naik level, kumpul lencana, tebus hadiah fizikal dan jana sijil pencapaian digital rasmi.</p>
                </div>
                <Link className="circle-link" href="/login">↗</Link>
                <img
                  src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=500&q=80"
                  alt="Raikan kejayaan"
                />
              </article>

              <article className="feature yellow">
                <div>
                  <h3>Membesar Bersama Keluarga</h3>
                  <p>Ibu bapa pantau kemajuan anak secara masa nyata untuk membina tabiat belajar konsisten.</p>
                </div>
                <Link className="circle-link" href="/login">↗</Link>
                <img
                  src="https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=500&q=80"
                  alt="Membesar bersama keluarga"
                />
              </article>
            </div>
          </section>

          {/* ══ 4. PROGRAMS / SILIBUS ═════════════════════════════════════════ */}
          <section className="programs" id="programs">
            <span className="kicker">Silibus Kebangsaan DSKP</span>
            <h2>
              Silibus Lengkap SK &amp; SMK<br />
              Semua Peringkat
            </h2>
            <LandingProgramsSection />
          </section>

          {/* ══ 5. IMPACT & STATS (ORANGE SECTION) ════════════════════════════ */}
          <section className="impact">
            <span className="eyebrow">Bersama Mencapai Kecemerlangan</span>
            <h2>
              Setiap Murid Mempunyai Potensi<br />
              Kehebatan Di Dalam Diri
            </h2>

            <div className="kids">
              <img
                src="https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=250&q=80"
                alt="Murid ceria"
              />
              <img
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=250&q=80"
                alt="Murid tersenyum"
              />
              <img
                src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=250&q=80"
                alt="Murid belajar"
              />
            </div>

            <div className="rating">
              4.9/5 &nbsp;<span className="stars">★★★★★</span>
            </div>

            <p className="desc">
              Di Exploria Skill Portal, pembelajaran menjadi sangat seronok dengan aktiviti kuiz interaktif, cabaran Pantas Sifir dan pengalaman menarik setiap hari.
            </p>

            <Link className="btn" href="/login">
              Terokai Selanjutnya ↗
            </Link>

            <div className="stats">
              <div className="stat purple">
                <strong>1,000+</strong>
                <span>Soalan Kuiz DSKP</span>
              </div>
              <div className="stat green">
                <strong>50+</strong>
                <span>Cabaran Mingguan</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80"
                alt="Young learner"
              />
              <div className="stat pinkstat">
                <strong>98%</strong>
                <span>Kepuasan Ibu Bapa</span>
              </div>
              <div className="stat orange">
                <strong>100%</strong>
                <span>Hadiah Fizikal &amp; Sijil</span>
              </div>
            </div>
          </section>

          {/* ══ 6. WHY CHOOSE US ══════════════════════════════════════════════ */}
          <section className="section why">
            <div className="why-copy">
              <span className="kicker">Kenapa pilih kami</span>
              <h2>Lihat kenapa belajar di sini lebih seronok</h2>
              <p>
                Langkah kecil membawa kepada penemuan besar. Berikan anak anda tempat ceria untuk meneroka minat dan membina kemahiran sepanjang hayat.
              </p>
              <Link className="btn" href="/login">
                Terokai Selanjutnya ↗
              </Link>
            </div>

            <div className="why-grid">
              <article className="why-card mint">
                <h3>Belajar Sambil Bermain</h3>
                <p>Aktiviti interaktif jadikan sesi ulangkaji seperti pengembaraan bermakna.</p>
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=450&q=80"
                  alt="Belajar sambil bermain"
                />
              </article>

              <article className="why-card yellow">
                <h3>Dicipta Untuk Minda Cergas</h3>
                <p>Cabaran Pantas Sifir &amp; Ejaan untuk minda yang pantas dan fokus.</p>
                <img
                  src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=450&q=80"
                  alt="Minda cergas"
                />
              </article>

              <article className="why-card" style={{ background: '#e9f7e3' }}>
                <h3>Belajar Ikut Rentak Sendiri</h3>
                <p>Setiap murid diberi ruang untuk maju mengikut keupayaan tersendiri.</p>
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=450&q=80"
                  alt="Belajar ikut rentak"
                />
              </article>

              <article className="why-card" style={{ background: '#fcebf4' }}>
                <h3>Ibu Bapa Sentiasa Terhubung</h3>
                <p>Pantau rekod kemajuan, analisis topik lemah &amp; sahkan ganjaran bersama.</p>
                <img
                  src="https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=450&q=80"
                  alt="Ibu bapa terhubung"
                />
              </article>
            </div>
          </section>

          {/* ══ 7. TESTIMONIALS ═══════════════════════════════════════════════ */}
          <LandingTestimonialsSection />

          {/* ══ 8. PRICING / PORTAL OPTIONS ═══════════════════════════════════ */}
          <LandingPricingSection />

          {/* ══ 9. FOOTER ═════════════════════════════════════════════════════ */}
          <LandingFooter />

        </main>
      </div>
    </div>
  );
}