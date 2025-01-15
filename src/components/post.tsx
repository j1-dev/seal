import { Post, User } from '@/utils/types';
import React, { useState, useEffect } from 'react';
import { getUserById, deletePost } from '@/utils/services';
import { relativeTime } from '@/utils/utils';
import { HiDotsHorizontal } from 'react-icons/hi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import {
  FaRegComment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaHeart,
  FaRegHeart,
  FaRegTrashCan,
} from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Dot } from 'lucide-react';
import Link from 'next/link';

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
    <Link
      href={`p/${post?.id}`}
      passHref
      scroll={false}
      shallow={true}
      prefetch={true}>
      <div key={post.id} className="border-b border-border p-4 my-2 relative">
        <div className="absolute right-5 top-6">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <HiDotsHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
              {user?.id === post.user_id && (
                <div onClick={() => post.id && deletePost(post.id)}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 cursor-pointer">
                    <FaRegTrashCan />
                    <span className="pt-1">Delete</span>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <Dot className="inline-flex" />
        <p className="inline-flex text-xs">{time}</p>
        <p className="text-xl pt-3 pb-2">{post.content}</p>
        {post.media && (
          <Image
            src={post.media}
            alt="post image"
            width={500}
            height={500}
            className="rounded-lg"
          />
        )}
        <div className="flex justify-between pt-1 w-1/5">
          <FaRegComment />0
          <FaRegHeart />0
          <LuShare />
        </div>
      </div>
    </Link>
  );
}
