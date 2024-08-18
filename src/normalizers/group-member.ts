import { normalizeAccount } from './account';

import type { GroupMember as BaseGroupMember } from 'pl-api';

const normalizeGroupMember = (groupMember: BaseGroupMember) => ({
  ...groupMember,
  account: normalizeAccount(groupMember.account),
});

type GroupMember = ReturnType<typeof normalizeGroupMember>;

export { normalizeGroupMember, type GroupMember };
