'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  BookOpen,
  CircleHelp,
  Home,
  Megaphone,
  Settings,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react';

const links = [
  { href: '/staff', label: 'Dashboard', icon: Home, text: true },
  { href: '/staff/sections/subjects', label: 'Subjek dan bahan', icon: BookOpen },
  { href: '/staff/sections/questions', label: 'Bank soalan', icon: CircleHelp },
  { href: '/staff/sections/competitions', label: 'Pertandingan', icon: Trophy },
  { href: '/staff/sections/parents', label: 'Ibu bapa', icon: UsersRound },
  { href: '/staff/sections/students', label: 'Pelajar', icon: UserRound },
  { href: '/staff/sections/awards', label: 'Anugerah dan lencana', icon: Award },
  { href: '/staff/sections/announcements', label: 'Pengumuman', icon: Megaphone },
  { href: '/staff/sections/settings', label: 'Tetapan pentadbir', icon: Settings },
];

export function StaffNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link, index) => {
        const isActive =
          index === 0
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            aria-label={link.label}
            className={`staff-nav-link${link.text ? ' staff-nav-dashboard' : ''}${isActive ? ' is-active' : ''}`}
            href={link.href}
            key={`${link.label}-${index}`}
            onClick={onNavigate}
            title={link.label}
          >
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            <span className={link.text ? undefined : 'staff-nav-label'}>{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}
