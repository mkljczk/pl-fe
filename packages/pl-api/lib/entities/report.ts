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
  created_at: v.fallback(v.optional(dateSchema), undefined),
  status_ids: v.fallback(v.nullable(v.string()), null),
  rule_ids: v.fallback(v.nullable(v.string()), null),
  target_account: v.fallback(v.nullable(accountSchema), null),
});

type Report = v.InferOutput<typeof reportSchema>;

export { reportSchema, type Report };
