import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks/useClient';
import { normalizeGroup } from 'pl-fe/normalizers';

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
    { transform: normalizeGroup },
  );

  return {
    updateGroup: createEntity,
    ...rest,
  };
};

export { useUpdateGroup };
