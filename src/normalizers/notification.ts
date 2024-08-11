import { getNotificationStatus } from 'soapbox/features/notifications/components/notification';

import type { Notification as BaseNotification } from 'pl-api';

const STATUS_NOTIFICATION_TYPES = [
  'favourite',
  'reblog',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const normalizeNotification = (notification: BaseNotification) => ({
  accounts: [notification.account],
  ...notification,
});

const normalizeNotifications = (notifications: Array<BaseNotification>) => {
  const deduplicatedNotifications: Notification[] = [];

  for (const notification of notifications) {
    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications
        .find(deduplicated =>
          deduplicated.type === notification.type
          && ((notification.type === 'emoji_reaction' && deduplicated.type === 'emoji_reaction') ? notification.emoji === deduplicated.emoji : true)
          && getNotificationStatus(deduplicated)?.id === getNotificationStatus(notification)?.id,
        );

      if (existingNotification) {
        if (existingNotification?.accounts) {
          existingNotification.accounts.push(notification.account);
        } else {
          existingNotification.accounts = [existingNotification.account, notification.account];
        }
        existingNotification.id += '+' + notification.id;
      } else {
        deduplicatedNotifications.push(normalizeNotification(notification));
      }
    } else {
      deduplicatedNotifications.push(normalizeNotification(notification));
    }
  }

  return deduplicatedNotifications;
};

type Notification = ReturnType<typeof normalizeNotification>;

export { normalizeNotification, normalizeNotifications, type Notification };
