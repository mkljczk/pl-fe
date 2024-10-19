import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks/useClient';
import { normalizeGroup, type Group } from 'pl-fe/normalizers';

import { useGroupRelationship } from './useGroupRelationship';

import type { Group as BaseGroup } from 'pl-api';

const useGroup = (groupId: string, refetch = true) => {
  const client = useClient();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntity<BaseGroup, Group>(
    [Entities.GROUPS, groupId],
    () => client.experimental.groups.getGroup(groupId),
    {
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
