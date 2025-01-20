'use client';

import React, { useEffect, useState } from 'react';
import {
  getPostById,
  getCommentsByPostId,
  getUserById,
} from '@/utils/services';
import { Post, Comment, User } from '@/utils/types';
import { relativeTime } from '@/utils/utils';
import CommentCard from '@/components/comment-card'; // Reusable component to display a comment
import { Separator } from '@/components/ui/separator';

interface CommentThreadProps {
  postId: string;
  commentId: string;
}

export default function CommentThread({
  postId,
  commentId,
}: CommentThreadProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (!postId || !commentId) return;

    const fetchData = async () => {
      try {
        // Fetch post details
        const postData = await getPostById(postId);
        setPost(postData);

        // Fetch author details
        const authorData = await getUserById(postData.user_id);
        setAuthor(authorData);

        // Fetch comments thread (including the target comment and replies)
        const threadData = await getCommentsByPostId(postId, commentId);
        setComments(threadData);

        // Format post time
        setTime(relativeTime(postData.created_at));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [postId, commentId]);

  return (
    <div>
      {/* Original Post */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">{author?.username}</h2>
        <p className="text-sm text-muted-foreground">{time}</p>
        <p className="pt-2">{post?.content}</p>
      </div>
      <Separator />

      {/* Comments Thread */}
      <div>
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentCard comment={comment} />
            <Separator />
          </div>
        ))}
      </div>
    </div>
  );
}
