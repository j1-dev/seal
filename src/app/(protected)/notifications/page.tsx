'use client';

import { useUser } from '@/utils/context/auth';
import { getUserNotifications } from '@/utils/services';
import { Notification } from '@/utils/types';
import { useEffect, useState } from 'react';
import NotificationCard from '@/components/cards/notification-card';
import TopBar from '@/components/tob-bar';
import { Separator } from '@/components/ui/separator';

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>();

  useEffect(() => {
    const getNotifications = async () => {
      getUserNotifications(user?.id as string).then((res) => {
        console.log(res);
        setNotifications(res);
      });
    };
    getNotifications();
  }, [user]);

  return (
    <div>
      <TopBar title='Notifications'/>
      <Separator/>
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
