import { groupMemberSchema, type GroupMember, type GroupRoles } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroupMember } from 'soapbox/normalizers/group-member';

const useGroupMembers = (groupId: string, role: GroupRoles) => {
  const client = useClient();

  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    () => client.experimental.groups.getGroupMemberships(groupId, role),
    { schema: groupMemberSchema, transform: normalizeGroupMember },
  );

  return {
    ...result,
    groupMembers: entities,
  };
};

export { useGroupMembers };