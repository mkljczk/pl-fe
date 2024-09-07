import { z } from 'zod';

import { accountSchema } from './account';

/** @see {@link https://docs.joinmastodon.org/entities/Suggestion} */
const suggestionSchema = z.preprocess((suggestion: any) => {
  /**
   * Support `/api/v1/suggestions`
   * @see {@link https://docs.joinmastodon.org/methods/suggestions/#v1}
  */
  if (!suggestion) return null;

  if (suggestion?.acct) return {
    source: 'staff',
    sources: ['featured'],
    account: suggestion,
  };

  if (!suggestion.sources) {
    suggestion.sources = [];
    switch (suggestion.source) {
      case 'staff':
        suggestion.sources.push('staff');
        break;
      case 'global':
        suggestion.sources.push('most_interactions');
        break;
    }
  }

  return suggestion;
}, z.object({
  source: z.string().nullable().catch(null),
  sources: z.array(z.string()).catch([]),
  account: accountSchema,
}));

type Suggestion = z.infer<typeof suggestionSchema>;

export { suggestionSchema, type Suggestion };
