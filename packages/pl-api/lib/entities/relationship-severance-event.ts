import * as v from 'valibot';

import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/RelationshipSeveranceEvent/} */
const relationshipSeveranceEventSchema = v.object({
  id: v.string(),
  type: z.enum(['domain_block', 'user_domain_block', 'account_suspension']),
  purged: v.string(),
  relationships_count: z.number().optional().catch(undefined),
  created_at: dateSchema,
});

type RelationshipSeveranceEvent = v.InferOutput<typeof relationshipSeveranceEventSchema>;

export { relationshipSeveranceEventSchema, type RelationshipSeveranceEvent };
