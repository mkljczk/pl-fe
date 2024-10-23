import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { queryClient, usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { importEntities } from 'pl-hooks/importer';
import { type Account, normalizeAccount } from 'pl-hooks/normalizers/account';

import { useAccountRelationship } from './use-account-relationship';

import type { PlApiClient } from 'pl-api';

interface UseAccountOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
  withMoveTarget?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();

  const accountQuery = useQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: () => client.accounts.getAccount(accountId!)
      .then(normalizeAccount),
    enabled: !!accountId,
  }, queryClient);

  const relationshipQuery = useAccountRelationship(opts.withRelationship ? accountId : undefined);

  let data;

  if (accountQuery.data) {
    data = {
      ...accountQuery.data,
      relationship: relationshipQuery.data,
      moved: opts.withMoveTarget && queryClient.getQueryData(['accounts', 'entities', accountQuery.data?.moved_id]) as Account || null,
    };
  } else data = null;

  return { ...accountQuery, data };
};

const prefetchAccount = (client: PlApiClient, accountId: string) =>
  queryClient.prefetchQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: () => client.accounts.getAccount(accountId!)
      .then(account => {
        importEntities({ accounts: [account] }, { withParents: false });

        return normalizeAccount(account);
      }),
  });

export { useAccount, prefetchAccount, type UseAccountOpts };
