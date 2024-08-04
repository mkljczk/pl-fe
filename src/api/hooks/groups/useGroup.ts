import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useClient } from 'soapbox/hooks';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { type Group, groupSchema } from 'soapbox/schemas';

import { useGroupRelationship } from './useGroupRelationship';

const useGroup = (groupId: string, refetch = true) => {
  const client = useClient();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntity<Group>(
    [Entities.GROUPS, groupId],
    () => client.request(`/api/v1/groups/${groupId}`),
    {
      schema: groupSchema,
      refetch,
      enabled: !!groupId,
    },
  );
  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
};

export { useGroup };