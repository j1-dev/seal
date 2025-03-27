'use client';

import Feed from '@/components/discover-feed';
import TopBar from '@/components/tob-bar';
import { Separator } from '@/components/ui/separator';
// import { createClient } from '@/utils/supabase/client';
// import { useEffect } from 'react';

export default function Home() {
  // const [userData, setUserData] = useState();
  // const supabase = createClient();

  // useEffect(() => {
  //   supabase.auth.getUser().then((user) => {
  //     console.log(user);
  //   });
  // });

  return (
    <div>
      <TopBar title="Discover" />
      <Separator />
      <Feed />
    </div>
  );
}
