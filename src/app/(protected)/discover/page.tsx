'use client';

import Feed from '@/components/feeds/discover-feed';
import TopBar from '@/components/tob-bar';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div>
      <TopBar title="Discover" />
      <Separator />
      <Feed />
    </div>
  );
}
