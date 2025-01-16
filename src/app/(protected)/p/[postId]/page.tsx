'use client';

import {
  createComment,
  getLikeCount,
  getPostById,
  getUserById,
  likePost,
  unlikePost,
} from '@/utils/services';
import { Comment, Post, User } from '@/utils/types';
import { useParams } from 'next/navigation';
import { Dot } from 'lucide-react';
import { relativeTime } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { FaHeart, FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import CommentFeed from '@/components/comment-feed';
import TopBar from '@/components/tob-bar';

const getLikedPosts = () =>
  JSON.parse(localStorage.getItem('likedPosts') || '[]');

const updateLikedPosts = (postId: string, isLiked: boolean) => {
  const likedPosts = getLikedPosts();
  if (isLiked) {
    localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, postId]));
  } else {
    localStorage.setItem(
      'likedPosts',
      JSON.stringify(likedPosts.filter((id: string) => id !== postId))
    );
  }
};

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>();
  const [user, setUser] = useState<User | null>();
  const [time, setTime] = useState<string>(
    relativeTime(post?.created_at || '')
  );
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);

  const supabase = createClient();
  const currentUser = supabase.auth.getUser();

  useEffect(() => {
    const getPost = async () => {
      const data = await getPostById((postId as string) || '');
      setPost(data);
      setTime(relativeTime(data?.created_at || ''));
    };
    getPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      const getUser = async () => {
        const data = await getUserById(post.user_id);
        setUser(data);
      };
      getUser();
      getLikeCount(post.id as string).then((count) => setLikeCount(count));
      setLiked(getLikedPosts().includes(post.id));
    }
  }, [post]);

  const constructComment = async (content: string): Promise<Comment> => {
    const user_id = (await currentUser).data.user?.id || '';
    const comment: Comment = {
      content,
      user_id,
      post_id: post?.id || '',
      // created_at: new Date().toISOString(),
    };
    return comment;
  };

  const handleLike = async () => {
    if (!post?.id || !user?.id) return;

    if (liked) {
      const success = await unlikePost(post.id, user.id);
      if (success) {
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        updateLikedPosts(post.id, false);
      }
    } else {
      const success = await likePost(post.id, user.id);
      if (success) {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        updateLikedPosts(post.id, true);
      }
    }
  };

  const handleSendComment = async () => {
    setDisabled(true);
    if (!content.trim()) return; // Prevent sending empty comments

    try {
      const comment = await constructComment(content);
      await createComment(comment);
      setContent(''); // Clear the content after the comment is successfully created
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
        <Image
          src={
            user?.profile_picture ||
            process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
          }
          alt="profile picture"
          width={48}
          height={48}
          className="rounded-full inline-flex border border-border"
        />
        <p className="inline-flex pl-4 font-semibold">{user?.username}</p>
        <Dot className="inline-flex" />
        <p className="inline-flex text-xs">{time}</p>
      </div>
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
      <div className="mx-4 my-2 flex items-center justify-between pt-2 gap-4">
        {/* Comment Icon and Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaRegComment className="cursor-pointer hover:text-primary" />
          <span>{post?.comment_count}</span>
        </div>

        {/* Like Icon and Count */}
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

        {/* Share Icon */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <LuShare className="hover:text-primary hover:scale-110 transition-transform" />
        </div>
      </div>
      <Separator />
      <div className="grid w-full gap-4 px-4 border-b border-border pb-4">
        <Textarea
          className="border-none shadow-none resize-none outline-none focus:outline-none focus:border-none"
          placeholder="Comment"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
        <Button disabled={disabled} onClick={handleSendComment}>
          {!disabled ? 'Send Comment' : 'Sending...'}
        </Button>
      </div>
      <Separator />
      <CommentFeed id={post?.id || ''} />
    </div>
  );
}
