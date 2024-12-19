'use client';

import { signOutAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

export default function Home() {
  // const [userData, setUserData] = useState();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then((user) => {
      console.log(user);
    });
  });
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
      <div
        className=" rounded-2xl dark:bg-neutral-950 bg-neutral-100
                     text-8xl font-black transition-all 
                     cursor-pointer group shadow hover:shadow-xl"
        onClick={() => {
          signOutAction();
        }}>
        Hello
      </div>
    </div>
  );
}
