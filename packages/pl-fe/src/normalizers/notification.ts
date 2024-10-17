import type { Notification as BaseNotification } from 'pl-api';

const normalizeNotification = (notification: BaseNotification) => ({
  accounts: [notification.account],
  duplicate: false,
  ...notification,
});

type Notification = ReturnType<typeof normalizeNotification>;

export { normalizeNotification, type Notification };
