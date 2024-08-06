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

type NotificationType = typeof NOTIFICATION_TYPES[number];

/** Ensure the Notification is a valid, known type. */
const validType = (type: string): type is NotificationType => NOTIFICATION_TYPES.includes(type as any);

export {
  NOTIFICATION_TYPES,
  EXCLUDE_TYPES,
  NotificationType,
  validType,
};
