import { groupSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroup } from 'soapbox/normalizers';

interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
  group_visibility?: string;
  discoverable?: boolean;
}

const useUpdateGroup = (groupId: string) => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.GROUPS],
    (params: UpdateGroupParams) => client.experimental.groups.updateGroup(groupId, params),
    { schema: groupSchema, transform: normalizeGroup },
  );

  return {
    updateGroup: createEntity,
    ...rest,
  };
};

export { useUpdateGroup };
