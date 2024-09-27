import { useInfiniteQuery } from '@tanstack/react-query';

import { importFetchedAccounts, importFetchedStatuses } from 'pl-fe/actions/importer';
import { useClient } from 'pl-fe/hooks';
import { normalizeNotifications } from 'pl-fe/normalizers';
import { queryClient } from 'pl-fe/queries/client';
import { AppDispatch, store } from 'pl-fe/store';
import { flattenPages } from 'pl-fe/utils/queries';

import { importNotification, minifyNotification } from './useNotification';

import type {
  Account as BaseAccount,
  Notification as BaseNotification,
  PaginatedResponse,
  PlApiClient,
  Status as BaseStatus,
} from 'pl-api';
import type { NotificationType } from 'pl-fe/utils/notification';


type UseNotificationParams = {
  types?: Array<NotificationType>;
  excludeTypes?: Array<NotificationType>;
}

const getQueryKey = (params: UseNotificationParams) => [
  'notifications',
  params.types ? params.types.join('|') : params.excludeTypes ? ('exclude:' + params.excludeTypes.join('|')) : 'all',
];

const importNotifications = (response: PaginatedResponse<BaseNotification>) => {
  const accounts: Record<string, BaseAccount> = {};
  const statuses: Record<string, BaseStatus> = {};

  response.items.forEach((notification) => {
    accounts[notification.account.id] = notification.account;

    if (notification.type === 'move') accounts[notification.target.id] = notification.target;

    // @ts-ignore
    if (notification.status?.id) {
      // @ts-ignore
      statuses[notification.status.id] = notification.status;
    }
  });

  store.dispatch<AppDispatch>(importFetchedStatuses(Object.values(statuses)));
  store.dispatch<AppDispatch>(importFetchedAccounts(Object.values(accounts)));

  const normalizedNotifications = normalizeNotifications(response.items);

  normalizedNotifications.map(minifyNotification).forEach(importNotification);

  return {
    items: normalizedNotifications.filter(({ duplicate }) => !duplicate).map(({ id }) => id),
    previous: response.previous,
    next: response.next,
  };
};

const useNotifications = (params: UseNotificationParams) => {
  const client = useClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: getQueryKey(params),
    queryFn: ({ pageParam }) => (pageParam.next ? pageParam.next() : client.notifications.getNotifications({
      types: params.types,
      exclude_types: params.excludeTypes,
    })).then(importNotifications),
    initialPageParam: { previous: null, next: null } as Pick<PaginatedResponse<BaseNotification>, 'previous' | 'next'>,
    getNextPageParam: (response) => response,
  });

  const data = flattenPages<string>(notificationsQuery.data) || [];

  return {
    ...notificationsQuery,
    data,
  };
};

const prefetchNotifications = (client: PlApiClient, params: UseNotificationParams) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: getQueryKey(params),
    queryFn: ({ pageParam }) => (pageParam.next ? pageParam.next() : client.notifications.getNotifications({
      types: params.types,
      exclude_types: params.excludeTypes,
    })).then(importNotifications),
    initialPageParam: { previous: null, next: null } as Pick<PaginatedResponse<BaseNotification>, 'previous' | 'next'>,
    getNextPageParam: (response) => response,
  });

export { useNotifications, prefetchNotifications };
