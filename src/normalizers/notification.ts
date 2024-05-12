/**
 * Notification normalizer:
 * Converts API notifications into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/notification/}
 */
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import type { Account, Status, EmbeddedEntity } from 'soapbox/types/entities';

// https://docs.joinmastodon.org/entities/notification/
export const NotificationRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account>,
  accounts: null as ImmutableList<EmbeddedEntity<Account>> | null,
  chat_message: null as ImmutableMap<string, any> | string | null, // pleroma:chat_mention
  created_at: new Date(),
  emoji: null as string | null, // pleroma:emoji_reaction
  emoji_url: null as string | null, // pleroma:emoji_reaction
  id: '',
  status: null as EmbeddedEntity<Status>,
  target: null as EmbeddedEntity<Account>, // move
  type: '',
});

const normalizeType = (notification: ImmutableMap<string, any>) => {
  if (notification.get('type') === 'group_mention') {
    return notification.set('type', 'mention');
  }

  return notification;
};

export const normalizeNotification = (notification: Record<string, any>) => NotificationRecord(
  ImmutableMap(fromJS(notification))
    .withMutations((notification: ImmutableMap<string, any>) => {
      normalizeType(notification);
    }),
);
