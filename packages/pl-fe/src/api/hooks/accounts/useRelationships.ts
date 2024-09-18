import { Entities } from 'pl-fe/entity-store/entities';
import { useBatchedEntities } from 'pl-fe/entity-store/hooks/useBatchedEntities';
import { useClient, useLoggedIn } from 'pl-fe/hooks';

import type { Relationship } from 'pl-api';

const useRelationships = (listKey: string[], accountIds: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchRelationships = (accountIds: string[]) =>
    client.accounts.getRelationships(accountIds);

  const { entityMap: relationships, ...result } =
    useBatchedEntities<Relationship>(
      [Entities.RELATIONSHIPS, ...listKey],
      accountIds,
      fetchRelationships,
      { enabled: isLoggedIn },
    );

  return { relationships, ...result };
};

export { useRelationships };
