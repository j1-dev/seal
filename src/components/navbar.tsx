'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineHome, HiHome } from 'react-icons/hi';
import {
  RiSearchLine,
  RiSearchFill,
  RiNotification3Line,
  RiNotification3Fill,
  RiUser3Line,
  RiUser3Fill,
  // RiSettings5Line,
  // RiSettings5Fill,
  // RiMessage3Line,
  // RiMessage3Fill,
  RiLogoutBoxLine,
} from 'react-icons/ri';
import { cn } from '@/utils/utils';
import { signOutAction } from '@/app/actions';
import { Logo } from '@/components/logo';
import { useUser } from '@/utils/context/auth';
import { useEffect, useState } from 'react';
import {
  getNotificationCount,
  subscribeToNotifications,
} from '@/utils/services';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadNotificationCount = async () => {
      const data = await getNotificationCount(user?.id as string);
      setNotificationCount(data);

      unsubscribe = await subscribeToNotifications(
        user?.id as string,
        (update) => {
          console.log(update.type);
          switch (update.type) {
            case 'NOTIFICATION_INSERT':
              setNotificationCount((prev) => prev + 1);
              break;
            case 'NOTIFICATION_DELETE':
              setNotificationCount((prev) => prev - 1);
              break;
            default:
              console.log('type not allowed');
              break;
          }
        }
      );
    };

    if (user?.id) {
      loadNotificationCount();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, pathname]);

  return (
    <aside className="border-border fixed bottom-0 left-0 z-50 w-full h-16 border-t md:static md:top-0 md:left-0 md:h-full md:w-40 md:border-r md:border-t-0">
      <div className="container flex items-center md:flex-col h-full md:h-screen md:items-end p-2 md:p-3 justify-around md:justify-end">
        {/* Logo (hidden on small screens) */}
        <div className="mb-0 md:mb-4 hidden md:block">
          <Link href="/" className="flex items-center gap-2 w-96 h-24 relative">
            <Logo size={84} className="absolute right-28 top-1" />
            <span className="font-black text-5xl absolute right-0 top-7">
              Seal
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-4 text-sm flex-grow justify-around md:justify-start w-full md:w-auto">
          <Link
            href="/home"
            className={cn(
              'transition-colors hover:text-foreground/80 pb-1 flex items-center justify-center',
              pathname === '/home' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg hidden md:inline">Home</span>
              {pathname === '/home' ? (
                <HiHome size={24} />
              ) : (
                <HiOutlineHome size={24} />
              )}
            </div>
          </Link>
          <Link
            href="/discover"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1 flex items-center justify-center',
              pathname?.startsWith('/discover') ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg hidden md:inline">
                Discover
              </span>
              {pathname?.startsWith('/discover') ? (
                <RiSearchFill size={24} />
              ) : (
                <RiSearchLine size={24} />
              )}
            </div>
          </Link>
          <Link
            href="/notifications"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1 flex items-center justify-center',
              pathname === '/notifications' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2 relative">
              <span className="pr-2 pt-2 text-lg hidden md:inline">
                Notifications
              </span>
              {pathname === '/notifications' ? (
                <RiNotification3Fill size={24} />
              ) : (
                <RiNotification3Line size={24} />
              )}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {notificationCount}
                </span>
              )}
            </div>
          </Link>
          <Link
            href={`/u/${user?.id}`}
            className={cn(
              'transition-colors hover:text-foreground/80 py-1 flex items-center justify-center',
              pathname?.startsWith('/u') ? 'font-black' : 'font-normal'
            )}
            prefetch={true}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg hidden md:inline">
                Profile
              </span>
              {pathname?.startsWith('/u') ? (
                <RiUser3Fill size={24} />
              ) : (
                <RiUser3Line size={24} />
              )}
            </div>
          </Link>

          {/* Logout on mobile as an icon (show only on small screens) */}
          <div
            onClick={() => {
              signOutAction();
            }}
            className="md:hidden transition-colors hover:text-red-500/80 py-1 cursor-pointer text-red-500 flex items-center justify-center">
            <RiLogoutBoxLine size={24} />
          </div>
        </nav>

        {/* Bottom Links (desktop stacked) */}
        <div className="hidden md:flex mt-auto flex-col items-end gap-4 text-sm">
          <div
            onClick={() => {
              signOutAction();
            }}
            className="transition-colors hover:text-red-500/80 py-1 cursor-pointer text-red-500">
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg font-semibold">Logout</span>
              <RiLogoutBoxLine size={32} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
