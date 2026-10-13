import Image from 'next/image';
import Link from 'next/link';

interface ExploriaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}

export default function ExploriaLogo({
  className = '',
  size = 'md',
  showTagline = false,
  href = '/',
}: ExploriaLogoProps) {
  const dimensions = {
    sm: { width: 140, height: 42 },
    md: { width: 180, height: 55 },
    lg: { width: 240, height: 73 },
  }[size];

  const content = (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="relative flex items-center gap-2.5">
        <Image
          src="/logoexploria.png"
          alt="Exploria Logo"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="h-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
          style={{ width: `${dimensions.width}px` }}
        />
      </div>
      {showTagline && (
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
          Explore Beyond Limits
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
