import React, { useEffect, useState } from 'react';
import { Notification, User } from '@/utils/types';
import {
  deleteFriendship,
  deleteNotification,
  getUserById,
} from '@/utils/services';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { RxCross2 } from 'react-icons/rx';
import Link from 'next/link';

export default function CommentNotification({
  notification,
}: {
  notification: Notification;
}) {
  const [commentedBy, setCommentedBy] = useState<User | null>(null);

  useEffect(() => {
    const getFriendRequester = async () => {
      getUserById(notification.sender_id).then((user) => setCommentedBy(user));
    };
    getFriendRequester();
  }, [notification.sender_id]);

  const handleDeny = () => {
    deleteFriendship(notification.sender_id, notification.receiver_id);
    deleteNotification(notification.id as string);
  };

  if (commentedBy) {
    return (
      <div className="w-full h-24 border-b border-border p-4 my-2 relative">
        <Image
          src={commentedBy.profile_picture as string}
          alt="pp"
          width={52}
          height={52}
          className="rounded-full inline-flex border border-border"
        />
        <Link
          href={`u/${commentedBy.id}`}
          className="inline-flex pl-3 font-black text-lg hover:underline">
          {commentedBy.username}{' '}
        </Link>
        <span className="text-lg font-normal">
          {' '}
          Has commented on your{' '}
          <Link href={`c/${notification.ref_id}`}>post</Link>
        </span>

        <div className="absolute right-3 top-1/4">
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
