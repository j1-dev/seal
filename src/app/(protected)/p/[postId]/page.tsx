'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import {
  createComment,
  getPost,
  getUserById,
  likePost,
  unlikePost,
} from '@/utils/services';
import { Comment, Post, User } from '@/utils/types';
import { relativeTime } from '@/utils/utils';
import { Separator } from '@/components/ui/separator';
import CommentFeed from '@/components/feeds/comment-feed';
import TopBar from '@/components/tob-bar';
import { useUser } from '@/utils/context/auth';
import Link from 'next/link';
import CommentBox from '@/components/comment-box';

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

export default function PostPage() {
  const { postId } = useParams();
  const { user: currentUser } = useUser(); // Get the current logged-in user's ID
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null); // Author information
  const [time, setTime] = useState<string>('');
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  // Fetch post data and set initial state
  useEffect(() => {
    if (!postId || !currentUser) return;

    const fetchPost = async () => {
      const postData = await getPost(postId as string, currentUser?.id);
      setPost(postData);
      setTime(relativeTime(postData?.created_at ?? ''));
      setLikeCount(postData.like_count);
      setLiked(postData.liked_by_user);

      const authorData = await getUserById(postData.user_id);
      setAuthor(authorData);
    };

    fetchPost();
  }, [postId, currentUser]);

  const handleLike = async () => {
    if (!post?.id || !currentUser) return;

    if (liked) {
      const success = await unlikePost(post.id, currentUser.id);
      if (success) {
        updateLikedPosts(currentUser.id, post.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        setLiked(false);
      }
    } else {
      const success = await likePost(post.id, currentUser.id);
      if (success) {
        updateLikedPosts(currentUser.id, post.id, true);
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      }
    }
  };

  const handleSendComment = async (
    content: string,
    setDisabled: (boolean: boolean) => void
  ) => {
    setDisabled(true);
    if (!content.trim() || !currentUser || !post?.id) {
      setDisabled(false);
      return;
    }

    try {
      const comment: Comment = {
        content,
        user_id: currentUser.id,
        post_id: post.id,
      };
      await createComment(comment);
    } catch (error) {
      console.error('Failed to send comment:', error);
    }
    setDisabled(false);
  };

  return (
    <div>
      <TopBar title="Post" />
      <Separator />
      <div className="mx-4 my-2">
        {/* Author information */}
        <Link
          href={`/u/${author?.id}`}
          className="grid grid-rows-2 grid-cols-7">
          <Image
            src={
              author?.profile_picture ||
              process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
            }
            alt="profile picture"
            width={64}
            height={64}
            className="rounded-full inline-flex border border-border row-span-2 col-span-1"
          />
          <span className="inline-block text-xl  font-semibold hover:underline col-span-6 pt-[10px] pl-2">
            {author?.username}
          </span>
          <span className="text-xs col-span-6 pl-2">{time}</span>
        </Link>
      </div>

      {/* Post content */}
      <p className="text-xl mx-4 my-2">{post?.content}</p>
      {post?.media && (
        <Image
          src={post.media}
          alt="post image"
          width={500}
          height={500}
          className="rounded-lg"
        />
      )}

      {/* Interaction buttons */}
      <div className="mx-4 my-2 flex items-center justify-between pt-2 gap-4">
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
      <Separator />

      {/* Comment input */}
      <CommentBox onSend={handleSendComment} />
      <Separator />

      {/* Comment feed */}
      <CommentFeed postId={post?.id ?? ''} userId={currentUser?.id ?? ''} />
    </div>
  );
}
