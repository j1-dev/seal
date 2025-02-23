import { Post, User } from '@/utils/types';
import React, { useState, useEffect } from 'react';
import {
  getUserById,
  deletePost,
  unlikePost,
  likePost,
  getLikeCount,
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
import { useUser } from '@/utils/context/auth';

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

export default function PostCard({ post }: { post: Post }) {
  const { user: currentUser } = useUser(); // Get logged-in user ID
  const [author, setAuthor] = useState<User | null>(null); // Post author's data
  const [liked, setLiked] = useState<boolean>(false); // Like status
  const [likeCount, setLikeCount] = useState<number>(0); // Like count
  const [time] = useState<string>(relativeTime(post?.created_at || '')); // Relative time display

  // Fetch the post author's data and like status
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      // Fetch author details
      const authorData = await getUserById(post.user_id);
      setAuthor(authorData);

      // Fetch like count
      const likeCount = await getLikeCount(post.id || '');
      setLikeCount(likeCount);

      // Check if current user has liked the post
      const likedPosts = getLikedPosts(currentUser.id);
      setLiked(likedPosts.includes(post.id));
    };

    fetchData();
  }, [post.id, post.user_id, currentUser]);

  // Handle like/unlike logic
  const handleLike = async () => {
    if (!post.id || !currentUser) return;

    if (liked) {
      const success = await unlikePost(post.id, currentUser.id);
      if (success) {
        updateLikedPosts(currentUser.id, post.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const success = await likePost(post.id, currentUser.id);
      if (success) {
        updateLikedPosts(currentUser.id, post.id, true);
        setLikeCount((prev) => prev + 1);
      }
    }

    setLiked(!liked); // Optimistically update like status
  };

  return (
    <div>
      <div key={post.id} className="border-b border-border p-4 my-2 relative">
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
              {currentUser?.id === post.user_id && (
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

        {/* Post content */}
        <Link
          href={`/p/${post?.id}`}
          passHref
          scroll={false}
          shallow={true}
          prefetch={true}>
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
        </Link>

        {/* Interaction buttons */}
        <div className="my-2 flex items-center justify-start pt-2 gap-4">
          {/* Comment count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FaRegComment className="cursor-pointer hover:text-primary" />
            <span>{post?.comment_count}</span>
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
    </div>
  );
}
