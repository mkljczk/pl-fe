import { groupMemberSchema } from 'pl-api';
import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { normalizeGroupMember } from 'soapbox/normalizers';

import type { Group, GroupMember, GroupRole } from 'pl-api';

const usePromoteGroupMember = (group: Pick<Group, 'id'>, groupMember: Pick<GroupMember, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    ({ account_ids, role }: { account_ids: string[]; role: GroupRole }) => client.experimental.groups.promoteGroupUsers(group.id, account_ids, role),
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]), transform: normalizeGroupMember },
  );

  return createEntity;
};

export { usePromoteGroupMember };
