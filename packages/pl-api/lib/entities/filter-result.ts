import { z } from 'zod';

import { filterSchema } from './filter';

/** @see {@link https://docs.joinmastodon.org/entities/FilterResult/} */
const filterResultSchema = z.object({
  filter: filterSchema,
  keyword_matches: z.array(z.string()).nullable().catch(null),
  status_matches: z.array(z.string()).nullable().catch(null),
});

type FilterResult = z.infer<typeof filterResultSchema>;

export { filterResultSchema, type FilterResult };
