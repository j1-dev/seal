import React from 'react';
import { Notification } from '@/utils/types';
import FriendNotification from './friend-notification';

export default function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  if (notification.type === 'friend_request') {
    return (
      // <div className="w-full h-20 border-b border-border p-4 my-2 relative">
      //   {notification.user_id}
      // </div>
      <FriendNotification notification={notification} />
    );
  } else if (notification.type === 'like') {
    return <div></div>;
  } else if (notification.type === 'comment') {
    return <div></div>;
  }
}
