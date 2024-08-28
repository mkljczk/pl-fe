import {
  Map as ImmutableMap,
  List as ImmutableList,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';
import { createSelector } from 'reselect';

import { getLocale, getSettings } from 'pl-fe/actions/settings';
import { Entities } from 'pl-fe/entity-store/entities';
import { getDomain } from 'pl-fe/utils/accounts';
import { validId } from 'pl-fe/utils/auth';
import ConfigDB from 'pl-fe/utils/config-db';
import { shouldFilter } from 'pl-fe/utils/timelines';

import type { Account as BaseAccount, Filter, MediaAttachment } from 'pl-api';
import type { EntityStore } from 'pl-fe/entity-store/types';
import type { Account, Group, Notification } from 'pl-fe/normalizers';
import type { MinifiedNotification } from 'pl-fe/reducers/notifications';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';
import type { MRFSimple } from 'pl-fe/schemas/pleroma';
import type { RootState } from 'pl-fe/store';

const normalizeId = (id: any): string => typeof id === 'string' ? id : typeof id === 'object' ? normalizeId(id.id) : '';

const selectAccount = (state: RootState, accountId: string) =>
  state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined;

const selectAccounts = (state: RootState, accountIds: Array<string>) =>
  accountIds.map(accountId => state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined);

const selectOwnAccount = (state: RootState) => {
  if (state.me) {
    return selectAccount(state, state.me);
  }
};

const getAccountBase = (state: RootState, accountId: string) => state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined;
const getAccountRelationship = (state: RootState, accountId: string) => state.relationships.get(accountId);
const getAccountMeta = (state: RootState, accountId: string) => state.accounts_meta[accountId];

const makeGetAccount = () => createSelector([
  getAccountBase,
  getAccountRelationship,
  getAccountMeta,
], (account, relationship, meta) => {
  if (!account) return null;
  return {
    ...account,
    relationship,
    __meta: { meta, ...account.__meta },
  };
});

const toServerSideType = (columnType: string): Filter['context'][0] => {
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

const getFilters = (state: RootState, query: FilterContext) =>
  state.filters.filter((filter) =>
    (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
      && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime()),
  );

const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

const regexFromFilters = (filters: ImmutableList<Filter>) => {
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

const checkFiltered = (index: string, filters: ImmutableList<Filter>) =>
  filters.reduce((result: Array<string>, filter) =>
    result.concat(filter.keywords.reduce((result: Array<string>, keyword) => {
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
    }, [])), []);

type APIStatus = { id: string; username?: string };

const makeGetStatus = () => createSelector(
  [
    (state: RootState, { id }: APIStatus) => state.statuses.get(id),
    (state: RootState, { id }: APIStatus) => state.statuses.get(state.statuses.get(id)?.reblog_id || '', null),
    (state: RootState, { id }: APIStatus) => state.statuses.get(state.statuses.get(id)?.quote_id || '', null),
    (state: RootState, { id }: APIStatus) => {
      const group = state.statuses.get(id)?.group_id;
      if (group) return state.entities[Entities.GROUPS]?.store[group] as Group;
      return undefined;
    },
    (state: RootState, { id }: APIStatus) => state.polls.get(id) || null,
    (_state: RootState, { username }: APIStatus) => username,
    getFilters,
    (state: RootState) => state.me,
    (state: RootState) => state.auth.client.features,
    (state: RootState) => getLocale(state, 'en'),
  ],

  (statusBase, statusReblog, statusQuote, statusGroup, poll, username, filters, me, features, locale) => {
    if (!statusBase) return null;
    const { account } = statusBase;
    const accountUsername = account.acct;

    // Must be owner of status if username exists.
    if (accountUsername !== username && username !== undefined) {
      return null;
    }

    const filtered = features.filtersV2
      ? statusBase.filtered
      : features.filters && account.id !== me && checkFiltered(statusReblog?.search_index || statusBase.search_index || '', filters) || [];

    return {
      ...statusBase,
      reblog: statusReblog || null,
      quote: statusQuote || null,
      group: statusGroup || null,
      poll,
      filtered,
    };
    // if (map.currentLanguage === null && map.content_map?.size) {
    //   let currentLanguage: string | null = null;
    //   if (map.content_map.has(locale)) currentLanguage = locale;
    //   else if (map.language && map.content_map.has(map.language)) currentLanguage = map.language;
    //   else currentLanguage = map.content_map.keySeq().first();
    //   map.set('currentLanguage', currentLanguage);
    // }
  },
);

type SelectedStatus = Exclude<ReturnType<ReturnType<typeof makeGetStatus>>, null>;

const makeGetNotification = () => createSelector([
  (_state: RootState, notification: MinifiedNotification) => notification,
  // @ts-ignore
  (state: RootState, notification: MinifiedNotification) => selectAccount(state, normalizeId(notification.account_id)),
  // @ts-ignore
  (state: RootState, notification: MinifiedNotification) => selectAccount(state, normalizeId(notification.target_id)),
  // @ts-ignore
  (state: RootState, notification: MinifiedNotification) => state.statuses.get(normalizeId(notification.status_id)),
  (state: RootState, notification: MinifiedNotification) => notification.account_ids ? selectAccounts(state, notification.account_ids?.map(normalizeId)) : null,
], (notification, account, target, status, accounts): Notification => ({
  ...notification,
  // @ts-ignore
  account: account || null,
  // @ts-ignore
  target: target || null,
  // @ts-ignore
  status: status || null,
  // @ts-ignore
  accounts,
}));

type AccountGalleryAttachment = MediaAttachment & {
  status: MinifiedStatus;
  account: BaseAccount;
}

const getAccountGallery = createSelector([
  (state: RootState, id: string) => state.timelines.get(`account:${id}:with_replies:media`)?.items || ImmutableOrderedSet<string>(),
  (state: RootState) => state.statuses,
], (statusIds, statuses) =>
  statusIds.reduce((medias: ImmutableList<AccountGalleryAttachment>, statusId: string) => {
    const status = statuses.get(statusId);
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, ImmutableList()),
);

const getGroupGallery = createSelector([
  (state: RootState, id: string) => state.timelines.get(`group:${id}:media`)?.items || ImmutableOrderedSet<string>(),
  (state: RootState) => state.statuses,
], (statusIds, statuses) =>
  statusIds.reduce((medias: ImmutableList<any>, statusId: string) => {
    const status = statuses.get(statusId);
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, ImmutableList()),
);

const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (state: RootState, id: string) => state.admin.reports.get(id),
      (state: RootState, id: string) => selectAccount(state, state.admin.reports.get(id)?.account_id || ''),
      (state: RootState, id: string) => selectAccount(state, state.admin.reports.get(id)?.target_account_id || ''),
      (state: RootState, id: string) => state.admin.reports.get(id)!.status_ids
        .map((id) => getStatus(state, { id }))
        .filter((status): status is SelectedStatus => status !== null),
    ],
    (report, account, target_account, statuses) => {
      if (!report) return null;
      return {
        ...report,
        account,
        target_account,
        statuses,
      };
    },
  );
};

const getAuthUserIds = createSelector(
  [(state: RootState) => state.auth.users],
  authUsers => authUsers.reduce((ids: ImmutableOrderedSet<string>, authUser) => {
    try {
      const id = authUser.id;
      return validId(id) ? ids.add(id) : ids;
    } catch {
      return ids;
    }
  }, ImmutableOrderedSet<string>()));

const makeGetOtherAccounts = () => createSelector([
  (state: RootState) => state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account>,
  getAuthUserIds,
  (state: RootState) => state.me,
], (accounts, authUserIds, me) =>
  authUserIds.reduce((list: ImmutableList<any>, id: string) => {
    if (id === me) return list;
    const account = accounts?.[id];
    return account ? list.push(account) : list;
  }, ImmutableList()),
);

const getSimplePolicy = createSelector([
  (state: RootState) => state.admin.configs,
  (state: RootState) => state.instance.pleroma.metadata.federation.mrf_simple,
], (configs, instancePolicy) => ({
  ...instancePolicy,
  ...ConfigDB.toSimplePolicy(configs),
}));

const getRemoteInstanceFavicon = (state: RootState, host: string) => {
  const accounts = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account>;
  const account = Object.entries(accounts).find(([_, account]) => account && getDomain(account) === host)?.[1];
  return account?.favicon;
};

type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

const getRemoteInstanceFederation = (state: RootState, host: string): HostFederation => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [key, hosts.includes(host)]),
  ) as HostFederation;
};

