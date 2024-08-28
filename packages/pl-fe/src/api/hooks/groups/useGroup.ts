import { type Group as BaseGroup, groupSchema } from 'pl-api';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { normalizeGroup, type Group } from 'pl-fe/normalizers';

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
