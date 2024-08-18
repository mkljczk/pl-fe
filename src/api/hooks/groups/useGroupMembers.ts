import { groupMemberSchema, type GroupMember as BaseGroupMember, type GroupRoles } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroupMember, type GroupMember } from 'soapbox/normalizers';

const useGroupMembers = (groupId: string, role: GroupRoles) => {
  const client = useClient();

  const { entities, ...result } = useEntities<BaseGroupMember, GroupMember>(
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