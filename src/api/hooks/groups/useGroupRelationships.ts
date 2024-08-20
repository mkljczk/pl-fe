import { type GroupRelationship, groupRelationshipSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities';
import { useClient, useLoggedIn } from 'soapbox/hooks';

const useGroupRelationships = (listKey: string[], groupIds: string[]) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const fetchGroupRelationships = (groupIds: string[]) =>
    client.experimental.groups.getGroupRelationships(groupIds);

  const { entityMap: relationships, ...result } = useBatchedEntities<GroupRelationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    groupIds,
    fetchGroupRelationships,
    { schema: groupRelationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
};

export { useGroupRelationships };
