'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/utils';

export function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="border-border fixed top-0 z-50 h-full w-40 border-r">
      <div className="container flex flex-col h-full items-end p-4">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-5xl">Plaza</span>
          </Link>
        </div>
        <nav className="flex flex-col items-end gap-4 text-sm">
          <Link
            href="/home"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/home' ? 'text-foreground' : 'text-foreground/80'
            )}>
            Home
          </Link>
          <Link
            href="/discover"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname?.startsWith('/discover')
                ? 'text-foreground'
                : 'text-foreground/80'
            )}>
            Discover
          </Link>
          {/* Add more links as needed */}
        </nav>
      </div>
    </aside>
  );
}
