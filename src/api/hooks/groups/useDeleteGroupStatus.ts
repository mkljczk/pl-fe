import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';

import type { Group } from 'soapbox/schemas';

function useDeleteGroupStatus(group: Group, statusId: string) {
  const api = useApi();
  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.STATUSES,
    () => api(`/api/v1/groups/${group.id}/statuses/${statusId}`, { method: 'DELETE' }),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
}

export { useDeleteGroupStatus };