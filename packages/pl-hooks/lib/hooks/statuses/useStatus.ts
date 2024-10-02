import { useQuery } from '@tanstack/react-query';

import { useAccount, useGroup } from 'pl-fe/api/hooks';
import { useAppSelector, useClient } from 'pl-fe/hooks';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';

import { type MinifiedStatus, minifyStatus } from '../../minifiers/minifyStatus';
import { normalizeStatus, type Status } from '../../normalizers/normalizeStatus';
import type { Group } from 'pl-fe/normalizers';

type Account = ReturnType<typeof selectAccount>;

const importStatus = (status: MinifiedStatus) => {
  queryClient.setQueryData<MinifiedStatus>(
    ['statuses', 'entities', status.id],
    status,
  );
};

const useStatus = (statusId: string) => {
  const client = useClient();

  const statusQuery = useQuery({
    queryKey: ['statuses', 'entities', statusId],
    queryFn: () => client.statuses.getStatus(statusId)
      .then(normalizeStatus)
      .then(minifyStatus),
  });

  const status = statusQuery.data;

  const { account } = useAccount(status?.account_id || undefined);
  const { group } = useGroup(status?.group_id || undefined);

  const data: Status & {
    group: Group;
  } | null = useAppSelector((state) => {
    if (!status) return null;
    const accounts = selectAccounts(state, status.account_ids).filter((account): account is Account => account !== undefined);

    return {
      ...status,
      account,
      accounts,
      group,
    };
  });

  return { ...statusQuery, data };
};

export { useStatus, importStatus };
