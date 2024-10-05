import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

import { useAccount, useGroup } from 'pl-fe/api/hooks';
import { useAppSelector, useClient } from 'pl-fe/hooks';
import { queryClient } from 'pl-fe/queries/client';
import { selectAccount, selectAccounts } from 'pl-fe/selectors';

import { type MinifiedStatus, minifyStatus } from '../../minifiers/minifyStatus';
import { normalizeStatus } from '../../normalizers/normalizeStatus';

// import type { Group } from 'pl-fe/normalizers';

type Account = ReturnType<typeof selectAccount>;

const importStatus = (status: MinifiedStatus) => {
  queryClient.setQueryData<MinifiedStatus>(
    ['statuses', 'entities', status.id],
    status,
  );
};

const useStatus = (statusId?: string) => {
  const client = useClient();
  const intl = useIntl();

  const statusQuery = useQuery({
    queryKey: ['statuses', 'entities', statusId],
    queryFn: () => client.statuses.getStatus(statusId!, {
      language: intl.locale,
    })
      .then(normalizeStatus)
      .then(minifyStatus),
    enabled: !!statusId,
  });

  const status = statusQuery.data;

  const { account } = useAccount(status?.account_id || undefined);
  const { group } = useGroup(status?.group_id || undefined);

  // : (Status & {
  //   account: Account;
  //   accounts: Array<Account>;
  //   group: Group | null;
  //   reblog: Status | null;
  // }) | null
  const data = useAppSelector((state) => {
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
