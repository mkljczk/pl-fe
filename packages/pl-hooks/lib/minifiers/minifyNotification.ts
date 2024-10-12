import omit from 'lodash/omit';

import { DeduplicatedNotification } from '../normalizers/normalizeNotifications';

import type { AccountWarning, RelationshipSeveranceEvent } from 'pl-api';

const minifyNotification = (notification: DeduplicatedNotification) => {
  // @ts-ignore
  const minifiedNotification: {
    duplicate: boolean;
    account_id: string;
    account_ids: string[];
    created_at: string;
    id: string;
    group_key: string;
  } & (
    | { type: 'follow' | 'follow_request' | 'admin.sign_up' | 'bite' }
    | {
      type: 'mention';
      subtype?: 'reply';
      status_id: string;
    }
    | {
      type: 'status' | 'reblog' | 'favourite' | 'poll' | 'update' | 'event_reminder';
      status_id: string;
     }
    | {
      type: 'admin.report';
      report: Report;
    }
    | {
      type: 'severed_relationships';
      relationship_severance_event: RelationshipSeveranceEvent;
    }
    | {
      type: 'moderation_warning';
      moderation_warning: AccountWarning;
    }
    | {
      type: 'move';
      target_id: string;
    }
    | {
      type: 'emoji_reaction';
      emoji: string;
      emoji_url: string | null;
      status_id: string;
    }
    | {
      type: 'chat_mention';
      chat_message_id: string;
    }
    | {
      type: 'participation_accepted' | 'participation_request';
      status_id: string;
      participation_message: string | null;
    }
  ) = {
    ...omit(notification, ['account', 'accounts', 'status', 'target', 'chat_message']),
    account_id: notification.account.id,
    account_ids: notification.accounts.map(({ id }) => id),
    created_at: notification.created_at,
    id: notification.id,
    type: notification.type,
  };

  // @ts-ignore
  if (notification.status) minifiedNotification.status_id = notification.status.id;
  // @ts-ignore
  if (notification.target) minifiedNotification.target_id = notification.target.id;
  // @ts-ignore
  if (notification.chat_message) minifiedNotification.chat_message_id = notification.chat_message.id;

  return minifiedNotification;
};

type MinifiedNotification = ReturnType<typeof minifyNotification>;

export { minifyNotification, type MinifiedNotification };
