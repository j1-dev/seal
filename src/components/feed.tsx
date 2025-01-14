import { getAllPosts } from '@/utils/services';
import { Post } from '@/utils/types';
import { useEffect, useState } from 'react';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>();

  useEffect(() => {
    const getPosts = async () => {
      const data = await getAllPosts();
      console.log(data);
      setPosts(data);
    };
    getPosts();
  }, []);

  return (
    <div>
      {posts?.map((post: Post) => (
        <div key={post.id} className="border-border p-4 my-2">
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
