import {
  Map as ImmutableMap,
  List as ImmutableList,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';
import { createSelector } from 'reselect';

import { getSettings } from 'soapbox/actions/settings';
import { Entities } from 'soapbox/entity-store/entities';
import { type MRFSimple } from 'soapbox/schemas/pleroma';
import { getDomain } from 'soapbox/utils/accounts';
import { validId } from 'soapbox/utils/auth';
import ConfigDB from 'soapbox/utils/config-db';
import { getFeatures } from 'soapbox/utils/features';
import { shouldFilter } from 'soapbox/utils/timelines';

import type { EntityStore } from 'soapbox/entity-store/types';
import type { ContextType } from 'soapbox/normalizers/filter';
import type { ReducerChat } from 'soapbox/reducers/chats';
import type { Account as AccountSchema } from 'soapbox/schemas';
import type { RootState } from 'soapbox/store';
import type { Account, Filter as FilterEntity, Notification, Status } from 'soapbox/types/entities';

const normalizeId = (id: any): string => typeof id === 'string' ? id : '';

export function selectAccount(state: RootState, accountId: string) {
  return state.entities[Entities.ACCOUNTS]?.store[accountId] as AccountSchema | undefined;
}

export function selectAccounts(state: RootState, accountIds: ImmutableList<string>) {
  return accountIds.map(accountId => state.entities[Entities.ACCOUNTS]?.store[accountId] as AccountSchema | undefined);
}

export function selectOwnAccount(state: RootState) {
  if (state.me) {
    return selectAccount(state, state.me);
  }
}

export const accountIdsToAccts = (state: RootState, ids: string[]) => ids.map((id) => selectAccount(state, id)!.acct);

const getAccountBase         = (state: RootState, id: string) => state.entities[Entities.ACCOUNTS]?.store[id] as Account | undefined;
const getAccountRelationship = (state: RootState, id: string) => state.relationships.get(id);
const getAccountMeta         = (state: RootState, id: string) => state.accounts_meta[id];

export const makeGetAccount = () => {
  return createSelector([
    getAccountBase,
    getAccountRelationship,
    getAccountMeta,
  ], (account, relationship, meta) => {
    if (!account) return null;
    return {
      ...account,
      relationship,
      source: meta?.source ?? account.source,
      pleroma: meta?.pleroma ?? account.pleroma,
    };
  });
};

const toServerSideType = (columnType: string): ContextType => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.includes('list:')) {
        return 'home';
      } else {
        return 'public'; // community, account, hashtag
      }
  }
};

type FilterContext = { contextType?: string };

export const getFilters = (state: RootState, query: FilterContext) => {
  return state.filters.filter((filter) => {
    return (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
      && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime());
  });
};

const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const regexFromFilters = (filters: ImmutableList<FilterEntity>) => {
  if (filters.size === 0) return null;

  return new RegExp(filters.map(filter =>
    filter.keywords.map(keyword => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      return expr;
    }).join('|'),
  ).join('|'), 'i');
};

const checkFiltered = (index: string, filters: ImmutableList<FilterEntity>) =>
  filters.reduce((result, filter) =>
    result.concat(filter.keywords.reduce((result, keyword) => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      const regex = new RegExp(expr);

      if (regex.test(index)) return result.concat(filter.title);
      return result;
    }, ImmutableList<string>())), ImmutableList<string>());

type APIStatus = { id: string; username?: string };

export const makeGetStatus = () => {
  return createSelector(
    [
      (state: RootState, { id }: APIStatus) => state.statuses.get(id) as Status | undefined,
      (state: RootState, { id }: APIStatus) => state.statuses.get(state.statuses.get(id)?.reblog || '') as Status | undefined,
      (_state: RootState, { username }: APIStatus) => username,
      getFilters,
      (state: RootState) => state.me,
      (state: RootState) => getFeatures(state.instance),
    ],

    (statusBase, statusReblog, username, filters, me, features) => {
      if (!statusBase) return null;
      const { account } = statusBase;
      const accountUsername = account.acct;

      // Must be owner of status if username exists.
      if (accountUsername !== username && username !== undefined) {
        return null;
      }

      return statusBase.withMutations((map: Status) => {
        map.set('reblog', statusReblog || null);

        if ((features.filters) && account.id !== me) {
          const filtered = checkFiltered(statusReblog?.search_index || statusBase.search_index, filters);

          map.set('filtered', filtered);
        }
      });
    },
  );
};

export const makeGetNotification = () => {
  return createSelector([
    (_state: RootState, notification: Notification) => notification,
    (state: RootState, notification: Notification) => selectAccount(state, normalizeId(notification.account)),
    (state: RootState, notification: Notification) => selectAccount(state, normalizeId(notification.target)),
    (state: RootState, notification: Notification) => state.statuses.get(normalizeId(notification.status)),
    (state: RootState, notification: Notification) => notification.accounts ? selectAccounts(state, notification.accounts?.map(normalizeId)) : null,
  ], (notification, account, target, status, accounts) => {
    return notification.merge({
      // @ts-ignore
      account: account || null,
      // @ts-ignore
      target: target || null,
      // @ts-ignore
      status: status || null,
      // @ts-ignore
      accounts,
    });
  });
};

