'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Dot } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CommentFeed from '@/components/comment-feed';
import TopBar from '@/components/tob-bar';
import { useUser } from '@/utils/context/auth';
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

export default function PostPage() {
  const { postId } = useParams();
  const { user: currentUser } = useUser(); // Get the current logged-in user's ID
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null); // Author information
  const [time, setTime] = useState<string>('');
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);

  // Fetch post data and set initial state
  useEffect(() => {
    if (!postId || !currentUser) return;

    const fetchData = async () => {
      const postData = await getPost(
        (postId as string) ?? '',
        currentUser?.id ?? ''
      );
      setPost(postData);
      setTime(relativeTime(postData?.created_at || ''));
      setLikeCount(postData.like_count);
      setLiked(postData.liked_by_user);
      console.log(postData);
      // Fetch author details
      const authorData = await getUserById(postData.user_id);
      setAuthor(authorData);
    };

    fetchData();
  }, [postId, currentUser]);

  // Handle like/unlike functionality
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

  // Construct and send a comment
  const handleSendComment = async () => {
    setDisabled(true);
    if (!content.trim() || !currentUser || !post?.id) return;

    try {
      const comment: Comment = {
        content,
        user_id: currentUser.id,
        post_id: post.id,
      };
      await createComment(comment);
      setContent(''); // Clear comment input
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
        <Link href={`/u/${author?.id}`}>
          <Image
            src={
              author?.profile_picture ||
              process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
            }
            alt="profile picture"
            width={48}
            height={48}
            className="rounded-full inline-flex border border-border"
          />
          <p className="inline-flex pl-4 font-semibold hover:underline">
            {author?.username}
          </p>
          <Dot className="inline-flex" />
          <p className="inline-flex text-xs">{time}</p>
        </Link>
      </div>

      {/* Post content */}
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
      <div className="grid w-full gap-4 px-4 border-b border-border pb-4">
        <Textarea
          className="border-none shadow-none resize-none outline-none focus:outline-none focus:border-none"
          placeholder="Comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button disabled={disabled} onClick={handleSendComment}>
          {!disabled ? 'Send Comment' : 'Sending...'}
        </Button>
      </div>
      <Separator />

      {/* Comment feed */}
      <CommentFeed postId={post?.id ?? ''} userId={currentUser?.id ?? ''} />
    </div>
  );
}
