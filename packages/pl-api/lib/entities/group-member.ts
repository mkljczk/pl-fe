import z from 'zod';

import { accountSchema } from './account';

enum GroupRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user'
}

type GroupRole =`${GroupRoles}`;

const groupMemberSchema = z.object({
  id: z.string(),
  account: accountSchema,
  role: z.nativeEnum(GroupRoles),
});

type GroupMember = z.infer<typeof groupMemberSchema>;

export { groupMemberSchema, type GroupMember, GroupRoles, type GroupRole };
