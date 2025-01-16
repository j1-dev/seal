'use client';

import React, { useEffect, useState } from 'react';
import { Comment, User } from '@/utils/types';
import {
  deleteComment,
  getUserById,
  likeComment,
  unlikeComment,
} from '@/utils/services';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { HiDotsHorizontal } from 'react-icons/hi';
import Link from 'next/link';
import { Dot } from 'lucide-react';
import {
  FaRegComment,
  FaHeart,
  FaRegHeart,
  FaRegTrashCan,
} from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { relativeTime } from '@/utils/utils';

const getLikedComments = () =>
  JSON.parse(localStorage.getItem('likedPosts') || '[]');

const updateLikedComments = (postId: string, isLiked: boolean) => {
  const likedPosts = getLikedComments();
  if (isLiked) {
    localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, postId]));
  } else {
    localStorage.setItem(
      'likedPosts',
      JSON.stringify(likedPosts.filter((id: string) => id !== postId))
    );
  }
};

export default function CommentCard({ comment }: { comment: Comment }) {
  const [time] = useState<string>(relativeTime(comment?.created_at || ''));
  const [user, setUser] = useState<User | null>();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserById(comment.user_id);
      setUser(data);
    };
    getUser();
  }, [comment.user_id]);

  const handleLike = async () => {
    if (!comment.id || !user?.id) return;

    if (liked) {
      const success = await unlikeComment(comment.id, user.id);
      if (success) {
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        updateLikedComments(comment.id, false);
      }
    } else {
      const success = await likeComment(comment.id, user.id);
      if (success) {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        updateLikedComments(comment.id, true);
      }
    }
  };

  return (
    <div className="mx-4 my-2 relative">
      <div className="absolute right-5 top-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <HiDotsHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            {user?.id === comment.user_id && (
              <div onClick={() => comment.id && deleteComment(comment.id)}>
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
      <Link
        href={`/c/${comment.id}`}
        passHref
        scroll={false}
        shallow={true}
        prefetch={true}>
        <Image
          src={
            user?.profile_picture ||
            process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
          }
          alt="profile picture"
          width={32}
          height={32}
          className="rounded-full inline-flex border border-border"
        />
        <h2 className="inline-flex pl-2 font-black">{user?.username}</h2>
        <Dot className="inline-flex" />
        <p className="inline-flex text-xs">{time}</p>
        <p className="text-xl pt-3 pb-2">{comment.content}</p>
      </Link>

      <div className="my-2 flex items-center justify-start py-2 gap-4">
        {/* Like Icon and Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaRegComment className="cursor-pointer hover:text-primary" />
          <span>{comment?.comment_count}</span>
        </div>

        {/* Like Icon and Count */}
        <div
          onClick={handleLike}
          className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          {liked ? (
            <FaHeart className="text-red-500 hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="hover:text-primary hover:scale-110 transition-transform" />
          )}
          <span>{likeCount}</span>
        </div>

        {/* Share Icon */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <LuShare className="hover:text-primary hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}
