import type { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-green" aria-hidden="true" />
      <div className="auth-orb auth-orb-orange" aria-hidden="true" />

      <section className="auth-card" aria-label="Exploria Skill Portal">
        <div className="auth-hero">
          <div className="auth-hero-copy">
            <Image
              src="/logoexploria.png"
              alt="Exploria"
              width={800}
              height={244}
              priority
              className="auth-hero-logo"
            />
            <p className="auth-hero-tagline">Explore Beyond Limits</p>
          </div>
          <span className="auth-hero-kicker">EXPLORE · LEARN · GROW</span>
        </div>

        <div className="auth-panel">{children}</div>
      </section>

      <p className="auth-footer">© 2026 Exploria Skill Portal</p>
    </main>
  );
}
