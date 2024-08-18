import { accountSchema, GroupRoles } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useDismissEntity, useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeAccount } from 'soapbox/normalizers';

import { useGroupRelationship } from './useGroupRelationship';

import type { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types';

const useGroupMembershipRequests = (groupId: string) => {
  const client = useClient();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities(
    path,
    () => client.experimental.groups.getGroupMembershipRequests(groupId),
    {
      schema: accountSchema,
      transform: normalizeAccount,
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.acceptGroupMembershipRequest(groupId, accountId);
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId: string) => {
    const response = await client.experimental.groups.rejectGroupMembershipRequest(groupId, accountId);
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