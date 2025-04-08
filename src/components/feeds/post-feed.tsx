import { useEffect, useState } from 'react';
import { getFeedPosts, subscribeToFeedUpdates } from '@/utils/services';
import { Post } from '@/utils/types';
import PostCard from '@/components/cards/post-card';
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
          // console.log(update.type);
          switch (update.type) {
            case 'POST_INSERT':
              setPosts((prev) => [update.payload.new as Post, ...prev]);
              break;
            case 'POST_DELETE':
              console.log('post deleted', update);
              setPosts((prev) =>
                prev.filter(
                  (post) => post.id !== (update.payload.old as Post).id
                )
              );
              break;
            default:
              console.log('type not allowed');
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
            <PostCard userId={user?.id ?? ''} post={post} key={post.id} />
          ))}
        </div>
      )}
    </div>
  );
}
