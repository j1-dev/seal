/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { getCommentsByPostId } from '@/utils/services';
import { Comment } from '@/utils/types';
import CommentCard from '@/components/comment-card';
import { createClient } from '@/utils/supabase/client';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CommendFeed({
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
  const supabase = createClient();

  useEffect(() => {
    if (!postId) return;
    console.log('Fetching comments for post:', postId);
    const getComments = async () => {
      const data = await getCommentsByPostId(postId, commentId, userId);
      setComments(data);
      setLoading(false);
    };
    getComments();

    const channel = supabase
      .channel(`comments-feed-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          // filter: `post_id=eq.${id}`,
        },
        (payload) => {
          console.log('Comment deleted:', payload.old);
          setComments((prevComments) =>
            (prevComments || []).filter(
              (comment) => comment.id !== payload.old.id
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log('New comment:', payload.new);
          setComments((prevComments) => [
            payload.new as Comment,
            ...(prevComments || []),
          ]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to comments updates: ', postId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
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
              <CommentCard comment={comment} />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
