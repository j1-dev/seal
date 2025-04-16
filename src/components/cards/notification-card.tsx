import React from 'react';
import { Notification } from '@/utils/types';
import FriendNotification from '@/components/cards/notifications/friend-notification';
import LikeNotification from '@/components/cards/notifications/like-notification';
import CommentNotification from '@/components/cards/notifications/comment-notification';
import CommentLikeNotification from '@/components/cards/notifications/comment-like-notification';

export default function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  if (notification.type === 'friend_request') {
    return <FriendNotification notification={notification} />;
  } else if (notification.type === 'like') {
    return <LikeNotification notification={notification} />;
  } else if (notification.type === 'comment') {
    return <CommentNotification notification={notification} />;
  } else if (notification.type === 'comment_like') {
    return <CommentLikeNotification notification={notification} />;
  }
}
