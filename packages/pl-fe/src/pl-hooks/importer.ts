import omit from 'lodash/omit';

import { importAccounts, importGroups, importPolls, importStatuses } from 'pl-fe/actions/importer';
import { importEntities as importEntityStoreEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';
import { store } from 'pl-fe/store';

import { DeduplicatedNotification } from './hooks/notifications/useNotifications';

import type {
  AccountWarning,
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  Status as BaseStatus,
  RelationshipSeveranceEvent,
} from 'pl-api';

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

const importNotification = (notification: DeduplicatedNotification) => {
  queryClient.setQueryData<MinifiedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : minifyNotification(notification),
  );
};

const isEmpty = (object: Record<string, any>) => {
  for (const i in object) return false;
  return true;
};

const importEntities = (entities: {
  accounts?: Array<BaseAccount>;
  notifications?: Array<DeduplicatedNotification>;
  polls?: Array<BasePoll>;
  statuses?: Array<BaseStatus>;
  relationships?: Array<BaseRelationship>;
}) => {
  const { dispatch } = store;

  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const notifications: Record<string, DeduplicatedNotification> = {};
  const polls: Record<string, BasePoll> = {};
  const relationships: Record<string, BaseRelationship> = {};
  const statuses: Record<string, BaseStatus> = {};

  const processAccount = (account: BaseAccount) => {
    accounts[account.id] = account;
    if (account.moved) processAccount(account.moved);
    if (account.relationship) relationships[account.relationship.id] = account.relationship;
  };

  const processNotification = (notification: DeduplicatedNotification) => {
    notifications[notification.id] = notification;

    processAccount(notification.account);
    if (notification.type === 'move') processAccount(notification.target);

    if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'].includes(notification.type))
      // @ts-ignore
      processStatus(notification.status);
  };

  const processStatus = (status: BaseStatus) => {
    statuses[status.id] = status;

    if (status.quote) processStatus(status.quote);
    if (status.reblog) processStatus(status.reblog);
    if (status.poll) polls[status.poll.id] = status.poll;
    if (status.group) groups[status.group.id] = status.group;
  };

  entities.accounts?.forEach(processAccount);
  entities.notifications?.forEach(processNotification);
  entities.polls?.forEach(poll => polls[poll.id] = poll);
  entities.relationships?.forEach(relationship => relationships[relationship.id] = relationship);
  entities.statuses?.forEach(processStatus);

  if (!isEmpty(accounts)) dispatch(importAccounts(Object.values(accounts)));
  if (!isEmpty(groups)) dispatch(importGroups(Object.values(groups)));
  if (!isEmpty(notifications)) Object.values(notifications).forEach(importNotification);
  if (!isEmpty(polls)) dispatch(importPolls(Object.values(polls)));
  if (!isEmpty(relationships)) dispatch(importEntityStoreEntities(Object.values(relationships), Entities.RELATIONSHIPS));
  if (!isEmpty(statuses)) dispatch(importStatuses(Object.values(statuses)));
};

export { importEntities };
