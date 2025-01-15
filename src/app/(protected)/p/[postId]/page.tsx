'use client';

import { getPostById, getUserById } from '@/utils/services';
import { Post, User } from '@/utils/types';
import { useParams } from 'next/navigation';
import { Dot } from 'lucide-react';
import { relativeTime } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { IoArrowBack } from 'react-icons/io5';

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>();
  const [user, setUser] = useState<User | null>();
  const [time, setTime] = useState<string>(
    relativeTime(post?.created_at || '')
  );

  useEffect(() => {
    const getPost = async () => {
      const data = await getPostById((postId as string) || '');
      setPost(data);
      setTime(relativeTime(data?.created_at || ''));
    };
    getPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      const getUser = async () => {
        const data = await getUserById(post.user_id);
        setUser(data);
      };
      getUser();
    }
  }, [post]);

  return (
    <div className="border-b border-border">
      <div className="relative h-12">
        <IoArrowBack
          onClick={() => history.back()}
          size={32}
          className="absolute left-4 top-0 cursor-pointer transition-colors hover:text-foreground/80"
        />
        <h1 className="text-2xl font-bold mx-4 mb-2 absolute left-1/2 -translate-x-full">
          Post
        </h1>
      </div>
      <Separator />
      <div className="mx-4 my-2">
        <Image
          src={
            user?.profile_picture ||
            'https://npnifamrslmcrjtysuhs.supabase.co/storage/v1/object/sign/profile-pics/default/default_pp.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9maWxlLXBpY3MvZGVmYXVsdC9kZWZhdWx0X3BwLmpwZyIsImlhdCI6MTczNjg4MjE1OSwiZXhwIjozMTU1MzA1MzQ2MTU5fQ.XsqHIGH1gc1Ct2uakTKnnNg7W6HHgm4tu0AKRyu3zXw&t=2025-01-14T19%3A15%3A59.231Z'
          }
          alt="profile picture"
          width={48}
          height={48}
          className="rounded-full inline-flex border border-border"
        />
        <p className="inline-flex pl-4">{user?.username}</p>
        <Dot className="inline-flex" />
        <p className="inline-flex text-xs">{time}</p>
      </div>
      <p className="text-xl pt-3 pb-2 mx-4 my-2">{post?.content}</p>
      {post?.media && (
        <Image
          src={post.media}
          alt="post image"
          width={500}
          height={500}
          className="rounded-lg"
        />
      )}
      <div className="mx-4 my-2 flex justify-between pt-1 w-1/5">
        <FaRegComment />0
        <FaRegHeart />0
        <LuShare />
      </div>
    </div>
  );
}
