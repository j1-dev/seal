import {
  createClient,
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';
import { Database, Post, User, Comment, Like } from '@/utils/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// --- User Services ---
export const createUser = async (user: User) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const getUserStatsById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
        *,
        posts:posts(count), 
        friendships_sent:accepted_friendships!friendships_sender_id_fkey(count),
        friendships_received:accepted_friendships!friendships_receiver_id_fkey(count),
        likes:posts!inner(id, likes(count))
      `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  console.log(data);

  if (!data) {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        friendships_sent:accepted_friendships!friendships_sender_id_fkey(count),
        friendships_received:accepted_friendships!friendships_receiver_id_fkey(count)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('User not found');

    const { friendships_sent, friendships_received, ...user } = data;

    const friendCount =
      friendships_sent[0].count + friendships_received[0].count;

    return {
      user: user,
      postCount: 0,
      friendCount: friendCount || 0,
      likeCount: 0,
    };
  }

  const { posts, friendships_sent, friendships_received, likes, ...user } =
    data;
  const postCount = posts[0].count;
  const friendCount = friendships_sent[0].count + friendships_received[0].count;
  const likeCount: number = likes.reduce(
    (acc: number, post: { likes: { count: number }[] }) =>
      acc + post.likes[0].count,
    0
  );

  return {
    user: user,
    postCount: postCount || 0,
    friendCount: friendCount || 0,
    likeCount: likeCount || 0,
  };
};

export const updateUser = async (user: User | null) => {
  const { data, error } = await supabase
    .from('users')
    .update(user)
    .eq('id', user?.id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
};

export const uploadProfilePic = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `profile_pic.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Convert the image to a square by cropping the center
  const imageBitmap = await createImageBitmap(file);
  const size = Math.min(imageBitmap.width, imageBitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }
  ctx.drawImage(
    imageBitmap,
    (imageBitmap.width - size) / 2,
    (imageBitmap.height - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size
  );

  const squareBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type)
  );
  if (!squareBlob) {
    throw new Error('Failed to generate square image blob');
  }

  // Replace the original file with the cropped square version
  file = new File([squareBlob], fileName, { type: file.type });

  const { error: uploadError } = await supabase.storage
    .from('profile-pics')
    .update(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('profile-pics')
    .createSignedUrl(filePath, 60 * 60 * 24 * 1e6); // URL valid for 1e6 days

  if (signedUrlError) throw signedUrlError;

  const { data: userData, error: updateError } = await supabase
    .from('users')
    .update({ profile_picture: signedUrlData.signedUrl })
    .eq('id', userId)
    .select('*')
    .single();

  if (updateError) throw updateError;

  return userData;
};

// --- Post Services ---
export const createPost = async (post: Post) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getPostsWithCounts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      comments(count),
      likes(count)
    `
    )
    .order('created_at', { ascending: false }); // Order by latest posts

  if (error) {
    console.error('Error fetching posts with counts:', error);
    throw error;
  }

  return data.map((post) => ({
    ...post,
    comment_count: post.comments[0].count || 0,
    like_count: post.likes[0].count || 0,
  }));
};

export const getFeedPosts = async (userId: string) => {
  const friendsList = await getUserFriendships(userId);
  if (friendsList.length === 0) return [];
  friendsList.push(userId); // Include the user's own posts

  // Fetch posts from friends with embedded comment and like counts
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      comments(count),
      likes(count)
    `
    )
    .in('user_id', friendsList)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Extract the post IDs to check which ones the user has liked
  const postIds = (data as Post[]).map((post) => post.id);

  // Query likes for the current user on these posts
  const { data: likesData, error: likesError } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (likesError) throw likesError;

  const likedPostIds = new Set(likesData.map((like) => like.post_id));

  // Return posts with the extra field "liked_by_user"
  return data.map((post) => ({
    ...post,
    comment_count: post.comments?.[0]?.count || 0,
    like_count: post.likes?.[0]?.count || 0,
    liked_by_user: likedPostIds.has(post.id),
  }));
};

export const subscribeToFeedUpdates = async (
  userId: string,
  onUpdate: (update: {
    type: string;
    payload:
      | RealtimePostgresUpdatePayload<Post | Like>
      | RealtimePostgresInsertPayload<Post | Like>
      | RealtimePostgresDeletePayload<Post | Like>;
  }) => void
): Promise<() => void> => {
  const friendIds = await getUserFriendships(userId);
  if (friendIds.length === 0) {
    // No friends means no subscriptions needed.
    return () => {};
  }

  const postsChannel = supabase
    .channel('posts_subscription')
    .on<Post>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `user_id=in.(${friendIds.join(',')})`,
      },
      (payload) => {
        onUpdate({ type: 'POST_INSERT', payload: payload });
      }
    )
    .on<Post>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `user_id=in.(${friendIds.join(',')})`,
      },
      (payload) => {
        onUpdate({ type: 'POST_UPDATE', payload: payload });
      }
    )
    .on<Post>(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'posts',
        filter: `user_id=in.(${friendIds.join(',')})`,
      },
      (payload) => {
        onUpdate({ type: 'POST_DELETE', payload: payload });
      }
    );
  postsChannel.subscribe();

  const likesChannel = supabase
    .channel('likes_subscription')
    .on<Like>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'likes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate({ type: 'LIKE_INSERT', payload: payload });
      }
    )
    .on<Like>(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'likes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate({ type: 'LIKE_DELETE', payload: payload });
      }
    );
  likesChannel.subscribe();

  return () => {
    postsChannel.unsubscribe();
    likesChannel.unsubscribe();
  };
};

