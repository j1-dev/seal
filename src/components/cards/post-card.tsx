import { Post, User } from '@/utils/types';
import React, { useState, useEffect } from 'react';
import {
  getUserById,
  deletePost,
  unlikePost,
  likePost,
} from '@/utils/services';
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
  FaHeart,
  FaRegHeart,
  FaRegTrashCan,
} from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Dot } from 'lucide-react';
import Link from 'next/link';

const getLikedPosts = (userId: string) =>
  JSON.parse(localStorage.getItem(`likedPosts_${userId}`) || '[]');

const updateLikedPosts = (userId: string, postId: string, isLiked: boolean) => {
  const likedPosts = getLikedPosts(userId);
  if (isLiked) {
    localStorage.setItem(
      `likedPosts_${userId}`,
      JSON.stringify([...likedPosts, postId])
    );
  } else {
    localStorage.setItem(
      `likedPosts_${userId}`,
      JSON.stringify(likedPosts.filter((id: string) => id !== postId))
    );
  }
};

export default function PostCard({ post, userId }: { post: Post, userId: string }) {
  const [author, setAuthor] = useState<User | null>(null); // Post author's data
  const [liked, setLiked] = useState<boolean>(false); // Like status
  const [likeCount, setLikeCount] = useState<number>(0); // Like count
  const [time] = useState<string>(relativeTime(post?.created_at ?? '')); // Relative time display

  useEffect(() => {
    const fetchData = async () => {
      // Fetch author details
      const authorData = await getUserById(post.user_id);
      setAuthor(authorData);
      setLikeCount(post.like_count ?? 0);
      setLiked(post.liked_by_user ?? false);
    };

    fetchData();
  }, [post.id, post.user_id, post]);

  const handleLike = async () => {
    if (!post.id ) return;

    if (liked) {
      const success = await unlikePost(post.id, userId);
      if (success) {
        updateLikedPosts(userId, post.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const success = await likePost(post.id, userId);
      if (success) {
        updateLikedPosts(userId, post.id, true);
        setLikeCount((prev) => prev + 1);
      }
    }

    setLiked(!liked); // Optimistic update
  };

  const handleDelete = async () => {
    if (!post.id) return;
    console.log('deleting', post.id);
    deletePost(post.id);
  };

  return (
    <div key={post.id} className="border-b border-border p-3 my-2 relative">
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
            {userId === post.user_id && (
              <div onClick={handleDelete}>
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
            className="rounded-full inline-flex border border-border"
          />
          <h2 className="inline-flex pl-2 font-black hover:underline">
            {author?.username}
          </h2>
          <Dot className="inline-flex" />
          <p className="inline-flex text-xs">{time}</p>
        </Link>
        {/* Post content */}
        <Link href={`/p/${post?.id}`} passHref shallow={true} prefetch={true}>
          {/* Post content */}
          <p className="text-xl pt-3 pb-2">{post.content}</p>
          {post.media && (
            <Image
              src={post.media}
              alt="post image"
              width={300}
              height={300}
              className="rounded-lg"
            />
          )}
        </Link>
      </div>

      {/* Interaction buttons */}
      <div className="my-2 flex items-center justify-start gap-4">
        {/* Comment count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaRegComment className="cursor-pointer hover:text-primary" />
          <span>{post?.comment_count ?? 0}</span>
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
