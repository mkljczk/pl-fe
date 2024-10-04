import { useQuery } from '@tanstack/react-query';
import { useRelationship } from 'pl-fe/api/hooks/accounts/useRelationship';

import { useAppSelector, useClient } from 'pl-fe/hooks';

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
      .then(normalizeAccount)
      .then(minifyAccount),
    enabled: !!accountId,
  });

  const relationshipQuery = useRelationship(accountId, {
    enabled: opts.withRelationship,
  });

  const movedQuery = useAccount(opts.withMoveTarget && accountQuery.data?.moved_id || undefined);

  const data: Account | null = useAppSelector((state) => {
    const account = accountQuery.data;
    if (!account) return null;

    return {
      ...account,
      account,
      relationship: relationshipQuery.relationship,
      moved: movedQuery.data || null,
    };
  });

  return { ...accountQuery, data };
};
