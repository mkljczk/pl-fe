import { useInfiniteQuery } from '@tanstack/react-query';
import { useClient } from 'pl-fe/hooks';

import { queryClient } from 'pl-hooks/client';
import { importEntities } from 'pl-hooks/importer';
import { deduplicateNotifications } from 'pl-hooks/normalizers/deduplicateNotifications';
import { flattenPages } from 'pl-hooks/utils/queries';

import type { Notification as BaseNotification, PaginatedResponse, PlApiClient } from 'pl-api';

type UseNotificationParams = {
  types?: Array<BaseNotification['type']>;
  excludeTypes?: Array<BaseNotification['type']>;
}

const getQueryKey = (params: UseNotificationParams) => [
  'notifications',
  'lists',
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

const useNotificationList = (params: UseNotificationParams) => {
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
    queryFn: () => client.notifications.getNotifications({
      types: params.types,
      exclude_types: params.excludeTypes,
    }).then(importNotifications),
    initialPageParam: { previous: null, next: null } as Pick<PaginatedResponse<BaseNotification>, 'previous' | 'next'>,
  });

export { useNotificationList, prefetchNotifications };
