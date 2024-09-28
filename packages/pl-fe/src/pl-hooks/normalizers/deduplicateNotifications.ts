import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';

import type { Account as BaseAccount, Notification as BaseNotification } from 'pl-api';

type DeduplicatedNotification = BaseNotification & {
  accounts: Array<BaseAccount>;
  duplicate?: boolean;
}

const STATUS_NOTIFICATION_TYPES = [
  'favourite',
  'reblog',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const deduplicateNotifications = (notifications: Array<BaseNotification>) => {
  const deduplicatedNotifications: DeduplicatedNotification[] = [];

  for (const notification of notifications) {
    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications
        .find(deduplicated =>
          deduplicated.type === notification.type
          && ((notification.type === 'emoji_reaction' && deduplicated.type === 'emoji_reaction') ? notification.emoji === deduplicated.emoji : true)
          && getNotificationStatus(deduplicated)?.id === getNotificationStatus(notification)?.id,
        );

      if (existingNotification) {
        existingNotification.accounts.push(notification.account);
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: true });
      } else {
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
      }
    } else {
      deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
    }
  }

  return deduplicatedNotifications;
};

export { deduplicateNotifications, type DeduplicatedNotification };
