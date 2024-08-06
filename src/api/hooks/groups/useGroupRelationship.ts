import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

const useGroupRelationship = (groupId: string | undefined) => {
  const client = useClient();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId!],
    () => client.experimental.groups.getGroupRelationships([groupId]),
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