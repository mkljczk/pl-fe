import { type Group as BaseGroup, groupSchema } from 'pl-api';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroup, type Group } from 'soapbox/normalizers';

import { useGroupRelationship } from './useGroupRelationship';

const useGroup = (groupId: string, refetch = true) => {
  const client = useClient();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntity<BaseGroup, Group>(
    [Entities.GROUPS, groupId],
    () => client.experimental.groups.getGroup(groupId),
    {
      schema: groupSchema,
      transform: normalizeGroup,
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