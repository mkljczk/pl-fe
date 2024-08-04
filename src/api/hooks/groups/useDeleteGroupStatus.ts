import { useClient } from 'soapbox/hooks';
import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';

import type { Group } from 'soapbox/schemas';

const useDeleteGroupStatus = (group: Group, statusId: string) => {
  const client = useClient();
  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.STATUSES,
    () => client.request(`/api/v1/groups/${group.id}/statuses/${statusId}`, { method: 'DELETE' }),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteGroupStatus };