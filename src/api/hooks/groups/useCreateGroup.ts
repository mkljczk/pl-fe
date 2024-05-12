import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupSchema } from 'soapbox/schemas';

interface CreateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File;
  header?: File;
  group_visibility?: 'members_only' | 'everyone';
  discoverable?: boolean;
  tags?: string[];
}

function useCreateGroup() {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.GROUPS, 'search', ''], (params: CreateGroupParams) => {
    const formData = new FormData();

    Object.entries(params).forEach(([key, value]) => formData.append(key, value));

    return api('/api/v1/groups', {
      method: 'POST',
      headers: { 'Content-Type': '' },
      body: formData,
    });
  }, { schema: groupSchema });

  return {
    createGroup: createEntity,
    ...rest,
  };
}

export { useCreateGroup, type CreateGroupParams };