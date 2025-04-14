'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import {
  createComment,
  getComment,
  getCommentThread,
  getPost,
  getUserById,
  likeComment,
  unlikeComment,
} from '@/utils/services';
import { Comment, Post, User } from '@/utils/types';
import { relativeTime } from '@/utils/utils';
import { Separator } from '@/components/ui/separator';
import CommentFeed from '@/components/feeds/comment-feed';
import TopBar from '@/components/tob-bar';
import { useUser } from '@/utils/context/auth';
import CommentCard from '@/components/cards/comment-card';
import PostCard from '@/components/cards/post-card';
import Link from 'next/link';
import SendBox from '@/components/send-box';

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

export default function CommentPage() {
  const { commentId } = useParams();
  const { user: currentUser } = useUser(); // Current user
  const [post, setPost] = useState<Post | null>(null); // Parent post
  const [thread, setThread] = useState<Comment[]>([]); // Comment thread
  const [comment, setComment] = useState<Comment | null>(null); // Main comment
  const [author, setAuthor] = useState<User | null>(null); // Author of main comment
  const [time, setTime] = useState<string>('');
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  // Fetch comment data and set initial state
  useEffect(() => {
    if (!commentId || !currentUser) return;

    const fetchComment = async () => {
      const mainComment = await getComment(
        commentId as string,
        currentUser?.id
      );
      setComment(mainComment);
      setTime(relativeTime(mainComment?.created_at ?? ''));
      setLikeCount(mainComment.like_count);
      setLiked(mainComment.liked_by_user);

      const authorData = await getUserById(mainComment.user_id);
      setAuthor(authorData);
    };

    fetchComment();
  }, [currentUser, commentId]);

  // Fetch the parent post and the thread of comments in between
  useEffect(() => {
    if (!comment) return;
    const getCommentDependentData = async () => {
      if (comment?.parent_comment_id !== '') {
        const thread = await getCommentThread(
          comment?.parent_comment_id as string,
          comment?.post_id as string,
          currentUser?.id as string
        );
        setThread(thread);
      }
      const post = await getPost(comment?.post_id ?? '', currentUser?.id ?? '');
      setPost(post);
    };
    getCommentDependentData();
  }, [currentUser, comment]);

  const handleLike = async () => {
    if (!comment?.id || !currentUser) return;

    if (liked) {
      const success = await unlikeComment(comment.id, currentUser.id);
      if (success) {
        updateLikedComments(currentUser?.id || '', comment.id, false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        setLiked(false);
      }
    } else {
      const success = await likeComment(comment.id, currentUser.id);
      if (success) {
        updateLikedComments(currentUser?.id || '', comment.id, true);
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      }
    }
  };

  const handleSendReply = async (content: string) => {
    if (!content.trim() || !currentUser || !comment?.id) {
      return;
    }

    try {
      const reply: Comment = {
        content,
        user_id: currentUser.id,
        parent_comment_id: comment.id,
        post_id: comment.post_id,
      };
      await createComment(reply);
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  return (
    <div>
      <TopBar title="Comment" />
      <Separator />
      {post && <PostCard userId={currentUser?.id ?? ''} post={post} />}
      {thread && (
        <div>
          {thread.map((comment) => (
            <div key={comment.id}>
              <CommentCard userId={currentUser?.id ?? ''} comment={comment} />
              <Separator />
            </div>
          ))}
        </div>
      )}
      {comment && (
        <>
          {/* Main comment */}
          <div className="mx-4 my-2">
            <Link
              href={`/u/${author?.id}`}
              className="grid grid-rows-2 grid-cols-7">
              <Image
                src={
                  author?.profile_picture ??
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
          <p className="text-xl pt-3 pb-2 mx-4 my-2">{comment?.content}</p>

          {/* Interaction buttons */}
          <div className="mx-4 my-2 flex items-center justify-between pt-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FaRegComment className="cursor-pointer hover:text-primary" />
              <span>{comment?.comment_count}</span>
            </div>

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
          <SendBox onSend={handleSendReply} />
          <Separator />

          {/* Replies */}
          <CommentFeed
            postId={comment.post_id}
            commentId={comment.id ?? ''}
            userId={currentUser?.id ?? ''}
          />
        </>
      )}
    </div>
  );
}
