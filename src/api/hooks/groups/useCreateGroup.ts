import { groupSchema, type Group as BaseGroup } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroup, type Group } from 'soapbox/normalizers';

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

  const { createEntity, ...rest } = useCreateEntity<BaseGroup, Group, CreateGroupParams>(
    [Entities.GROUPS, 'search', ''],
    (params: CreateGroupParams) => client.experimental.groups.createGroup(params),
    { schema: groupSchema, transform: normalizeGroup },
  );

  return {
    createGroup: createEntity,
    ...rest,
  };
};

export { useCreateGroup, type CreateGroupParams };