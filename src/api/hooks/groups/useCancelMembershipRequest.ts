import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient, useOwnAccount } from 'soapbox/hooks';

import type { Group } from 'soapbox/schemas';

const useCancelMembershipRequest = (group: Group) => {
  const client = useClient();
  const { account: me } = useOwnAccount();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS],
    () => client.request(`/client.request/v1/groups/${group.id}/membership_requests/${me?.id}/reject`, { method: 'POST' }),
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
};

export { useCancelMembershipRequest };
