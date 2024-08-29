import { z } from 'zod';

import { accountSchema } from './account';
import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/Appeal/} */
const appealSchema = z.object({
  text: z.string(),
  state: z.enum(['approved', 'rejected', 'pending']),
});

/** @see {@link https://docs.joinmastodon.org/entities/AccountWarning/} */
const accountWarningSchema = z.object({
  id: z.string(),
  action: z.enum(['none', 'disable', 'mark_statuses_as_sensitive', 'delete_statuses', 'sensitive', 'silence', 'suspend']),
  text: z.string().catch(''),
  status_ids: z.array(z.string()).catch([]),
  target_account: accountSchema,
  appeal: appealSchema.nullable().catch(null),
  created_at: dateSchema,
});

type AccountWarning = z.infer<typeof accountWarningSchema>;

export { accountWarningSchema, type AccountWarning };
