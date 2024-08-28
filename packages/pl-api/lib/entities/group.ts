import z from 'zod';

import { customEmojiSchema } from './custom-emoji';
import { groupRelationshipSchema } from './group-relationship';
import { filteredArray } from './utils';

const groupSchema = z.object({
  avatar: z.string().catch(''),
  avatar_static: z.string().catch(''),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  display_name: z.string().catch(''),
  domain: z.string().catch(''),
  emojis: filteredArray(customEmojiSchema),
  header: z.string().catch(''),
  header_static: z.string().catch(''),
  id: z.coerce.string(),
  locked: z.boolean().catch(false),
  membership_required: z.boolean().catch(false),
  members_count: z.number().catch(0),
  owner: z.object({ id: z.string() }).nullable().catch(null),
  note: z.string().transform(note => note === '<p></p>' ? '' : note).catch(''),
  relationship: groupRelationshipSchema.nullable().catch(null), // Dummy field to be overwritten later
  statuses_visibility: z.string().catch('public'),
  uri: z.string().catch(''),
  url: z.string().catch(''),

  avatar_description: z.string().catch(''),
  header_description: z.string().catch(''),
});

type Group = z.infer<typeof groupSchema>;

export { groupSchema, type Group };