const makeGetHosts = () =>
  createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return Object.values(rest)
      .reduce((acc, hosts) => acc.union(hosts), ImmutableOrderedSet())
      .sort();
  });

const RemoteInstanceRecord = ImmutableRecord({
  host: '',
  favicon: null as string | null,
  federation: null as unknown as HostFederation,
});

type RemoteInstance = ReturnType<typeof RemoteInstanceRecord>;

const makeGetRemoteInstance = () =>
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

const makeGetStatusIds = () => createSelector([
  (state: RootState, { type, prefix }: ColumnQuery) => getSettings(state).get(prefix || type, ImmutableMap()),
  (state: RootState, { type }: ColumnQuery) => state.timelines.get(type)?.items || ImmutableOrderedSet(),
  (state: RootState) => state.statuses,
], (columnSettings: any, statusIds: ImmutableOrderedSet<string>, statuses) =>
  statusIds.filter((id: string) => {
    const status = statuses.get(id);
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  }),
);

export {
  type HostFederation,
  type RemoteInstance,
  selectAccount,
  selectAccounts,
  selectOwnAccount,
  makeGetAccount,
  getFilters,
  regexFromFilters,
  makeGetStatus,
  type SelectedStatus,
  makeGetNotification,
  type AccountGalleryAttachment,
  getAccountGallery,
  getGroupGallery,
  makeGetReport,
  makeGetOtherAccounts,
  makeGetHosts,
  RemoteInstanceRecord,
  makeGetRemoteInstance,
  makeGetStatusIds,
};
