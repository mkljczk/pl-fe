import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';

function useRelationships(listKey: string[], ids: string[]) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  function fetchRelationships(ids: string[]) {
    return api('/api/v1/accounts/relationships', { params: { ids } });
  }

  const { entityMap: relationships, ...result } = useBatchedEntities<Relationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchRelationships,
    { schema: relationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
}

export { useRelationships };