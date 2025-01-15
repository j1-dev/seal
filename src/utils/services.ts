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

export const updateUser = async (
  id: string,
  updates: Partial<Database['public']['Tables']['Users']['Row']>
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
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

export const getPostById = async (id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const getPostsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deletePost = async (id: string) => {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
};

// --- Reaction Services ---
export const createReaction = async (
  reaction: Omit<
    Database['public']['Tables']['Reactions']['Row'],
    'id' | 'created_at'
  >
) => {
  const { data, error } = await supabase
    .from('reactions')
    .insert(reaction)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteReaction = async (id: string) => {
  const { error } = await supabase.from('reactions').delete().eq('id', id);
  if (error) throw error;
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

export const getCommentsByPostId = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
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
