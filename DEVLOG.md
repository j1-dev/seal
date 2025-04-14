# Seal Devlog

## IN PROCESS

- Make a decent landing page
- Notifications v1

## TO-DO

- Images on Posts
- Chats
- Settings page

## 03/04/2025

- Clean up `service.ts`
- Rework frontend and change font
- Organize `components` directory
- Limit number of characters to 235 and add a backwards counter to sendbox component

## 27/03/2025

- Rework liking system so that it doesn't depend on localStorage
- Discover page v0

## 10/03/2025

- Friendships v0
- Friendship Notifications v0
- Notifications v0
- user_id_1 -> sender_id, user_id_2 -> receiver_id
- Realtime feed that shows friends posts

## < 19/02/2025

- **Project Initialization**
- **Database Setup**
- **Basic Features**
  - User Authentication
  - Created `services.ts` for functions that interact with the back-end
  - Realtime feed with supabase realtime listeners
  - Post creation/deletion
  - Posts can be liked/unliked
  - Posts can have comments
  - Comment creation/deletion
  - Comments can be liked/unliked
  - Comments can have comments
  - Replies realtime feed to watch comments live
  - Created function that fetches the comment thread between a comment and the Post its refering to
  - Profile view with editable fields (name, bio)
  - Profile picture can be changed
