'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaPaintBrush } from 'react-icons/fa';

import { getPostsByUserId, getUserStatsById } from '@/utils/services';
import { Post, User } from '@/utils/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/tob-bar';
import PostCard from '@/components/post-card';
import { useUser } from '@/utils/context/auth';

export default function UserPage() {
  const { userId } = useParams();
  const { user: currentUser } = useUser(); // Get the current logged-in user's ID
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [postCount, setPostCount] = useState<number>(0);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) return;

      try {
        const data = await getUserStatsById(userId as string);
        setUser(data.user);
        setPostCount(data.postCount);
        setFriendCount(data.friendCount);
        setLikeCount(data.likeCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;

      try {
        const data = await getPostsByUserId(userId as string);
        setPosts(data);
        setLoadingPosts(false);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  // Check if the edit button should be shown
  useEffect(() => {
    if (!currentUser || !userId) return;

    setShowEditButton(currentUser.id === userId);
  }, [currentUser, userId]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
      ) : (
        <div>
          {/* Top bar */}
          <TopBar title={user?.username || 'User'} />
          <Separator />

          {/* User profile */}
          <div className="flex flex-col items-center gap-4">
            <Image
              src={
                user?.profile_picture ||
                process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
              }
              alt="Profile Picture"
              height={128}
              width={128}
              className="rounded-3xl mt-4"
            />
            <span className="text-xl font-bold inline-flex items-center">
              {user?.username}
              {showEditButton && (
                <FaPaintBrush
                  className="ml-2 transition-colors hover:text-foreground/80 cursor-pointer"
                  onClick={() => setEditMode(!editMode)}
                />
              )}
            </span>
            <div className="grid grid-cols-3 grid-rows-2 items-center gap-2 text-center mb-4">
              <span className="text-lg font-bold">Posts</span>
              <span className="text-lg font-bold">Friends</span>
              <span className="text-lg font-bold">Likes</span>
              <span className="text-lg">{postCount}</span>
              <span className="text-lg">{friendCount}</span>
              <span className="text-lg">{likeCount}</span>
            </div>
          </div>
          <Separator />

          {/* User posts */}
          {loadingPosts ? (
            <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
          ) : (
            <div>
              {posts.length === 0 ? (
                <div className="text-center my-10 text-muted-foreground">
                  No posts yet
                </div>
              ) : (
                <div>
                  {posts.map((post: Post) => (
                    <PostCard post={post} key={post.id} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
