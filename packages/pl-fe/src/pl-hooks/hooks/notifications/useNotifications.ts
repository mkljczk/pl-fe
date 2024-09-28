import { useInfiniteQuery } from '@tanstack/react-query';

import { getNotificationStatus } from 'pl-fe/features/notifications/components/notification';
import { useClient } from 'pl-fe/hooks';
import { importEntities } from 'pl-fe/pl-hooks/importer';
import { queryClient } from 'pl-fe/queries/client';
import { flattenPages } from 'pl-fe/utils/queries';

import type {
  Account as BaseAccount,
  Notification as BaseNotification,
  PaginatedResponse,
  PlApiClient,
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

type DeduplicatedNotification = BaseNotification & {
  accounts: Array<BaseAccount>;
  duplicate?: boolean;
}

const STATUS_NOTIFICATION_TYPES = [
  'favourite',
  'reblog',
  'emoji_reaction',
  'event_reminder',
  'participation_accepted',
  'participation_request',
];

const deduplicateNotifications = (notifications: Array<BaseNotification>) => {
  const deduplicatedNotifications: DeduplicatedNotification[] = [];

  for (const notification of notifications) {
    if (STATUS_NOTIFICATION_TYPES.includes(notification.type)) {
      const existingNotification = deduplicatedNotifications
        .find(deduplicated =>
          deduplicated.type === notification.type
          && ((notification.type === 'emoji_reaction' && deduplicated.type === 'emoji_reaction') ? notification.emoji === deduplicated.emoji : true)
          && getNotificationStatus(deduplicated)?.id === getNotificationStatus(notification)?.id,
        );

      if (existingNotification) {
        existingNotification.accounts.push(notification.account);
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: true });
      } else {
        deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
      }
    } else {
      deduplicatedNotifications.push({ ...notification, accounts: [notification.account], duplicate: false });
    }
  }

  return deduplicatedNotifications;
};

const importNotifications = (response: PaginatedResponse<BaseNotification>) => {
  const deduplicatedNotifications = deduplicateNotifications(response.items);

  importEntities({
    notifications: deduplicatedNotifications,
  });

  // const normalizedNotifications = normalizeNotifications(response.items);

  // normalizedNotifications.map(minifyNotification).forEach(importNotification);

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

export { useNotifications, prefetchNotifications, type DeduplicatedNotification };
