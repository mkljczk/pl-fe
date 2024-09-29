import { useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks';
import { importEntities } from 'pl-fe/pl-hooks/importer';
import { deduplicateNotifications } from 'pl-fe/pl-hooks/normalizers/deduplicateNotifications';
import { queryClient } from 'pl-fe/queries/client';
import { flattenPages } from 'pl-fe/utils/queries';

import type { Notification as BaseNotification, PaginatedResponse, PlApiClient } from 'pl-api';
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
  const deduplicatedNotifications = deduplicateNotifications(response.items);

  importEntities({
    notifications: deduplicatedNotifications,
  });

  return {
    items: deduplicatedNotifications.filter(({ duplicate }) => !duplicate).map(({ id }) => id),
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
