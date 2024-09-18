import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { type Group, normalizeGroup } from 'pl-fe/normalizers';

import type { Group as BaseGroup } from 'pl-api';

interface CreateGroupParams {
  display_name: string;
  note?: string;
  avatar?: File;
  header?: File;
  group_visibility?: 'members_only' | 'everyone';
  discoverable?: boolean;
  tags?: string[];
}

const useCreateGroup = () => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity<
    BaseGroup,
    Group,
    CreateGroupParams
  >(
    [Entities.GROUPS, 'search', ''],
    (params: CreateGroupParams) =>
      client.experimental.groups.createGroup(params),
    { transform: normalizeGroup },
  );

  return {
    createGroup: createEntity,
    ...rest,
  };
};

export { useCreateGroup, type CreateGroupParams };
