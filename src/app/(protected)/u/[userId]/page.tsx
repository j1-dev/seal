'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaPaintBrush } from 'react-icons/fa';

import {
  getPostsByUserId,
  getUserStatsById,
  updateUser,
} from '@/utils/services';
import { Post, User } from '@/utils/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/tob-bar';
import PostCard from '@/components/post-card';
import { useUser } from '@/utils/context/auth';
import { FaCheck } from 'react-icons/fa6';
import { toast } from 'sonner';
import { uploadProfilePic } from '@/utils/services';

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

  const handleSave = () => {
    console.log(user);
    updateUser(user)
      .then(() => setEditMode(!editMode))
      .catch(() =>
        toast('A user with that name already exists, try another one!')
      );
  };

  const handleChangeProfilePic = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        try {
          const newProfilePicUrl = await uploadProfilePic(
            file,
            userId as string
          );
          setUser(
            user
              ? { ...user, profile_picture: newProfilePicUrl.profile_picture }
              : null
          );
          toast('Profile picture updated successfully!');
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          toast('Failed to upload profile picture. Please try again.');
        }
      }
    };
    input.click();
  };

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
              className={`rounded-3xl mt-4 transition-all ${
                editMode ? 'hover:opacity-80 cursor-pointer' : ''
              }`}
              onClick={() => {
                if (editMode) handleChangeProfilePic();
              }}
            />
            <span className="text-xl font-bold inline-flex items-center">
              {!editMode ? (
                user?.username
              ) : (
                <input
                  maxLength={15}
                  className="w-40"
                  value={user?.username}
                  onChange={(e) => {
                    setUser(
                      user ? { ...user, username: e.target.value } : null
                    );
                  }}
                />
              )}
              {showEditButton && (
                <div>
                  {!editMode ? (
                    <FaPaintBrush
                      className="ml-2 transition-colors hover:text-foreground/80 cursor-pointer"
                      onClick={() => setEditMode(!editMode)}
                    />
                  ) : (
                    <FaCheck
                      className="ml-2 transition-colors hover:text-foreground/80 cursor-pointer"
                      onClick={() => handleSave()}
                    />
                  )}
                </div>
              )}
            </span>
            <div>
              {!editMode ? (
                user?.bio
              ) : (
                <input
                  className="w-40"
                  value={user?.bio || ''}
                  onChange={(e) => {
                    setUser(user ? { ...user, bio: e.target.value } : null);
                  }}
                />
              )}
            </div>
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
