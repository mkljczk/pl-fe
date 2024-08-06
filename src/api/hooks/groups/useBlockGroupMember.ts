import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

import type { Account, Group } from 'soapbox/schemas';

const useBlockGroupMember = (group: Group, account: Account) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, account.id],
    (accountIds: string[]) => client.experimental.groups.blockGroupUsers(group.id, accountIds),
  );

  return createEntity;
};

export { useBlockGroupMember };