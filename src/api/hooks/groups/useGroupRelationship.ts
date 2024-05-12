import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

const useGroupRelationship = (groupId: string | undefined) => {
  const api = useApi();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId!],
    () => api(`/api/v1/groups/relationships?id[]=${groupId}`),
    {
      enabled: !!groupId,
      schema: z.array(groupRelationshipSchema).nonempty().transform(arr => arr[0]),
    },
  );

  return {
    groupRelationship,
    ...result,
  };
};

export { useGroupRelationship };