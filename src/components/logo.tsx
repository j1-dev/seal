'use client';
import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface LogoProps {
  size: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size, className }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  return (
    <Image
      src={process.env.NEXT_PUBLIC_LOGO!}
      alt="Logo"
      width={size}
      height={size}
      className={`${className} ${isDarkMode ? 'invert' : ''}`}
      suppressHydrationWarning
    />
  );
};

export default Logo;
