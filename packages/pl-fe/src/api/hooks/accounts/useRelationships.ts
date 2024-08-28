import { type Relationship, relationshipSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useClient, useLoggedIn } from 'soapbox/hooks';

const useRelationships = (listKey: string[], accountIds: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchRelationships = (accountIds: string[]) => client.accounts.getRelationships(accountIds);

  const { entityMap: relationships, ...result } = useBatchedEntities<Relationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    accountIds,
    fetchRelationships,
    { schema: relationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useRelationships };
