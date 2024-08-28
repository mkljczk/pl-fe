import { z } from 'zod';

import { accountSchema } from './account';

/** @see {@link https://docs.joinmastodon.org/entities/Suggestion} */
const suggestionSchema = z.preprocess((suggestion: any) => {
  /**
   * Support `/api/v1/suggestions`
   * @see {@link https://docs.joinmastodon.org/methods/suggestions/#v1}
  */
  if (suggestion?.acct) return {
    source: 'staff',
    sources: 'featured',
    account: suggestion,
  };
  return suggestion;
}, z.object({
  source: z.string(),
  sources: z.array(z.string()),
  account: accountSchema,
}));

type Suggestion = z.infer<typeof suggestionSchema>;

export { suggestionSchema, type Suggestion };
