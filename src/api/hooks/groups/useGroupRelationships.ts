import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useApi, useLoggedIn } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

const useGroupRelationships = (listKey: string[], ids: string[]) => {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  const fetchGroupRelationships = (ids: string[]) =>
    api('/api/v1/groups/relationships', { params: { ids } });

  const { entityMap: relationships, ...result } = useBatchedEntities<GroupRelationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchGroupRelationships,
    { schema: groupRelationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useGroupRelationships };