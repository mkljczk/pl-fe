import { importAccounts, importGroups, importPolls, importStatuses } from 'pl-fe/actions/importer';
import { importEntities as importEntityStoreEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';
import { store } from 'pl-fe/store';

import { MinifiedNotification, minifyNotification } from './minifiers/minifyNotification';
import { DeduplicatedNotification } from './normalizers/deduplicateNotifications';

import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  StatusWithoutAccount as BaseStatus,
} from 'pl-api';

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
  groups?: Array<BaseGroup>;
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
    if (!statuses[status.id] || status.account || !statuses[status.id].account) statuses[status.id] = status;

    if (status.account) processAccount(status.account);
    if (status.quote) processStatus(status.quote);
    if (status.reblog) processStatus(status.reblog);
    if (status.poll) polls[status.poll.id] = status.poll;
    if (status.group) groups[status.group.id] = status.group;
  };

  entities.accounts?.forEach(processAccount);
  entities.groups?.forEach(group => groups[group.id] = group);
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
