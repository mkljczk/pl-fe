import * as v from 'valibot';

import { accountSchema } from './account';
import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/Appeal/} */
const appealSchema = v.object({
  text: v.string(),
  state: v.picklist(['approved', 'rejected', 'pending']),
});

/** @see {@link https://docs.joinmastodon.org/entities/AccountWarning/} */
const accountWarningSchema = v.object({
  id: v.string(),
  action: v.picklist(['none', 'disable', 'mark_statuses_as_sensitive', 'delete_statuses', 'sensitive', 'silence', 'suspend']),
  text: v.fallback(v.string(), ''),
  status_ids: v.fallback(v.array(v.string()), []),
  target_account: accountSchema,
  appeal: v.fallback(v.nullable(appealSchema), null),
  created_at: dateSchema,
});

type AccountWarning = v.InferOutput<typeof accountWarningSchema>;

export { accountWarningSchema, type AccountWarning };
