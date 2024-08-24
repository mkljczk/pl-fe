import type { Notification } from 'pl-api';

/** Notification types known to Soapbox. */
const NOTIFICATION_TYPES = [
  'follow',
  'follow_request',
  'mention',
  'reblog',
  'favourite',
  'poll',
  'status',
  'move',
  'chat_mention',
  'emoji_reaction',
  'update',
  'event_reminder',
  'participation_request',
  'participation_accepted',
] as const;

/** Notification types to exclude from the "All" filter by default. */
const EXCLUDE_TYPES = [
  'chat_mention',
] as const;

type NotificationType = Notification['type'];

export {
  NOTIFICATION_TYPES,
  EXCLUDE_TYPES,
  NotificationType,
};
