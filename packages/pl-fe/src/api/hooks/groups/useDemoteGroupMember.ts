import { groupMemberSchema, type Group, type GroupMember as GroupMember, type GroupRole } from 'pl-api';
import { z } from 'zod';

import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';
import { normalizeGroupMember } from 'pl-fe/normalizers';

const useDemoteGroupMember = (group: Pick<Group, 'id'>, groupMember: Pick<GroupMember, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    ({ account_ids, role }: { account_ids: string[]; role: GroupRole }) => client.experimental.groups.demoteGroupUsers(group.id, account_ids, role),
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]), transform: normalizeGroupMember },
  );

  return createEntity;
};

export { useDemoteGroupMember };
