import { createClient } from '@supabase/supabase-js';
import { Database, Post, User, Comment } from '@/utils/types';

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
  // this shit is killing me
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      *,
      posts:posts(count),
      friendships:friendships!friendships_user_id_1_fkey(count),
      likes:posts!inner(id, likes(count))
    `
    ) // this shit killed me
    .eq('id', id)
    .single();

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { posts, friendships, likes, ...user } = data;
  const postCount = data.posts[0].count;
  const friendCount = data.friendships[0].count;
  const likeCount: number = data.likes.reduce(
    (acc: number, post: { likes: { count: number }[] }) =>
      acc + post.likes[0].count,
    0
  );

  return {
    user,
    postCount,
    friendCount,
    likeCount,
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
    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL valid for 7 days

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
    comment_count: post.comments[0].count,
    like_count: post.likes[0].count,
  }));
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
    .select('*')
    .eq('id', commentId)
    .single();
  if (error) throw error;
  return data;
};

export const getCommentsByPostId = async (
  postId: string,
  commentId?: string
) => {
  if (typeof commentId === 'undefined') {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
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
  id: string,
  status: 'pending' | 'accepted'
) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteFriendship = async (id: string) => {
  const { error } = await supabase.from('friendships').delete().eq('id', id);
  if (error) throw error;
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
