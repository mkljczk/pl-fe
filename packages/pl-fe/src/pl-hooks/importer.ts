import { importAccounts, importGroups, importPolls, importStatuses } from 'pl-fe/actions/importer';
import { importEntities as importEntityStoreEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';

import { minifyNotification, type MinifiedNotification } from './minifiers/minifyNotification';
import { DeduplicatedNotification } from './normalizers/deduplicateNotifications';
import { normalizeStatus, type Status } from './normalizers/normalizeStatus';

import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  Status as BaseStatus,
} from 'pl-api';
import type { AppDispatch } from 'pl-fe/store';

let dispatch: AppDispatch;

import('pl-fe/store').then(value => dispatch = value.store.dispatch).catch(() => {});

const importNotification = (notification: DeduplicatedNotification) => {
  queryClient.setQueryData<MinifiedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : minifyNotification(notification),
  );
};

const importStatus = (status: BaseStatus) => {
  queryClient.setQueryData<Status>(
    ['statuses', 'entities', status.id],
    _ => normalizeStatus(status),
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
}, options = {
  withParents: true,
}) => {
  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const notifications: Record<string, DeduplicatedNotification> = {};
  const polls: Record<string, BasePoll> = {};
  const relationships: Record<string, BaseRelationship> = {};
  const statuses: Record<string, BaseStatus> = {};

  const processAccount = (account: BaseAccount, withParent = true) => {
    if (withParent) accounts[account.id] = account;

    if (account.moved) processAccount(account.moved);
    if (account.relationship) relationships[account.relationship.id] = account.relationship;
  };

  const processNotification = (notification: DeduplicatedNotification, withParent = true) => {
    if (withParent) notifications[notification.id] = notification;

    processAccount(notification.account);
    if (notification.type === 'move') processAccount(notification.target);

    if (['mention', 'status', 'reblog', 'favourite', 'poll', 'update', 'emoji_reaction', 'event_reminder', 'participation_accepted', 'participation_request'].includes(notification.type))
      // @ts-ignore
      processStatus(notification.status);
  };

  const processStatus = (status: BaseStatus, withParent = true) => {
    if (status.account) {
      if (withParent) statuses[status.id] = status;
      processAccount(status.account);
    }

    if (status.quote) processStatus(status.quote);
    if (status.reblog) processStatus(status.reblog);
    if (status.poll) polls[status.poll.id] = status.poll;
    if (status.group) groups[status.group.id] = status.group;
  };

  if (options.withParents) {
    entities.groups?.forEach(group => groups[group.id] = group);
    entities.polls?.forEach(poll => polls[poll.id] = poll);
    entities.relationships?.forEach(relationship => relationships[relationship.id] = relationship);
  }

  entities.accounts?.forEach((account) => processAccount(account, options.withParents));
  entities.notifications?.forEach((notification) => processNotification(notification, options.withParents));
  entities.statuses?.forEach((status) => processStatus(status, options.withParents));

  if (!isEmpty(accounts)) dispatch(importAccounts(Object.values(accounts)));
  if (!isEmpty(groups)) dispatch(importGroups(Object.values(groups)));
  if (!isEmpty(notifications)) Object.values(notifications).forEach(importNotification);
  if (!isEmpty(polls)) dispatch(importPolls(Object.values(polls)));
  if (!isEmpty(relationships)) dispatch(importEntityStoreEntities(Object.values(relationships), Entities.RELATIONSHIPS));
  if (!isEmpty(statuses)) dispatch(importStatuses(Object.values(statuses)));
  if (!isEmpty(statuses)) Object.values(statuses).forEach(importStatus);
};

export { importEntities };
