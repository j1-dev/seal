'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Dot } from 'lucide-react';

import {
  createComment,
  getComment,
  getCommentLikeCount,
  getUserById,
  likeComment,
  unlikeComment,
} from '@/utils/services';
import { Comment, Post, User } from '@/utils/types';
import { relativeTime } from '@/utils/utils';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CommentFeed from '@/components/comment-feed';
import TopBar from '@/components/tob-bar';
import { useUser } from '@/utils/context/auth';

const getLikedComments = () =>
  JSON.parse(localStorage.getItem('likedComments') || '[]');

const updateLikedComments = (commentId: string, isLiked: boolean) => {
  const likedComments = getLikedComments();
  if (isLiked) {
    localStorage.setItem(
      'likedComments',
      JSON.stringify([...likedComments, commentId])
    );
  } else {
    localStorage.setItem(
      'likedComments',
      JSON.stringify(likedComments.filter((id: string) => id !== commentId))
    );
  }
};

export default function CommentPage() {
  const { commentId } = useParams();
  const { user: currentUser } = useUser(); // Current user
  const [post, setPost] = useState<Post | null>(null); // Parent post;
  const [comment, setComment] = useState<Comment | null>(null); // Main comment
  const [author, setAuthor] = useState<User | null>(null); // Author of main comment
  const [time, setTime] = useState<string>('');
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [content, setContent] = useState<string>(''); // Reply content
  const [disabled, setDisabled] = useState<boolean>(false); // Button state

  useEffect(() => {
    if (!commentId) return;

    const fetchData = async () => {
      // Fetch the main comment
      const mainComment = await getComment(commentId as string);
      setComment(mainComment);
      setTime(relativeTime(mainComment?.created_at || ''));

      // Fetch author details
      const authorData = await getUserById(mainComment.user_id);
      setAuthor(authorData);

      // Fetch like count and liked status
      const count = await getCommentLikeCount(mainComment.id);
      setLikeCount(count || 0);

      const likedComments = getLikedComments();
      setLiked(likedComments.includes(mainComment.id));
    };

    fetchData();
  }, [commentId]);

  // Handle like/unlike functionality
  const handleLike = async () => {
    if (!comment?.id || !currentUser) return;

    if (liked) {
      const success = await unlikeComment(comment.id, currentUser.id);
      if (success) {
        updateLikedComments(comment.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        setLiked(false);
      }
    } else {
      const success = await likeComment(comment.id, currentUser.id);
      if (success) {
        updateLikedComments(comment.id, true);
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      }
    }
  };

  // Handle adding a reply
  const handleSendReply = async () => {
    setDisabled(true);
    if (!content.trim() || !currentUser || !comment?.id) return;

    try {
      const reply: Comment = {
        content,
        user_id: currentUser.id,
        parent_comment_id: comment.id,
        post_id: comment.post_id,
      };
      await createComment(reply);
      setContent(''); // Clear textarea
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
    setDisabled(false);
  };

  return (
    <div>
      <TopBar title="Comment" />
      <Separator />
      {comment && (
        <>
          {/* Main comment */}
          <div className="mx-4 my-2">
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
            <p className="inline-flex pl-4 font-semibold">{author?.username}</p>
            <Dot className="inline-flex" />
            <p className="inline-flex text-xs">{time}</p>
          </div>
          <p className="text-xl pt-3 pb-2 mx-4 my-2">{comment?.content}</p>

          {/* Interaction buttons */}
          <div className="mx-4 my-2 flex items-center justify-between pt-2 gap-4">
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <LuShare className="hover:text-primary hover:scale-110 transition-transform" />
            </div>
          </div>
          <Separator />

          {/* Reply input */}
          <div className="grid w-full gap-4 px-4 border-b border-border pb-4">
            <Textarea
              className="border-none shadow-none resize-none outline-none focus:outline-none focus:border-none"
              placeholder="Write a reply..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button disabled={disabled} onClick={handleSendReply}>
              {!disabled ? 'Reply' : 'Sending...'}
            </Button>
          </div>
          <Separator />

          {/* Replies */}
          <CommentFeed postId={comment.post_id} commentId={comment.id || ''} />
        </>
      )}
    </div>
  );
}
