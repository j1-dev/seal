import Morph from '@/components/morph';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Link href={'/login'}>
        <Logo size={94} className="w-60 mx-auto" />
        <Morph texts={['Hey!', 'Join us!']} />
      </Link>
    </div>
  );
}
