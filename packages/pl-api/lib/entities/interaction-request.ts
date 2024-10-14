import * as v from 'valibot';

import { accountSchema } from './account';
import { statusSchema } from './status';

/** @see {@link https://docs.gotosocial.org/en/latest/api/swagger.yaml#/definitions/interactionRequest} */
const interactionRequestSchema = v.object({
  accepted_at: v.fallback(v.nullable(z.string().datetime()), null),
  account: accountSchema,
  created_at: z.string().datetime(),
  id: v.string(),
  rejected_at: v.fallback(v.nullable(z.string().datetime()), null),
  reply: v.fallback(v.nullable(statusSchema), null),
  status: v.fallback(v.nullable(statusSchema), null),
  type: v.picklist(['favourite', 'reply', 'reblog']),
  uri: v.fallback(v.nullable(v.string()), null),
});

type InteractionRequest = v.InferOutput<typeof interactionRequestSchema>;

export { interactionRequestSchema, type InteractionRequest };
