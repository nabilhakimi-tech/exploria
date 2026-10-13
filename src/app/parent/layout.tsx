import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/auth/LogoutButton';
import ParentNavLinks from '@/components/parent/ParentNavLinks';
import ParentHeader from '@/components/parent/ParentHeader';

export default function ParentLayout({ children }: LayoutProps<'/parent'>) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f5f7fa] text-[#22303c] min-[1001px]:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="flex items-center justify-between border-b border-[#e5ebf1] bg-white px-4 py-3 min-[1001px]:sticky min-[1001px]:top-0 min-[1001px]:flex min-[1001px]:flex-col min-[1001px]:h-screen min-[1001px]:border-b-0 min-[1001px]:border-r min-[1001px]:border-[#e5ebf1] min-[1001px]:px-0 min-[1001px]:py-[22px]">
        <div className="flex items-center gap-2.5 min-[1001px]:px-[22px] min-[1001px]:pb-6">
          <Link href="/parent" className="transition hover:opacity-90" title="Ke Laman Utama Ibu Bapa">
            <Image
              src="/logoexploria.png"
              alt="Exploria"
              width={784}
              height={217}
              priority
              className="h-auto w-[190px] max-w-full"
            />
          </Link>
        </div>
        <ParentNavLinks />
        <div className="hidden min-[1001px]:block min-[1001px]:mt-auto min-[1001px]:w-full min-[1001px]:px-4 min-[1001px]:pt-4 min-[1001px]:border-t min-[1001px]:border-[#e5ebf1]">
          <LogoutButton
            variant="parent"
            buttonClassName="w-full justify-center border-[#0072bc]/40 bg-sky-50 text-[#0072bc] hover:bg-[#0072bc] hover:text-white transition font-bold"
          />
        </div>
      </aside>

      <div className="min-w-0">
        <ParentHeader />
        <main className="mx-auto min-h-[calc(100vh-58px)] w-full max-w-[1440px] bg-[#f5f7fa] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
