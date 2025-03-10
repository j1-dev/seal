-- This script initializes the database schema

REATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Posts table
CREATE TABLE Posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_posts_user_id ON Posts(user_id);
CREATE INDEX idx_posts_created_at ON Posts(created_at);

-- Create Reactions table
CREATE TABLE Reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES Posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('heart', 'repost')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reactions_post_id ON Reactions(post_id);
CREATE INDEX idx_reactions_user_id ON Reactions(user_id);

-- Create Comments table
CREATE TABLE Comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES Posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES Comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_comments_post_id ON Comments(post_id);
CREATE INDEX idx_comments_user_id ON Comments(user_id);

-- Create CommentReactions table
CREATE TABLE CommentReactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES Comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type TEXT CHECK (type = 'heart') NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_commentreactions_comment_id ON CommentReactions(comment_id);
CREATE INDEX idx_commentreactions_user_id ON CommentReactions(user_id);

-- Create Friendships table
CREATE TABLE Friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_friendships_sender_id ON Friendships(sender_id);
CREATE INDEX idx_friendships_receiver_id ON Friendships(receiver_id);

-- Create Messages table
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_messages_sender_id ON Messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON Messages(receiver_id);
CREATE INDEX idx_messages_created_at ON Messages(created_at);

-- Create ChatRooms table
CREATE TABLE ChatRooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    created_by UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chatrooms_created_by ON ChatRooms(created_by);

-- Create ChatRoomMembers table
CREATE TABLE ChatRoomMembers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatroom_id UUID REFERENCES ChatRooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chatroommembers_chatroom_id ON ChatRoomMembers(chatroom_id);
CREATE INDEX idx_chatroommembers_user_id ON ChatRoomMembers(user_id);

-- Create ChatRoomMessages table
CREATE TABLE ChatRoomMessages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatroom_id UUID REFERENCES ChatRooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chatroommessages_chatroom_id ON ChatRoomMessages(chatroom_id);
CREATE INDEX idx_chatroommessages_sender_id ON ChatRoomMessages(sender_id);
CREATE INDEX idx_chatroommessages_created_at ON ChatRoomMessages(created_at);

-- Create Notifications table
CREATE TABLE Notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('friend_request', 'message', 'reaction', 'comment')) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX idx_notifications_is_read ON Notifications(is_read);


CREATE VIEW accepted_friendships AS
SELECT *
FROM friendships
WHERE status = 'accepted';

create or replace function get_feed_posts(user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  content text,
  created_at timestamp,
  comment_count int,
  like_count int,
  liked_by_user boolean
) as $$
  select
    p.id,
    p.user_id,
    p.content,
    p.created_at,
    coalesce(c.comment_count, 0) as comment_count,
    coalesce(l.like_count, 0) as like_count,
    exists(select 1 from likes where post_id = p.id and user_id = $1) as liked_by_user
  from posts p
  left join (
      select post_id, count(*) as comment_count
      from comments
      group by post_id
  ) c on c.post_id = p.id
  left join (
      select post_id, count(*) as like_count
      from likes
      group by post_id
  ) l on l.post_id = p.id
  where p.user_id in (
      select receiver_id
      from friendships
      where sender_id = $1 and status = 'accepted'
  )
  order by p.created_at desc;

-- Populate sample data
INSERT INTO Users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', 'hashed_password1'),
('jane_doe', 'jane@example.com', 'hashed_password2');

INSERT INTO Posts (user_id, content) VALUES
((SELECT id FROM Users WHERE username = 'john_doe'), 'This is Johns first post!'),
((SELECT id FROM Users WHERE username = 'jane_doe'), 'This is Janes first post!');

INSERT INTO Comments (post_id, user_id, content) VALUES
((SELECT id FROM Posts WHERE content = 'This is Johns first post!'), (SELECT id FROM Users WHERE username = 'jane_doe'), 'Nice post, John!'),
((SELECT id FROM Posts WHERE content = 'This is Janes first post!'), (SELECT id FROM Users WHERE username = 'john_doe'), 'Thanks, Jane!');

INSERT INTO Friendships (user_one_id, user_two_id, status) VALUES
((SELECT id FROM Users WHERE username = 'john_doe'), (SELECT id FROM Users WHERE username = 'jane_doe'), 'accepted');

INSERT INTO Messages (sender_id, receiver_id, content) VALUES
((SELECT id FROM Users WHERE username = 'john_doe'), (SELECT id FROM Users WHERE username = 'jane_doe'), 'Hey Jane!'),
((SELECT id FROM Users WHERE username = 'jane_doe'), (SELECT id FROM Users WHERE username = 'john_doe'), 'Hi John!');

INSERT INTO Notifications (user_id, content) VALUES
((SELECT id FROM Users WHERE username = 'john_doe'), 'Jane commented on your post!'),
((SELECT id FROM Users WHERE username = 'jane_doe'), 'John sent you a message!');
