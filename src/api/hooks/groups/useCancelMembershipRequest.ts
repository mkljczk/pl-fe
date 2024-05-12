import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi, useOwnAccount } from 'soapbox/hooks';

import type { Group } from 'soapbox/schemas';

const useCancelMembershipRequest = (group: Group) => {
  const api = useApi();
  const { account: me } = useOwnAccount();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS],
    () => api(`/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject`, { method: 'POST' }),
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
};

export { useCancelMembershipRequest };
