import { z } from 'zod';

import { accountSchema } from './account';
import { statusSchema } from './status';

/** @see {@link https://docs.gotosocial.org/en/latest/api/swagger.yaml#/definitions/interactionRequest} */
const interactionRequestSchema = z.object({
  accepted_at: z.string().datetime().nullable().catch(null),
  account: accountSchema,
  created_at: z.string().datetime(),
  id: z.string(),
  rejected_at: z.string().datetime().nullable().catch(null),
  reply: statusSchema.nullable().catch(null),
  status: statusSchema.nullable().catch(null),
  type: z.enum(['favourite', 'reply', 'reblog']),
  uri: z.string().nullable().catch(null),
});

type InteractionRequest = z.infer<typeof interactionRequestSchema>;

export { interactionRequestSchema, type InteractionRequest };
