import { z } from 'zod';

import { accountSchema } from './account';
import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/Report/} */
const reportSchema = z.object({
  id: z.string(),
  action_taken: z.boolean().optional().catch(undefined),
  action_taken_at: dateSchema.nullable().catch(null),
  category: z.string().optional().catch(undefined),
  comment: z.string().optional().catch(undefined),
  forwarded: z.boolean().optional().catch(undefined),
  created_at: dateSchema.optional().catch(undefined),
  status_ids: z.array(z.string()).nullable().catch(null),
  rule_ids: z.array(z.string()).nullable().catch(null),
  target_account: accountSchema.nullable().catch(null),
});

type Report = z.infer<typeof reportSchema>;

export { reportSchema, type Report };
