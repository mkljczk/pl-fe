import { Entities } from 'soapbox/entity-store/entities';
import { useDismissEntity, useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { accountSchema } from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

import { useGroupRelationship } from './useGroupRelationship';

import type { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types';

const useGroupMembershipRequests = (groupId: string) => {
  const client = useClient();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities(
    path,
    () => client.request(`/api/v1/groups/${groupId}/membership_requests`),
    {
      schema: accountSchema,
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.request(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`, { method: 'POST' });
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.request(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`, { method: 'POST' });
    invalidate();
    return response;
  });

  return {
    accounts: entities,
    refetch: fetchEntities,
    authorize,
    reject,
    ...rest,
  };
};

export { useGroupMembershipRequests };