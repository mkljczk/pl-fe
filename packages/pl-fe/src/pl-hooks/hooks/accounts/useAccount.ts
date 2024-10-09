import { useQuery } from '@tanstack/react-query';

import { useRelationship } from 'pl-fe/api/hooks/accounts/useRelationship';
import { useClient } from 'pl-fe/hooks';
import { normalizeAccount } from 'pl-fe/pl-hooks/normalizers/normalizeAccount';
import { queryClient } from 'pl-fe/queries/client';

interface UseAccountOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
  withMoveTarget?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const client = useClient();

  const accountQuery = useQuery({
    queryKey: ['accounts', 'entities', accountId],
    queryFn: () => client.accounts.getAccount(accountId!)
      .then(normalizeAccount),
    enabled: !!accountId,
  });

  const relationshipQuery = useRelationship(accountId, {
    enabled: opts.withRelationship,
  });

  let data;
  if (accountQuery.data) {
    data = {
      ...accountQuery.data,
      relationship: relationshipQuery.relationship,
      moved: opts.withMoveTarget && queryClient.getQueryData(['accounts', 'entities', accountQuery.data?.moved_id]) as MinifiedAccount || null,
    };
  } else data = null;

  return { ...accountQuery, data };
};

export { useAccount };
