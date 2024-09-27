import { useQuery } from '@tanstack/react-query';
import omit from 'lodash/omit';

import { useAppSelector, useClient } from 'pl-fe/hooks';
import { normalizeNotification, type Notification } from 'pl-fe/normalizers';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';

import type { AccountWarning, RelationshipSeveranceEvent } from 'pl-api';

type Account = ReturnType<typeof selectAccount>;

const minifyNotification = (notification: Notification) => {
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
    ...omit(notification, ['account', 'accounts']),
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

const importNotification = (notification: MinifiedNotification) => {
  queryClient.setQueryData<MinifiedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : notification,
  );
};

const useNotification = (notificationId: string) => {
  const client = useClient();

  const notificationQuery = useQuery({
    queryKey: ['notifications', 'entities', notificationId],
    queryFn: () => client.notifications.getNotification(notificationId)
      .then(normalizeNotification)
      .then(minifyNotification),
  });

  const data: Notification | null = useAppSelector((state) => {
    const notification = notificationQuery.data;
    if (!notification) return null;
    const account = selectAccount(state, notification.account_id)!;
    // @ts-ignore
    const target = selectAccount(state, notification.target_id)!;
    // @ts-ignore
    const status = state.statuses.get(notification.status_id)!;
    const accounts = selectAccounts(state, notification.account_ids).filter((account): account is Account => account !== undefined);

    return {
      ...notification,
      account,
      target,
      status,
      accounts,
    };
  });

  return { ...notificationQuery, data };
};

export { useNotification, importNotification, minifyNotification };
