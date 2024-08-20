import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useClient } from 'soapbox/hooks';

import type { Group } from 'pl-api';
import type { Account } from 'soapbox/normalizers';

const useBlockGroupMember = (group: Pick<Group, 'id'>, account: Pick<Account, 'id'>) => {
  const client = useClient();

  const { createEntity } = useCreateEntity(
    [Entities.GROUP_MEMBERSHIPS, account.id],
    (accountIds: string[]) => client.experimental.groups.blockGroupUsers(group.id, accountIds),
  );

  return createEntity;
};

export { useBlockGroupMember };
