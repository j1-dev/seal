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
  RiSettings5Line,
  RiSettings5Fill,
  RiMessage3Line,
  RiMessage3Fill,
  RiLogoutBoxLine,
} from 'react-icons/ri';
import { cn } from '@/utils/utils';
import { signOutAction } from '@/app/actions';
import Logo from '@/components/logo';
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
    <aside className="border-border fixed top-0 z-50 h-full w-40 border-r">
      <div className="container flex flex-col h-full items-end p-3">
        {/* Logo */}
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2 w-96 h-24 relative">
            <Logo size={84} className="absolute right-28 top-1" />
            <span className="font-black text-5xl absolute right-0 top-7">
              Seal
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col items-end gap-4 text-sm flex-grow">
          <Link
            href="/home"
            className={cn(
              'transition-colors hover:text-foreground/80 pb-1',
              pathname === '/home' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg">Home</span>
              {pathname === '/home' ? (
                <HiHome size={32} />
              ) : (
                <HiOutlineHome size={32} />
              )}
            </div>
          </Link>
          <Link
            href="/discover"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1',
              pathname?.startsWith('/discover') ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg">Discover</span>
              {pathname?.startsWith('/discover') ? (
                <RiSearchFill size={32} />
              ) : (
                <RiSearchLine size={32} />
              )}
            </div>
          </Link>
          <Link
            href="/notifications"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1',
              pathname === '/notifications' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2 relative">
              <span className="pr-2 pt-2 text-lg">Notifications</span>
              {pathname === '/notifications' ? (
                <RiNotification3Fill size={32} />
              ) : (
                <RiNotification3Line size={32} />
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
              'transition-colors hover:text-foreground/80 py-1',
              pathname?.startsWith('/u') ? 'font-black' : 'font-normal'
            )}
            prefetch={true}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg">Profile</span>
              {pathname?.startsWith('/u') ? (
                <RiUser3Fill size={32} />
              ) : (
                <RiUser3Line size={32} />
              )}
            </div>
          </Link>
          <Link
            href="/messages"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1',
              pathname === '/messages' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg">Messages</span>
              {pathname === '/messages' ? (
                <RiMessage3Fill size={32} />
              ) : (
                <RiMessage3Line size={32} />
              )}
            </div>
          </Link>
        </nav>

        {/* Bottom Links */}
        <div className="mt-auto flex flex-col items-end gap-4 text-sm">
          <Link
            href="/settings"
            className={cn(
              'transition-colors hover:text-foreground/80 py-1',
              pathname === '/settings' ? 'font-black' : 'font-normal'
            )}>
            <div className="inline-flex items-center gap-2">
              <span className="pr-2 pt-2 text-lg">Settings</span>
              {pathname === '/settings' ? (
                <RiSettings5Fill size={32} />
              ) : (
                <RiSettings5Line size={32} />
              )}
            </div>
          </Link>
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
