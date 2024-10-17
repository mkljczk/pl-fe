import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from 'pl-hooks/contexts/api-client';
import { usePlHooksQueryClient } from 'pl-hooks/contexts/query-client';
import { type Account, normalizeAccount } from 'pl-hooks/normalizers/normalizeAccount';

import { useAccountRelationship } from './useAccountRelationship';

interface UseAccountOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
  withMoveTarget?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

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

export { useAccount };
