'use client';

import { getPostsByUserId, getUserStatsById } from '@/utils/services';
import { Post, User } from '@/utils/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/tob-bar';
import Image from 'next/image';
import PostCard from '@/components/post-card';

export default function UserPage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>();
  const [postCount, setPostCount] = useState<number>();
  const [friendCount, setFriendCount] = useState<number>();
  const [likeCount, setLikeCount] = useState<number>();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserStatsById(userId as string);
      setUser(data.user);
      setPostCount(data.postCount);
      setFriendCount(data.friendCount);
      setLikeCount(data.likeCount);
      setLoading(false);
    };
    getUser();
  }, [userId]);

  useEffect(() => {
    const getPostsByUser = async () => {
      const data = await getPostsByUserId(userId as string);
      setPosts(data);
      setLoadingPosts(false);
    };
    getPostsByUser();
  }, [userId]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
      ) : (
        <div>
          <TopBar title={user?.username || ''} />
          <Separator />
          <div className="flex flex-col items-center gap-4">
            <Image
              src={(user?.profile_picture as string) || ''}
              alt="profile picture"
              height={128}
              width={128}
              className="rounded-3xl mt-4"
            />
            <span className="text-xl font-bold">{user?.username}</span>
            <div className="grid grid-cols-3 grid-rows-2 items-center gap-2 text-center mb-4">
              <span className="text-lg">Posts</span>
              <span className="text-lg">Friends</span>
              <span className="text-lg">Likes</span>
              <span className="text-lg">{postCount}</span>
              <span className="text-lg">{friendCount}</span>
              <span className="text-lg">{likeCount}</span>
            </div>
          </div>
          <Separator />
          {loadingPosts ? (
            <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
          ) : (
            <div>
              {posts?.map((post: Post) => (
                <PostCard post={post} key={post.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
