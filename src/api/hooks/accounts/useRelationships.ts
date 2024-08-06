import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useClient, useLoggedIn } from 'soapbox/hooks';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';

const useRelationships = (listKey: string[], ids: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchRelationships = (ids: string[]) => client.accounts.getRelationships(ids);

  const { entityMap: relationships, ...result } = useBatchedEntities<Relationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchRelationships,
    { schema: relationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useRelationships };