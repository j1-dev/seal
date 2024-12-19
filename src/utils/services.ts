import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// --- User Services ---
export const createUser = async (
  user: Omit<Database['public']['Tables']['Users']['Row'], 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('Users')
    .insert(user)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('Users')
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
    .from('Users')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('Users').delete().eq('id', id);
  if (error) throw error;
};

// --- Post Services ---
export const createPost = async (
  post: Omit<Database['public']['Tables']['Posts']['Row'], 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('Posts')
    .insert(post)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getPostsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('Posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deletePost = async (id: string) => {
  const { error } = await supabase.from('Posts').delete().eq('id', id);
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
    .from('Reactions')
    .insert(reaction)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteReaction = async (id: string) => {
  const { error } = await supabase.from('Reactions').delete().eq('id', id);
  if (error) throw error;
};

// --- Comment Services ---
export const createComment = async (
  comment: Omit<
    Database['public']['Tables']['Comments']['Row'],
    'id' | 'created_at'
  >
) => {
  const { data, error } = await supabase
    .from('Comments')
    .insert(comment)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getCommentsByPostId = async (postId: string) => {
  const { data, error } = await supabase
    .from('Comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('Comments').delete().eq('id', id);
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
    .from('Friendships')
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
    .from('Friendships')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteFriendship = async (id: string) => {
  const { error } = await supabase.from('Friendships').delete().eq('id', id);
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
    .from('Messages')
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
    .from('Messages')
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
    .from('Notifications')
    .insert(notification)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('Notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('Notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};
