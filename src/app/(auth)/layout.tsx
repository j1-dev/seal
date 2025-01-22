import Logo from '@/components/logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen space-y-4">
      <Link href="/" className="text-8xl font-black">
        <Logo size={196} />
      </Link>
      {children}
    </div>
  );
}
