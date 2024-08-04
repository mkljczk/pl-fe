import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { GroupMember, groupMemberSchema } from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

const useGroupMembers = (groupId: string, role: GroupRoles) => {
  const client = useClient();

  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    () => client.request(`/api/v1/groups/${groupId}/memberships?role=${role}`),
    { schema: groupMemberSchema },
  );

  return {
    ...result,
    groupMembers: entities,
  };
};

export { useGroupMembers };