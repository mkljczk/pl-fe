import z from 'zod';

import { GroupRoles } from './group-member';

const groupRelationshipSchema = z.object({
  id: z.string(),
  member: z.boolean().catch(false),
  role: z.nativeEnum(GroupRoles).catch(GroupRoles.USER),
  requested: z.boolean().catch(false),
  owner: z.boolean().catch(false),
});

type GroupRelationship = z.infer<typeof groupRelationshipSchema>;

export { groupRelationshipSchema, type GroupRelationship };