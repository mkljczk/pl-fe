import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { groupSchema } from 'soapbox/schemas';

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

  const { createEntity, ...rest } = useCreateEntity([Entities.GROUPS], (params: UpdateGroupParams) =>
    client.request(`/api/v1/groups/${groupId}`, {
      method: 'PUT',
      contentType: '',
      body: params,
    }), { schema: groupSchema });

  return {
    updateGroup: createEntity,
    ...rest,
  };
};

export { useUpdateGroup };