export const getAccountGallery = createSelector([
  (state: RootState, id: string) => state.timelines.get(`account:${id}:media`)?.items || ImmutableOrderedSet<string>(),
  (state: RootState) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce((medias: ImmutableList<any>, statusId: string) => {
    const status = statuses.get(statusId);
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => media.merge({ status, account: status.account })));
  }, ImmutableList());
});

export const getGroupGallery = createSelector([
  (state: RootState, id: string) => state.timelines.get(`group:${id}:media`)?.items || ImmutableOrderedSet<string>(),
  (state: RootState) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce((medias: ImmutableList<any>, statusId: string) => {
    const status = statuses.get(statusId);
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => media.merge({ status, account: status.account })));
  }, ImmutableList());
});

type APIChat = { id: string; last_message: string };

export const makeGetChat = () => {
  return createSelector(
    [
      (state: RootState, { id }: APIChat) => state.chats.items.get(id) as ReducerChat,
      (state: RootState, { id }: APIChat) => selectAccount(state, state.chats.items.getIn([id, 'account']) as string),
      (state: RootState, { last_message }: APIChat) => state.chat_messages.get(last_message),
    ],

    (chat, account, lastMessage) => {
      if (!chat || !account) return null;

      return chat.withMutations((map) => {
        // @ts-ignore
        map.set('account', account);
        // @ts-ignore
        map.set('last_message', lastMessage);
      });
    },
  );
};

export const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (state: RootState, id: string) => state.admin.reports.get(id),
      (state: RootState, id: string) => selectAccount(state, state.admin.reports.get(id)?.account || ''),
      (state: RootState, id: string) => selectAccount(state, state.admin.reports.get(id)?.target_account || ''),
      (state: RootState, id: string) => ImmutableList(fromJS(state.admin.reports.get(id)?.statuses)).map(
        statusId => state.statuses.get(normalizeId(statusId)))
        .filter((s: any) => s)
        .map((s: any) => getStatus(state, s.toJS())),
    ],

    (report, account, targetAccount, statuses) => {
      if (!report) return null;
      return report.withMutations((report) => {
        // @ts-ignore
        report.set('account', account);
        // @ts-ignore
        report.set('target_account', targetAccount);
        // @ts-ignore
        report.set('statuses', statuses);
      });
    },
  );
};

const getAuthUserIds = createSelector([
  (state: RootState) => state.auth.users,
], authUsers => {
  return authUsers.reduce((ids: ImmutableOrderedSet<string>, authUser) => {
    try {
      const id = authUser.id;
      return validId(id) ? ids.add(id) : ids;
    } catch {
      return ids;
    }
  }, ImmutableOrderedSet<string>());
});

export const makeGetOtherAccounts = () => {
  return createSelector([
    (state: RootState) => state.entities[Entities.ACCOUNTS]?.store as EntityStore<AccountSchema>,
    getAuthUserIds,
    (state: RootState) => state.me,
  ],
  (accounts, authUserIds, me) => {
    return authUserIds
      .reduce((list: ImmutableList<any>, id: string) => {
        if (id === me) return list;
        const account = accounts[id];
        return account ? list.push(account) : list;
      }, ImmutableList());
  });
};

const getSimplePolicy = createSelector([
  (state: RootState) => state.admin.configs,
  (state: RootState) => state.instance.pleroma.metadata.federation.mrf_simple,
], (configs, instancePolicy) => {
  return {
    ...instancePolicy,
    ...ConfigDB.toSimplePolicy(configs),
  };
});

const getRemoteInstanceFavicon = (state: RootState, host: string) => {
  const accounts = state.entities[Entities.ACCOUNTS]?.store as EntityStore<AccountSchema>;
  const account = Object.entries(accounts).find(([_, account]) => account && getDomain(account) === host)?.[1];
  return account?.pleroma?.favicon;
};

export type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

const getRemoteInstanceFederation = (state: RootState, host: string): HostFederation => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [key, hosts.includes(host)]),
  ) as HostFederation;
};


export const makeGetHosts = () => {
  return createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return Object.values(rest)
      .reduce((acc, hosts) => acc.union(hosts), ImmutableOrderedSet())
      .sort();
  });
};

export const RemoteInstanceRecord = ImmutableRecord({
  host: '',
  favicon: null as string | null,
  federation: null as unknown as HostFederation,
});

export type RemoteInstance = ReturnType<typeof RemoteInstanceRecord>;

export const makeGetRemoteInstance = () =>
  createSelector([
    (_state: RootState, host: string) => host,
    getRemoteInstanceFavicon,
    getRemoteInstanceFederation,
  ], (host, favicon, federation) =>
    RemoteInstanceRecord({
      host,
      favicon,
      federation,
    }));

type ColumnQuery = { type: string; prefix?: string };

export const makeGetStatusIds = () => createSelector([
  (state: RootState, { type, prefix }: ColumnQuery) => getSettings(state).get(prefix || type, ImmutableMap()),
  (state: RootState, { type }: ColumnQuery) => state.timelines.get(type)?.items || ImmutableOrderedSet(),
  (state: RootState) => state.statuses,
], (columnSettings: any, statusIds: ImmutableOrderedSet<string>, statuses) => {
  return statusIds.filter((id: string) => {
    const status = statuses.get(id);
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  });
});
