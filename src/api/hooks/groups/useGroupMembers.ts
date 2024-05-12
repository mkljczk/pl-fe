import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { GroupMember, groupMemberSchema } from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

import { useApi } from '../../../hooks/useApi';

const useGroupMembers = (groupId: string, role: GroupRoles) => {
  const api = useApi();

  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    () => api(`/api/v1/groups/${groupId}/memberships?role=${role}`),
    { schema: groupMemberSchema },
  );

  return {
    ...result,
    groupMembers: entities,
  };
};

export { useGroupMembers };