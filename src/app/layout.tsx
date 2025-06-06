import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Toaster } from '@/components/ui/sonner';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

const helveticaNeue = localFont({
  src: [
    {
      path: '../../public/font/HelveticaNeueMedium.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/font/HelveticaNeueBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/font/HelveticaNeueMediumItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/font/HelveticaNeueBoldItalic.otf',
      weight: '600',
      style: 'italic',
    },
  ],
});

export const metadata: Metadata = {
  title: 'Seal',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${helveticaNeue.className}`}>
        <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
          <div className="relative flex min-h-svh flex-col bg-background">
            {children}
          </div>
          <div className="z-50 fixed bottom-5 right-5">
            <ThemeSwitcher />
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
