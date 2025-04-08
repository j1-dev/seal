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

const getLikedComments = (userId: string) =>
  JSON.parse(localStorage.getItem(`likedComments_${userId}`) || '[]');

const updateLikedComments = (
  userId: string,
  commentId: string,
  isLiked: boolean
) => {
  const likedComments = getLikedComments(userId);
  if (isLiked) {
    localStorage.setItem(
      `likedComments_${userId}`,
      JSON.stringify([...likedComments, commentId])
    );
  } else {
    localStorage.setItem(
      `likedComments_${userId}`,
      JSON.stringify(likedComments.filter((id: string) => id !== commentId))
    );
  }
};

export default function CommentCard({ comment, userId }: { comment: Comment, userId: string }) {
  const [author, setAuthor] = useState<User | null>(null); // Comment author's data
  const [liked, setLiked] = useState<boolean>(false); // Like status
  const [likeCount, setLikeCount] = useState<number>(0); // Like count
  const [time] = useState<string>(relativeTime(comment?.created_at ?? '')); // Relative time display

  useEffect(() => {
    const fetchData = async () => {
      // Fetch author details
      const authorData = await getUserById(comment.user_id);
      setAuthor(authorData);
      setLikeCount(comment.like_count ?? 0);
      setLiked(comment.liked_by_user ?? false);
    };

    fetchData();
  }, [comment]);

  const handleLike = async () => {
    if (!comment.id) return;

    if (liked) {
      const success = await unlikeComment(comment.id, userId);
      if (success) {
        updateLikedComments(userId, comment.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const success = await likeComment(comment.id, userId);
      if (success) {
        updateLikedComments(userId, comment.id, true);
        setLikeCount((prev) => prev + 1);
      }
    }

    setLiked(!liked); // Optimistic update
  };

  return (
    <div className="p-3 my-1 relative">
      {/* Dropdown menu */}
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
            {userId === comment.user_id && (
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

      <div>
        {/* Author details */}
        <Link href={`/u/${author?.id}`}>
          <Image
            src={
              author?.profile_picture ||
              process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
            }
            alt="profile picture"
            width={32}
            height={32}
            className="rounded-full inline-flex border-b border-border"
          />
          <h2 className="inline-flex pl-2 font-black hover:underline">
            {author?.username}
          </h2>
          <Dot className="inline-flex" />
          <p className="inline-flex text-xs">{time}</p>
        </Link>
        <Link
          href={`/c/${comment.id}`}
          passHref
          scroll={false}
          shallow={true}
          prefetch={true}>
          {/* Comment text */}
          <p className="text-xl pt-3 pb-2">{comment.content}</p>
        </Link>
      </div>

      {/* Interaction buttons */}
      <div className="my-2 flex items-center justify-start pt-2 gap-4">
        {/* Reply count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaRegComment className="cursor-pointer hover:text-primary" />
          <span>{comment?.comment_count ?? 0}</span>
        </div>

        {/* Like button */}
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

        {/* Share button */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <LuShare className="hover:text-primary hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}
