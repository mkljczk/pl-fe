import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';
import { useClient } from 'soapbox/hooks';

interface UseRelationshipOpts {
  enabled?: boolean;
}

const useRelationship = (accountId: string | undefined, opts: UseRelationshipOpts = {}) => {
  const client = useClient();
  const { enabled = false } = opts;

  const { entity: relationship, ...result } = useEntity<Relationship>(
    [Entities.RELATIONSHIPS, accountId!],
    () => client.request(`/api/v1/accounts/relationships?id[]=${accountId}`),
    {
      enabled: enabled && !!accountId,
      schema: z.array(relationshipSchema).nonempty().transform(arr => arr[0]),
    },
  );

  return { relationship, ...result };
};

export { useRelationship };