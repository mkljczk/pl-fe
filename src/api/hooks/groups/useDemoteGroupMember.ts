import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';
import { groupMemberSchema } from 'soapbox/schemas';

import type { GroupRole } from 'pl-api';
import type { Group, GroupMember } from 'soapbox/schemas';

const useDemoteGroupMember = (group: Group, groupMember: GroupMember) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    ({ account_ids, role }: { account_ids: string[]; role: GroupRole }) => client.experimental.groups.demoteGroupUsers(group.id, account_ids, role),
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
};

export { useDemoteGroupMember };