export const getPostById = async (id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      comments(count),
      likes(count)
    `
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
    ...data,
    comment_count: data.comments[0].count,
    like_count: data.likes[0].count,
  };
};

export const getPostsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*,comments(count),likes(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((post) => ({
    ...post,
    comment_count: post.comments[0].count,
    like_count: post.likes[0].count,
  }));
};

export const deletePost = async (id: string) => {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
};

export const getPostsLikedByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('post_id, posts(content, media, created_at)')
    .eq('user_id', userId);
  if (error) throw error;

  return data;
};

// --- Like Services ---
// export const createLike = async (
//   like: Like
// ) => {
//   const { data, error } = await supabase
//     .from('likes')
//     .insert(like)
//     .select('*')
//     .single();
//   if (error) throw error;
//   return data;
// };

// export const deleteLike = async (id: string) => {
//   const { error } = await supabase.from('reactions').delete().eq('id', id);
//   if (error) throw error;
// };

export const likePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const unlikePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

export const getLikeCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching like count:', error);
    return 0;
  }

  return count || 0;
};

export const isPostLikedByUser = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw error;

  return (count ?? 0) > 0;
};

// --- Comment Services ---
export const createComment = async (comment: Comment) => {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getComment = async (commentId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      replies: comments(count)
      `
    )
    .eq('id', commentId)
    .single();
  if (error) throw error;

  // Access count of replies for the comment
  const comment_count = data.replies?.[0]?.count ?? 0;

  return {
    ...data,
    comment_count,
  };
};

export const getCommentsByPostId = async (
  postId: string,
  commentId?: string
) => {
  // Adjusted query to join the count of likes and replies (child comments)
  let query = supabase
    .from('comments')
    .select(
      `
      *,
      likes:comment-likes(count),
      comments:comments(count)
    `
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (typeof commentId === 'undefined') {
    query = query.is('parent_comment_id', null);
  } else {
    query = query.eq('parent_comment_id', commentId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Map each comment to include like_count and comment_count based on the joined data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((comment: any) => ({
    ...comment,
    like_count: comment.likes?.[0]?.count ?? 0,
    comment_count: comment.comments?.[0]?.count ?? 0,
  }));
};

export const getCommentThread = async (
  parentCommentId: string,
  postId: string
) => {
  const comments = [];
  let commentId = parentCommentId;

  while (commentId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('id', commentId)
      .single();
    if (error) throw error;
    comments.push(data);
    commentId = data.parent_comment_id;
  }

  return comments.reverse();
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
};

export const getPostsCommentsCount = async (postId: string) => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }

  return count;
};

export const getCommentLikeCount = async (id: string) => {
  const { count, error } = await supabase
    .from('comment-likes')
    .select('*', { count: 'exact', head: true })
    .eq('comment_id', id);

  if (error) throw error;
  return count;
};

export const likeComment = async (commentId: string, userId: string) => {
  const { data, error } = await supabase
    .from('comment-likes')
    .insert({ comment_id: commentId, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const unlikeComment = async (commentId: string, userId: string) => {
  const { error } = await supabase
    .from('comment-likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

// --- Friendship Services ---
export const createFriendship = async (
  friendship: Omit<
    Database['public']['Tables']['Friendships']['Row'],
    'id' | 'created_at'
  >
) => {
  const { data, error } = await supabase
    .from('friendships')
    .insert(friendship)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateFriendshipStatus = async (
  sender_id: string,
  receiver_id: string,
  status: 'pending' | 'accepted'
) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('sender_id', sender_id)
    .eq('receiver_id', receiver_id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteFriendship = async (
  sender_id: string,
  receiver_id: string
) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('sender_id', sender_id)
    .eq('receiver_id', receiver_id);
  if (error) throw error;
};

export const friendshipExists = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
    .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`); // Check both ways

  if (error) throw error;
  return (count ?? 0) > 0;
};

export const getUserFriendships = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;

  return data.map((friendship) => {
    if (friendship.sender_id === userId) {
      return friendship.receiver_id;
    }
    return friendship.sender_id;
  });
};

// --- Message Services ---
export const sendMessage = async (
  message: Omit<
    Database['public']['Tables']['Messages']['Row'],
    'id' | 'created_at'
  >
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getMessagesBetweenUsers = async (
  userId1: string,
  userId2: string
) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
    .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// --- Notification Services ---
export const createNotification = async (
  notification: Omit<
    Database['public']['Tables']['Notifications']['Row'],
    'id' | 'created_at'
  >
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteNotification = async (id: string) => {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
};
