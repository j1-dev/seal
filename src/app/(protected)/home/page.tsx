'use client';

import Feed from '@/components/post-feed';
import { Sendbox } from '@/components/send-box';
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
      <Sendbox />
      <Feed />
    </div>
  );
}
