import { notFound } from 'next/navigation';
import { StaffSectionPage } from '@/components/staff/StaffSectionPage';

const sectionSlugs = [
  'subjects',
  'questions',
  'competitions',
  'parents',
  'students',
  'awards',
  'announcements',
  'settings',
] as const;

function isSectionSlug(section: string): section is (typeof sectionSlugs)[number] {
  return sectionSlugs.some((slug) => slug === section);
}

export default async function StaffSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSectionSlug(section)) notFound();

  return <StaffSectionPage section={section} />;
}
