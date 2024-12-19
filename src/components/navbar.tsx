'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/utils';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
              <span className="hidden font-bold lg:inline-block">Plaza</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm xl:gap-6">
              <Link
                href="/home"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === '/home'
                    ? 'text-foreground'
                    : 'text-foreground/80'
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
              <Link
                href="/profile"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname?.startsWith('/profile')
                    ? 'text-foreground'
                    : 'text-foreground/80'
                )}>
                Profile
              </Link>
              <Link
                href="/chats"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname?.startsWith('/chats')
                    ? 'text-foreground'
                    : 'text-foreground/80'
                )}>
                Chats
              </Link>
            </nav>
            <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
              {/*
              TODO:  
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <SearchBar />
                <SideMenu />
              </div> 
              */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
