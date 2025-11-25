'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  size: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size, className }) => {
  /* 1.  Start with light (SSR-safe). */
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    /* 2.  As soon as we mount, read the real preference. */
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mql.matches);

    /* 3.  Keep listening if the user changes OS setting. */
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return (
    <Image
      src={process.env.NEXT_PUBLIC_LOGO!}
      alt="Logo"
      width={size}
      height={size}
      className={`${className} ${isDark ? 'invert' : ''}`}
      suppressHydrationWarning
    />
  );
};

export default Logo;
