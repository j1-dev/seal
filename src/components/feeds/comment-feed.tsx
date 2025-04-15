/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import {
  getCommentsByPostId,
  subscribeToCommentUpdates,
} from '@/utils/services';
import { Comment } from '@/utils/types';
import CommentCard from '@/components/cards/comment-card';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUser } from '@/utils/context/auth';

export default function CommentFeed({
  postId,
  commentId = undefined,
  userId,
}: {
  postId: string;
  commentId?: string;
  userId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (!postId) return;
    console.log('Fetching comments for post:', postId);
    const loadComments = async () => {
      const data = await getCommentsByPostId(postId, commentId, userId);
      setComments(data);
      setLoading(false);

      unsubscribe = await subscribeToCommentUpdates(postId, (update) => {
        const comment_new: Comment = update.payload.new as Comment;
        const comment_old: Comment = update.payload.old as Comment;
        switch (update.type) {
          case 'COMMENT_INSERT':
            if (commentId) {
              if (
                comment_new.parent_comment_id === commentId &&
                comment_new.post_id === postId
              ) {
                setComments((prev) => [comment_new, ...prev]);
              }
            } else {
              if (
                comment_new.post_id === postId &&
                !comment_new.parent_comment_id
              ) {
                setComments((prev) => [comment_new, ...prev]);
              }
            }
            break;
          case 'COMMENT_DELETE':
            setComments((prev) =>
              prev.filter((post) => post.id !== comment_old.id)
            );
        }
      });
    };

    if (user?.id) {
      loadComments();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [postId]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
      ) : (
        <div>
          {comments?.map((comment) => (
            <div key={comment.id}>
              <CommentCard userId={user?.id ?? ''} comment={comment} />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
