-- This script initializes the database schema and populates it with sample data using OrioleDB features.

-- Enable OrioleDB
CREATE EXTENSION IF NOT EXISTS orioledb;

-- --- Users Table ---
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Posts Table ---
CREATE TABLE Posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Comments Table ---
CREATE TABLE Comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES Posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Reactions Table ---
CREATE TABLE Reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES Posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES Comments(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('heart')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Friendships Table ---
CREATE TABLE Friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_one_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Messages Table ---
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

-- --- Notifications Table ---
CREATE TABLE Notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
) USING orioledb;

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
