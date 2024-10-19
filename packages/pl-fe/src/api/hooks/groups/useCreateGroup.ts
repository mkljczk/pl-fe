import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks/useCreateEntity';
import { useClient } from 'pl-fe/hooks/useClient';
import { normalizeGroup, type Group } from 'pl-fe/normalizers';

import type { Group as BaseGroup, CreateGroupParams } from 'pl-api';

const useCreateGroup = () => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity<BaseGroup, Group, CreateGroupParams>(
    [Entities.GROUPS, 'search', ''],
    (params: CreateGroupParams) => client.experimental.groups.createGroup(params),
    { transform: normalizeGroup },
  );

  return {
    createGroup: createEntity,
    ...rest,
  };
};

export { useCreateGroup };
