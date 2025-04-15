'use client';

import { useUser } from '@/utils/context/auth';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from '@/utils/services';
import { Notification } from '@/utils/types';
import { useEffect, useState } from 'react';
import NotificationCard from '@/components/cards/notification-card';
import TopBar from '@/components/tob-bar';
import { Separator } from '@/components/ui/separator';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const getNotifications = async () => {
      const data = await getUserNotifications(user?.id as string);
      setNotifications(data);

      unsubscribe = await subscribeToNotifications(
        user?.id as string,
        (update) => {
          switch (update.type) {
            case 'NOTIFICATION_INSERT':
              setNotifications((prev) => [
                update.payload.new as Notification,
                ...prev,
              ]);
              break;
            case 'NOTIFICATION_DELETE':
              setNotifications((prev) =>
                prev?.filter(
                  (post) => post.id !== (update.payload.old as Notification).id
                )
              );
              break;
            default:
              console.log('type not allowed');
              break;
          }
        }
      );
    };

    if (user?.id) {
      getNotifications();
      markAllNotificationsAsRead(user.id);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return (
    <div>
      <TopBar title="Notifications" />
      <Separator />
      {notifications ? (
        <div>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
}
