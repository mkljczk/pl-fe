import * as v from 'valibot';

import { accountSchema } from './account';
import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/Report/} */
const reportSchema = v.object({
  id: v.string(),
  action_taken: v.fallback(v.optional(v.boolean()), undefined),
  action_taken_at: v.fallback(v.nullable(dateSchema), null),
  category: v.fallback(v.optional(v.string()), undefined),
  comment: v.fallback(v.optional(v.string()), undefined),
  forwarded: v.fallback(v.optional(v.boolean()), undefined),
  created_at: dateSchema.optional().catch(undefined),
  status_ids: z.array(v.string()).nullable().catch(null),
  rule_ids: z.array(v.string()).nullable().catch(null),
  target_account: v.fallback(v.nullable(accountSchema), null),
});

type Report = v.InferOutput<typeof reportSchema>;

export { reportSchema, type Report };
