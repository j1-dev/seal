import { getPostsWithCounts } from '@/utils/services';
import { Post } from '@/utils/types';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import PostCard from '@/components/post';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    // const getPosts = async () => {
    //   const data = await getAllPosts();
    //   setPosts(data);
    //   setLoading(false);
    // };

    const getPosts = async () => {
      const data = await getPostsWithCounts();
      setPosts(data);
      setLoading(false);
      console.log(data);
    };

    getPosts();
    // Subscribe to new posts
    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('New post:', payload.new);
          setPosts((prevPosts) => [payload.new as Post, ...(prevPosts || [])]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Post deleted:', payload.old);
          setPosts((prevPosts) =>
            (prevPosts || []).filter((post) => post.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
      ) : (
        <div>
          {posts?.map((post: Post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      )}
    </div>
  );
}
