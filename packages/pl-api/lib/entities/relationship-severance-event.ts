import { z } from 'zod';

import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/RelationshipSeveranceEvent/} */
const relationshipSeveranceEventSchema = z.object({
  id: z.string(),
  type: z.enum(['domain_block', 'user_domain_block', 'account_suspension']),
  purged: z.string(),
  relationships_count: z.number().optional().catch(undefined),
  created_at: dateSchema,
});

type RelationshipSeveranceEvent = z.infer<typeof relationshipSeveranceEventSchema>;

export { relationshipSeveranceEventSchema, type RelationshipSeveranceEvent };
