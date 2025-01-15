/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { getCommentsByPostId } from '@/utils/services';
import { Comment } from '@/utils/types';
import CommentCard from '@/components/comment-card';
import { createClient } from '@/utils/supabase/client';
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

export default function CommendFeed({
  id,
}: // isPost,
{
  id: string;
  // isPost: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    console.log('Fetching comments for post:', id);
    const getComments = async () => {
      const data = await getCommentsByPostId(id);
      setComments(data);
    };
    getComments();

    const channel = supabase
      .channel(`comments-feed-${id}`)
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
          filter: `post_id=eq.${id}`,
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
          console.log('Successfully subscribed to comments updates: ', id);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  return (
    <div>
      {comments?.map((comment) => (
        <div key={comment.id}>
          <CommentCard comment={comment} />
          <Separator />
        </div>
      ))}
    </div>
  );
}
