import { Post, User } from '@/utils/types';
import React, { useState, useEffect } from 'react';
import {
  getUserById,
  deletePost,
  unlikePost,
  likePost,
  getLikeCount,
} from '@/utils/services';
import { relativeTime } from '@/utils/utils';
import { HiDotsHorizontal } from 'react-icons/hi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import {
  FaRegComment,
  FaHeart,
  FaRegHeart,
  FaRegTrashCan,
} from 'react-icons/fa6';
import { LuShare } from 'react-icons/lu';
import { Dot } from 'lucide-react';
import Link from 'next/link';

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

export default function PostCard({ post }: { post: Post }) {
  const [time] = useState<string>(relativeTime(post?.created_at || ''));
  const [user, setUser] = useState<User | null>();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserById(post.user_id);
      setUser(data);
    };
    getUser();
    getLikeCount(post.id as string).then((count) => setLikeCount(count));
    setLiked(getLikedPosts().includes(post.id));
  }, [post.user_id, post.id]);

  const handleLike = async () => {
    if (!post.id || !user?.id) return;

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

  return (
    <div>
      <div key={post.id} className="border-b border-border p-4 my-2 relative">
        <div className="absolute right-5 top-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <HiDotsHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
              {user?.id === post.user_id && (
                <div onClick={() => post.id && deletePost(post.id)}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 cursor-pointer">
                    <FaRegTrashCan />
                    <span className="pt-1">Delete</span>
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link
          href={`/p/${post?.id}`}
          passHref
          scroll={false}
          shallow={true}
          prefetch={true}>
          <Image
            src={
              user?.profile_picture ||
              process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
            }
            alt="profile picture"
            width={32}
            height={32}
            className="rounded-full inline-flex border border-border"
          />
          <h2 className="inline-flex pl-2 font-black">{user?.username}</h2>
          <Dot className="inline-flex" />
          <p className="inline-flex text-xs">{time}</p>
          <p className="text-xl pt-3 pb-2">{post.content}</p>
          {post.media && (
            <Image
              src={post.media}
              alt="post image"
              width={500}
              height={500}
              className="rounded-lg"
            />
          )}
        </Link>

        <div className=" my-2 flex items-center justify-start pt-2 gap-4">
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
      </div>
    </div>
  );
}
