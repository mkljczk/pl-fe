import { useQuery } from '@tanstack/react-query';
import { type MinifiedNotification, minifyNotification } from 'pl-fe/pl-hooks/minifiers/minifyNotification';

import { useAppSelector, useClient } from 'pl-fe/hooks';
import { normalizeNotification, type Notification } from 'pl-fe/normalizers';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';

type Account = ReturnType<typeof selectAccount>;

const importNotification = (notification: MinifiedNotification) => {
  queryClient.setQueryData<MinifiedNotification>(
    ['notifications', 'entities', notification.id],
    existingNotification => existingNotification?.duplicate ? existingNotification : notification,
  );
};

const useNotification = (notificationId: string) => {
  const client = useClient();

  const notificationQuery = useQuery({
    queryKey: ['notifications', 'entities', notificationId],
    queryFn: () => client.notifications.getNotification(notificationId)
      .then(normalizeNotification)
      .then(minifyNotification),
  });

  const data: Notification | null = useAppSelector((state) => {
    const notification = notificationQuery.data;
    if (!notification) return null;
    const account = selectAccount(state, notification.account_id)!;
    // @ts-ignore
    const target = selectAccount(state, notification.target_id)!;
    // @ts-ignore
    const status = state.statuses.get(notification.status_id)!;
    const accounts = selectAccounts(state, notification.account_ids).filter((account): account is Account => account !== undefined);

    return {
      ...notification,
      account,
      target,
      status,
      accounts,
    };
  });

  return { ...notificationQuery, data };
};

export { useNotification, importNotification };
