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
};

type Reaction = {
  id?: UUID | null;
  post_id: UUID;
  user_id: UUID;
  type: 'heart' | 'repost';
  created_at: string;
};

type Comment = {
  id?: UUID | null;
  post_id: UUID;
  user_id: UUID;
  content: string;
  parent_comment_id?: UUID | null;
  created_at: string;
};

type CommentReaction = {
  id?: UUID | null;
  comment_id: UUID;
  user_id: UUID;
  type: 'heart';
  created_at: string;
};

type Friendship = {
  id?: UUID | null;
  user_id_1: UUID;
  user_id_2: UUID;
  status: 'pending' | 'accepted';
  created_at: string;
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
  user_id: UUID;
  type: 'friend_request' | 'message' | 'reaction' | 'comment';
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      Users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password: string;
          profile_picture: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Users']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Users']['Row']>;
      };
      Posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          media: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Posts']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Posts']['Row']>;
      };
      Reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: 'heart' | 'repost';
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Reactions']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Reactions']['Row']>;
      };
      Comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Comments']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Comments']['Row']>;
      };
      CommentReactions: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          type: 'heart';
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['CommentReactions']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['CommentReactions']['Row']
        >;
      };
      Friendships: {
        Row: {
          id: string;
          user_id_1: string;
          user_id_2: string;
          status: 'pending' | 'accepted';
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Friendships']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Friendships']['Row']>;
      };
      Messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Messages']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Messages']['Row']>;
      };
      ChatRooms: {
        Row: {
          id: string;
          name: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['ChatRooms']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['ChatRooms']['Row']>;
      };
      ChatRoomMembers: {
        Row: {
          id: string;
          chatroom_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['ChatRoomMembers']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['ChatRoomMembers']['Row']>;
      };
      ChatRoomMessages: {
        Row: {
          id: string;
          chatroom_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['ChatRoomMessages']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['ChatRoomMessages']['Row']
        >;
      };
      Notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'friend_request' | 'message' | 'reaction' | 'comment';
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['Notifications']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['Notifications']['Row']>;
      };
    };
  };
};

export type {
  User,
  Post,
  Reaction,
  Comment,
  CommentReaction,
  Friendship,
  Message,
  ChatRoom,
  ChatRoomMember,
  ChatRoomMessage,
  Notification,
};
