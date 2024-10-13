import * as v from 'valibot';

import { coerceObject } from './utils';

const interactionPolicyEntrySchema = z.enum(['public', 'followers', 'following', 'mutuals', 'mentioned', 'author', 'me']);

const interactionPolicyRuleSchema = coerceObject({
  always: z.array(interactionPolicyEntrySchema).default(['public']),
  with_approval: z.array(interactionPolicyEntrySchema).default([]),
});

/** @see {@link https://docs.gotosocial.org/en/latest/api/swagger/} */
const interactionPolicySchema = coerceObject({
  can_favourite: interactionPolicyRuleSchema,
  can_reblog: interactionPolicyRuleSchema,
  can_reply: interactionPolicyRuleSchema,
});

type InteractionPolicy = v.InferOutput<typeof interactionPolicySchema>;

const interactionPoliciesSchema = coerceObject({
  public: interactionPolicySchema,
  unlisted: interactionPolicySchema,
  private: interactionPolicySchema,
  direct: interactionPolicySchema,
});

type InteractionPolicies = v.InferOutput<typeof interactionPoliciesSchema>;

export { interactionPolicySchema, interactionPoliciesSchema, type InteractionPolicy, type InteractionPolicies };

