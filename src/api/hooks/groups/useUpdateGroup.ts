import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupSchema } from 'soapbox/schemas';

interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
  group_visibility?: string;
  discoverable?: boolean;
}

function useUpdateGroup(groupId: string) {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.GROUPS], (params: UpdateGroupParams) => {
    const formData = new FormData();

    Object.entries(params).forEach(([key, value]) => formData.append(key, value));

    return api(`/api/v1/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': '' },
      body: formData,
    });
  }, { schema: groupSchema });

  return {
    updateGroup: createEntity,
    ...rest,
  };
}

export { useUpdateGroup };
