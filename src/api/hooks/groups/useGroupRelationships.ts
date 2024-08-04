import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useClient, useLoggedIn } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

const useGroupRelationships = (listKey: string[], ids: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchGroupRelationships = (ids: string[]) =>
    client.request('/api/v1/groups/relationships', { params: { id: ids } });

  const { entityMap: relationships, ...result } = useBatchedEntities<GroupRelationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchGroupRelationships,
    { schema: groupRelationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useGroupRelationships };