-- This script initializes the database schema

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_posts_user_id ON Posts(user_id);
CREATE INDEX idx_posts_created_at ON Posts(created_at);

-- Create Reactions table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES Posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reactions_post_id ON Reactions(post_id);
CREATE INDEX idx_reactions_user_id ON Reactions(user_id);

-- Create Comments table
CREATE TABLE comments (
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
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES Comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type TEXT CHECK (type = 'heart') NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_commentreactions_comment_id ON CommentReactions(comment_id);
CREATE INDEX idx_commentreactions_user_id ON CommentReactions(user_id);

-- Create Friendships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_friendships_sender_id ON Friendships(sender_id);
CREATE INDEX idx_friendships_receiver_id ON Friendships(receiver_id);

-- Create Messages table
CREATE TABLE messages (
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
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    created_by UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chatrooms_created_by ON ChatRooms(created_by);

-- Create ChatRoomMembers table
CREATE TABLE chat_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatroom_id UUID REFERENCES ChatRooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chatroommembers_chatroom_id ON ChatRoomMembers(chatroom_id);
CREATE INDEX idx_chatroommembers_user_id ON ChatRoomMembers(user_id);

-- Create ChatRoomMessages table
CREATE TABLE chat_room_messages (
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
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('friend_request', 'message', 'like', 'comment')) NOT NULL,
    sender_id TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX idx_notifications_is_read ON Notifications(is_read);


CREATE VIEW accepted_friendships AS
SELECT *
FROM friendships
WHERE status = 'accepted';

CREATE OR REPLACE FUNCTION notify_comment() RETURNS TRIGGER AS $$
DECLARE
  receiver UUID;
BEGIN
  -- Determine if this is a top-level comment or a reply
  IF NEW.parent_comment_id IS NULL THEN
    -- Top-level comment: fetch the post owner's ID
    SELECT user_id INTO receiver FROM Posts WHERE id = NEW.post_id;
  ELSE
    -- Reply: fetch the owner of the parent comment
    SELECT user_id INTO receiver FROM Comments WHERE id = NEW.parent_comment_id;
  END IF;

  -- (Optional) Skip notification if sender and receiver are the same
  IF receiver = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert a new notification with type 'comment'
  INSERT INTO Notifications (receiver_id, type, sender_id, created_at)
  VALUES (receiver, 'comment', NEW.user_id::text, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER comment_notification
AFTER INSERT ON Comments
FOR EACH ROW
EXECUTE FUNCTION notify_comment();

CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  postOwner UUID;
BEGIN
  -- Fetch the owner of the post that was liked.
  SELECT user_id INTO postOwner
  FROM Posts 
  WHERE id = NEW.post_id;
  
  -- (Optional) Skip notification if the user liked their own post.
  IF postOwner = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check for existing like notification for this sender/receiver combination.
  IF EXISTS (
      SELECT 1 FROM Notifications
      WHERE receiver_id = postOwner 
        AND sender_id = NEW.user_id::text
        AND type = 'like'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Insert a new like notification.
  INSERT INTO Notifications (receiver_id, type, sender_id, created_at)
  VALUES (postOwner, 'like', NEW.user_id::text, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER post_like_notification
AFTER INSERT ON Likes
FOR EACH ROW
EXECUTE FUNCTION notify_post_like();

CREATE OR REPLACE FUNCTION notify_comment_like()
RETURNS TRIGGER AS $$
DECLARE
  commentOwner UUID;
BEGIN
  -- Fetch the owner of the comment that was liked.
  SELECT user_id INTO commentOwner
  FROM Comments 
  WHERE id = NEW.comment_id;
  
  -- (Optional) Skip notification if the user liked their own comment.
  IF commentOwner = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check for an existing like notification for this sender/receiver combination.
  IF EXISTS (
      SELECT 1 FROM Notifications
      WHERE receiver_id = commentOwner 
        AND sender_id = NEW.user_id::text
        AND type = 'like'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Insert a new like notification for the comment.
  INSERT INTO Notifications (receiver_id, type, sender_id, created_at)
  VALUES (commentOwner, 'like', NEW.user_id::text, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER comment_like_notification
AFTER INSERT ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION notify_comment_like();


