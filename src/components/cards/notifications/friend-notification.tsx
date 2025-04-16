import React, { useEffect, useState } from 'react';
import { Notification, User } from '@/utils/types';
import {
  deleteFriendship,
  deleteNotification,
  getUserById,
  updateFriendshipStatus,
} from '@/utils/services';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { RxCross2 } from 'react-icons/rx';
import { FaCheck } from 'react-icons/fa6';
import Link from 'next/link';

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
      <div className="w-full h-24 border-b border-border p-4 my-2 relative">
        <Image
          src={friendRequester.profile_picture as string}
          alt="pp"
          width={52}
          height={52}
          className="rounded-full inline-flex border border-border"
        />
        <Link
          href={`u/${friendRequester.id}`}
          className="inline-flex pl-3 font-black text-lg hover:underline">
          {friendRequester.username}{' '}
        </Link>
        <span className="text-lg font-normal">
          {' '}
          wants to be your friend
        </span>

        <div className="absolute right-3 top-1/4">
          <Button className="mx-2" onClick={handleAccept}>
            <FaCheck />
          </Button>
          <Button onClick={handleDeny}>
            <RxCross2 />
          </Button>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
