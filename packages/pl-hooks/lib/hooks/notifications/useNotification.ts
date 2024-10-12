import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useClient } from 'pl-fe/hooks';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';
import { queryClient } from 'pl-hooks/client';
import { type NormalizedNotification, normalizeNotification } from 'pl-hooks/normalizers/normalizeNotifications';

import { useAccount } from '../accounts/useAccount';
import { useStatus } from '../statuses/useStatus';

type Account = ReturnType<typeof selectAccount>;

const importNotification = (notification: NormalizedNotification) => {
  queryClient.setQueryData<NormalizedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : notification,
  );
};

const useNotification = (notificationId: string) => {
  const client = useClient();

  const notificationQuery = useQuery({
    queryKey: ['notifications', 'entities', notificationId],
    queryFn: () => client.notifications.getNotification(notificationId)
      .then(normalizeNotification),
  });

  const notification = notificationQuery.data;

  const accountQuery = useAccount(notification?.account_id);
  const moveTargetAccountQuery = useAccount(notification?.target_id);
  const statusQuery = useStatus(notification?.status_id);

  const data: Notification | null = useAppSelector((state) => {
    if (!notification) return null;
    const accounts = selectAccounts(state, notification.account_ids).filter((account): account is Account => account !== undefined);

    return {
      ...notification,
      account: accountQuery.data,
      target: moveTargetAccountQuery.data,
      status: statusQuery.data,
      accounts,
    };
  });

  return { ...notificationQuery, data };
};

export { useNotification, importNotification };
