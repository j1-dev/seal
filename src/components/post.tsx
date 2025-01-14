import { Post, User } from '@/utils/types';
import React, { useState, useEffect } from 'react';
import { getUserById } from '@/utils/services';
import { relativeTime } from '@/utils/utils';
import Image from 'next/image';

export default function PostCard({ post }: { post: Post }) {
  const [time] = useState<string>(relativeTime(post?.created_at || ''));
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserById(post.user_id);
      setUser(data);
    };
    getUser();
  }, [post.user_id]);

  return (
    <div key={post.id} className="border-b border-border p-4 my-2">
      <Image
        src={
          user?.profile_picture ||
          'https://npnifamrslmcrjtysuhs.supabase.co/storage/v1/object/sign/profile-pics/default/default_pp.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9maWxlLXBpY3MvZGVmYXVsdC9kZWZhdWx0X3BwLmpwZyIsImlhdCI6MTczNjg4MjE1OSwiZXhwIjozMTU1MzA1MzQ2MTU5fQ.XsqHIGH1gc1Ct2uakTKnnNg7W6HHgm4tu0AKRyu3zXw&t=2025-01-14T19%3A15%3A59.231Z'
        }
        alt="profile picture"
        width={32}
        height={32}
        className="rounded-full inline-flex border border-border"
      />
      <h2 className="inline-flex pl-2 font-black">{user?.username}</h2>
      <p className="text-xl pt-3 pb-2">{post.content}</p>
      <p className="text-xs text-primary">{time}</p>
    </div>
  );
}
