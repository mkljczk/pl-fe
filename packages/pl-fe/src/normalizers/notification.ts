import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';

import { normalizeAccount } from './account';

import type { OrderedMap as ImmutableOrderedMap } from 'immutable';
import type { Notification as BaseNotification } from 'pl-api';
import type { MinifiedNotification } from 'pl-fe/reducers/notifications';

const STATUS_NOTIFICATION_TYPES = [
  'favourite',
  'reblog',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const normalizeNotification = (notification: BaseNotification) => ({
  ...notification,
  duplicate: false,
  account: normalizeAccount(notification.account),
  account_id: notification.account.id,
  accounts: [normalizeAccount(notification.account)],
  account_ids: [notification.account.id],
});

const normalizeNotifications = (
  notifications: Array<BaseNotification>,
  stateNotifications?: ImmutableOrderedMap<string, MinifiedNotification>,
) => {
  const deduplicatedNotifications: Notification[] = [];

  for (const notification of notifications) {
    const existingNotification = stateNotifications?.get(notification.id);

    // Do not update grouped notifications
    if (
      existingNotification &&
      (existingNotification.duplicate ||
        existingNotification.account_ids.length)
    )
      continue;

    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications.find(
        (deduplicated) =>
          deduplicated.type === notification.type &&
          (notification.type === 'emoji_reaction' &&
          deduplicated.type === 'emoji_reaction'
            ? notification.emoji === deduplicated.emoji
            : true) &&
          getNotificationStatus(deduplicated)?.id ===
            getNotificationStatus(notification)?.id,
      );

      if (existingNotification) {
        existingNotification.accounts.push(
          normalizeAccount(notification.account),
        );
        existingNotification.account_ids.push(notification.account.id);
        deduplicatedNotifications.push({
          ...normalizeNotification(notification),
          duplicate: true,
        });
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
