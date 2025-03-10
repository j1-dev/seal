import React, { useEffect, useState } from 'react';
import { Notification, User } from '@/utils/types';
import {
  deleteFriendship,
  deleteNotification,
  getUserById,
  updateFriendshipStatus,
} from '@/utils/services';
import { Button } from './ui/button';

export default function FriendNotification({
  notification,
}: {
  notification: Notification;
}) {
  const [friendRequester, setFriendRequester] = useState<User | null>(null);

  useEffect(() => {
    const getFriendRequester = async () => {
      getUserById(notification.content).then((user) =>
        setFriendRequester(user)
      );
    };
    getFriendRequester();
  }, [notification.content]);

  const handleAccept = () => {
    updateFriendshipStatus(
      notification.content,
      notification.user_id,
      'accepted'
    );
    deleteNotification(notification.id as string);
  };

  const handleDeny = () => {
    deleteFriendship(notification.content, notification.user_id);
    deleteNotification(notification.id as string);
  };

  if (friendRequester) {
    return (
      <div className="w-full h-20 border-b border-border p-4 my-2 relative">
        <span>{friendRequester.username} wants to be your friend</span>
        <Button onClick={handleAccept}>accept</Button>
        <Button onClick={handleDeny}>deny</Button>
      </div>
    );
  } else {
    return <></>;
  }
}
