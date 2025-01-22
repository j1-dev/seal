'use client';
import Logo from '@/components/logo';
import { Marquee } from '@/components/marquee';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="h-screen w-full">
      <div
        className="p-0.5 rounded-2xl absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-br 
                 from-neutral-200 via-blue-200 to-pink-200 animated-background"
        onClick={() => {
          router.push('/login');
        }}>
        <div
          className="h-96 w-96 rounded-2xl dark:bg-neutral-950 bg-neutral-100
                     text-8xl font-black p-9 pt-[46px] transition-all 
                     hover:bg-transparent hover:dark:bg-transparent hover:dark:text-neutral-900 duration-1000 
                     cursor-wait group shadow hover:shadow-xl">
          <Logo size={500} />
        </div>
      </div>
      <Marquee>
        <span className="text-2xl font-black italic">
          ~ comming soon ~ comming soon ~ comming soon ~ cumming soon ~ comming
          soon ~ comming soon ~ comming soon ~ comming soon ~ comming soon ~
        </span>
      </Marquee>
    </div>
  );
}
