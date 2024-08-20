import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

const useDeleteGroup = () => {
  const client = useClient();

  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.GROUPS,
    (groupId: string) => client.experimental.groups.deleteGroup(groupId),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroup };
