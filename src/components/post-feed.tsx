import { useEffect, useState } from 'react';
import { getFeedPosts, subscribeToFeedUpdates } from '@/utils/services';
import { Post } from '@/utils/types';
import PostCard from '@/components/post-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUser } from '@/utils/context/auth';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadFeed = async () => {
      // 1. Load initial feed posts
      const data = await getFeedPosts(user?.id as string);
      setPosts(data);
      setLoading(false);

      // 2. Subscribe to realtime updates and store the unsubscribe callback
      unsubscribe = await subscribeToFeedUpdates(
        user?.id as string,
        (update) => {
          // The realtime payload contains .new (for INSERT/UPDATE) and .old (for DELETE)
          switch (update.type) {
            case 'POST_INSERT':
              // Insert new post from payload.new
              setPosts((prev) => [update.payload.new as Post, ...prev]);
              break;
            case 'POST_UPDATE':
              // Replace the updated post using payload.new
              setPosts((prev) =>
                prev.map((post) => {
                  const newPost = update.payload.new as Post;
                  return post.id === newPost.id ? newPost : post;
                })
              );
              break;
            case 'POST_DELETE':
              // Remove the deleted post using payload.old
              setPosts((prev) =>
                prev.filter(
                  (post) => post.id !== (update.payload.old as Post).id
                )
              );
              break;
            case 'LIKE_INSERT':
              // Update post when the current user likes it (payload.new contains like info)
              setPosts((prev) =>
                prev.map((post) =>
                  post.id ===
                  (update.payload.new as { post_id: string }).post_id
                    ? {
                        ...post,
                        liked_by_user: true,
                        like_count: (post.like_count ?? 0) + 1,
                      }
                    : post
                )
              );
              break;
            case 'LIKE_DELETE':
              // Update post when the current user unlikes it (payload.old contains like info)
              setPosts((prev) =>
                prev.map((post) =>
                  post.id ===
                  (update.payload.old as { post_id: string }).post_id
                    ? {
                        ...post,
                        liked_by_user: false,
                        like_count: (post.like_count ?? 0) - 1,
                      }
                    : post
                )
              );
              break;
            default:
              break;
          }
        }
      );
    };

    if (user?.id) {
      loadFeed();
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner className="mx-auto mt-10 w-20 h-20" />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      )}
    </div>
  );
}
