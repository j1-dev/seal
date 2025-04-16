type UUID = string; // Simplified for brevity

type User = {
  id?: UUID | null;
  username: string;
  email: string;
  // password: string;
  profile_picture?: string | null;
  bio?: string | null;
  created_at: string;
};

type Post = {
  id?: UUID | null;
  user_id: UUID;
  content: string;
  media?: string | null;
  created_at?: string;
  comment_count?: number;
  like_count?: number;
  liked_by_user?: boolean;
};

type Like = {
  id?: UUID | null;
  post_id: UUID;
  user_id: UUID;
  created_at: string;
};

type Comment = {
  id?: UUID | null;
  post_id: UUID;
  user_id: UUID;
  content: string;
  parent_comment_id?: UUID | null;
  created_at?: string;
  comment_count?: number;
  like_count?: number;
  liked_by_user?: boolean;
};

type CommentLike = {
  id?: UUID | null;
  comment_id: UUID;
  user_id: UUID;
  created_at: string;
};

type Friendship = {
  id?: UUID | null;
  sender_id: UUID;
  receiver_id: UUID;
  status: 'pending' | 'accepted';
  created_at?: string;
};

type Message = {
  id?: UUID | null;
  sender_id: UUID;
  receiver_id: UUID;
  content: string;
  created_at: string;
};

type ChatRoom = {
  id?: UUID | null;
  name?: string | null;
  created_by: UUID;
  created_at: string;
};

type ChatRoomMember = {
  id?: UUID | null;
  chatroom_id: UUID;
  user_id: UUID;
  created_at: string;
};

type ChatRoomMessage = {
  id?: UUID | null;
  chatroom_id: UUID;
  sender_id: UUID;
  content: string;
  created_at: string;
};

type Notification = {
  id?: UUID | null;
  receiver_id: UUID;
  type: 'friend_request' | 'message' | 'like' | 'comment_like' | 'comment';
  sender_id: string;
  is_read: boolean;
  created_at: string;
  ref_id: UUID;
};

export type {
  User,
  Post,
  Like,
  Comment,
  CommentLike,
  Friendship,
  Message,
  ChatRoom,
  ChatRoomMember,
  ChatRoomMessage,
  Notification,
};
