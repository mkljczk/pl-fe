import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

import type { Group } from 'pl-api';

const useDeleteGroupStatus = (group: Pick<Group, 'id'>, statusId: string) => {
  const client = useClient();
  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.STATUSES,
    () => client.experimental.groups.deleteGroupStatus(group.id, statusId),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroupStatus };
