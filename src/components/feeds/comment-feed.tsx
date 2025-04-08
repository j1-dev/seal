/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import {
  getCommentsByPostId,
  subscribeToCommentUpdates,
} from '@/utils/services';
import { Comment } from '@/utils/types';
import CommentCard from '@/components/cards/comment-card';
import { createClient } from '@/utils/supabase/client';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUser } from '@/utils/context/auth';

export default function CommentFeed({
  postId,
  commentId,
  userId,
}: {
  postId: string;
  commentId?: string;
  userId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (!postId) return;
    console.log('Fetching comments for post:', postId);
    const loadComments = async () => {
      const data = await getCommentsByPostId(postId, commentId, userId);
      setComments(data);
      setLoading(false);

      unsubscribe = await subscribeToCommentUpdates(postId, (update) => {
        switch (update.type) {
          case 'COMMENT_INSERT':
            setComments((prev) => [update.payload.new as Comment, ...prev]);
            break;
          case 'COMMENT_DELETE':
            setComments((prev) =>
              prev.filter(
                (post) => post.id !== (update.payload.old as Comment).id
              )
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
  }, [postId, supabase]);

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
