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
      getUserById(notification.sender_id).then((user) =>
        setFriendRequester(user)
      );
    };
    getFriendRequester();
  }, [notification.sender_id]);

  const handleAccept = () => {
    updateFriendshipStatus(
      notification.sender_id,
      notification.receiver_id,
      'accepted'
    );
    deleteNotification(notification.id as string);
  };

  const handleDeny = () => {
    deleteFriendship(notification.sender_id, notification.receiver_id);
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
